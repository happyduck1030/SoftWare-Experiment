import SalaryStandard from '../../models/SalaryStandard.js';
import SalaryItem from '../../models/SalaryItem.js';
import Position from '../../models/Position.js';
import Organization from '../../models/Organization.js';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/responseFormatter.js';

// 将 SalaryStandard 文档按职位聚合成一个标准对象
const aggregateStandards = async (query = {}) => {
  const docs = await SalaryStandard.find({
    is_deleted: false,
    ...query
  })
    .populate({
      path: 'pos_id',
      populate: { path: 'org_id' }
    })
    .populate('item_id');

  const map = new Map();

  docs.forEach(doc => {
    if (!doc.pos_id) return;
    const posId = doc.pos_id._id.toString();
    if (!map.has(posId)) {
      map.set(posId, {
        _id: posId,
        pos_id: doc.pos_id,
        items: {},
        reviewed: doc.reviewed,
        created_at: doc.created_at
      });
    }
    const agg = map.get(posId);
    agg.items[doc.item_id._id.toString()] = doc.amount;
    // 如果有任一未复核，则整体认为未复核
    if (!doc.reviewed) agg.reviewed = false;
    // 取最早的创建时间
    if (!agg.created_at || doc.created_at < agg.created_at) {
      agg.created_at = doc.created_at;
    }
  });

  return Array.from(map.values());
};

// @desc 获取薪酬标准列表（按职位聚合，携带 items 对象）
// @route GET /api/admin/salary-standards
// @access Private/Admin
export const getSalaryStandards = async (req, res) => {
  try {
    const { page = 1, limit = 50, pos_id } = req.query;
    const skip = (page - 1) * limit;

    const baseQuery = {};
    if (pos_id) baseQuery.pos_id = pos_id;

    const aggregated = await aggregateStandards(baseQuery);

    const total = aggregated.length;
    const data = aggregated.slice(skip, skip + parseInt(limit));

    paginatedResponse(res, data, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get salary standards error:', error);
    errorResponse(res, error.message || '获取薪酬标准列表失败', 500);
  }
};

// @desc 创建薪酬标准（为某职位批量设置多个项目金额）
// @route POST /api/admin/salary-standards
// @access Private/Admin
export const createSalaryStandard = async (req, res) => {
  try {
    const { pos_id, items } = req.body;

    if (!pos_id || !items || typeof items !== 'object') {
      return errorResponse(res, '职位ID和薪酬项目金额必填', 400);
    }

    const position = await Position.findById(pos_id).populate('org_id');
    if (!position) {
      return errorResponse(res, '职位不存在', 404);
    }

    const docsToCreate = [];
    for (const [itemId, amount] of Object.entries(items)) {
      const num = Number(amount || 0);
      if (num <= 0) continue;
      docsToCreate.push({
        pos_id,
        item_id: itemId,
        amount: num,
        reviewed: false,
        created_by: req.user?._id
      });
    }

    if (!docsToCreate.length) {
      return errorResponse(res, '至少设置一个大于0的薪酬项目金额', 400);
    }

    await SalaryStandard.insertMany(docsToCreate);

    // 返回聚合后的该职位标准
    const [aggregated] = await aggregateStandards({ pos_id });
    successResponse(res, aggregated, '薪酬标准创建成功', 201);
  } catch (error) {
    console.error('Create salary standard error:', error);
    errorResponse(res, error.message || '薪酬标准创建失败', 500);
  }
};

// 其他操作（复核/更新/删除）这里先预留简单实现，方便后续页面使用

// @desc 复核薪酬标准
// @route PUT /api/admin/salary-standards/:id/review
export const reviewSalaryStandard = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    // 兼容两种传参：具体标准记录ID，或职位ID（聚合列表返回的是职位ID）
    const updated = await SalaryStandard.updateMany(
      { is_deleted: false, $or: [{ _id: id }, { pos_id: id }] },
      {
        reviewed: !!approved,
        reviewed_by: req.user?._id,
        reviewed_at: new Date()
      }
    );

    if (!updated.matchedCount) {
      return errorResponse(res, '薪酬标准不存在', 404);
    }

    successResponse(res, null, approved ? '薪酬标准已通过复核' : '薪酬标准已标记为未通过');
  } catch (error) {
    console.error('Review salary standard error:', error);
    errorResponse(res, error.message || '复核失败', 500);
  }
};

// @desc 删除薪酬标准（软删除某职位的全部标准）
// @route DELETE /api/admin/salary-standards/:id
export const deleteSalaryStandard = async (req, res) => {
  try {
    const { id } = req.params;
    const standard = await SalaryStandard.findById(id);
    if (!standard) {
      return errorResponse(res, '薪酬标准不存在', 404);
    }

    // 标记该职位下所有标准为删除
    await SalaryStandard.updateMany(
      { pos_id: standard.pos_id, is_deleted: false },
      { is_deleted: true }
    );

    successResponse(res, null, '薪酬标准已删除');
  } catch (error) {
    console.error('Delete salary standard error:', error);
    errorResponse(res, error.message || '删除失败', 500);
  }
};

export default {
  getSalaryStandards,
  createSalaryStandard,
  reviewSalaryStandard,
  deleteSalaryStandard
};


