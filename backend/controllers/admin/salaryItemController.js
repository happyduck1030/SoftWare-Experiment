import SalaryItem from '../../models/SalaryItem.js';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/responseFormatter.js';

// @desc    获取薪酬项目列表
// @route   GET /api/admin/salary-items
// @access  Private/Admin
export const getSalaryItems = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, is_active } = req.query;

    const query = { is_deleted: false };
    
    if (search) {
      query.$or = [
        { item_name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (is_active !== undefined) {
      query.is_active = is_active === 'true';
    }

    const skip = (page - 1) * limit;

    const items = await SalaryItem.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ created_at: -1 });

    const total = await SalaryItem.countDocuments(query);

    paginatedResponse(res, items, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get salary items error:', error);
    errorResponse(res, error.message || '获取薪酬项目列表失败', 500);
  }
};

// @desc    获取单个薪酬项目详情
// @route   GET /api/admin/salary-items/:id
// @access  Private/Admin
export const getSalaryItemById = async (req, res) => {
  try {
    const item = await SalaryItem.findById(req.params.id);

    if (!item) {
      return errorResponse(res, '薪酬项目不存在', 404);
    }

    successResponse(res, item, '获取薪酬项目详情成功');
  } catch (error) {
    console.error('Get salary item error:', error);
    errorResponse(res, error.message || '获取薪酬项目详情失败', 500);
  }
};

// @desc    创建薪酬项目
// @route   POST /api/admin/salary-items
// @access  Private/Admin
export const createSalaryItem = async (req, res) => {
  try {
    const { item_name, description, is_active } = req.body;

    if (!item_name) {
      return errorResponse(res, '项目名称不能为空', 400);
    }

    // 检查项目名称是否已存在
    const existingItem = await SalaryItem.findOne({
      item_name,
      is_deleted: false
    });

    if (existingItem) {
      return errorResponse(res, '该薪酬项目名称已存在', 400);
    }

    const item = await SalaryItem.create({
      item_name,
      description,
      is_active: is_active !== undefined ? is_active : true
    });

    successResponse(res, item, '薪酬项目创建成功', 201);
  } catch (error) {
    console.error('Create salary item error:', error);
    errorResponse(res, error.message || '薪酬项目创建失败', 500);
  }
};

// @desc    更新薪酬项目
// @route   PUT /api/admin/salary-items/:id
// @access  Private/Admin
export const updateSalaryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { item_name, description, is_active } = req.body;

    const item = await SalaryItem.findById(id);
    if (!item) {
      return errorResponse(res, '薪酬项目不存在', 404);
    }

    // 如果修改了名称，检查是否重复
    if (item_name && item_name !== item.item_name) {
      const existingItem = await SalaryItem.findOne({
        item_name,
        is_deleted: false,
        _id: { $ne: id }
      });

      if (existingItem) {
        return errorResponse(res, '该薪酬项目名称已存在', 400);
      }

      item.item_name = item_name;
    }

    if (description !== undefined) item.description = description;
    if (is_active !== undefined) item.is_active = is_active;

    await item.save();

    successResponse(res, item, '薪酬项目更新成功');
  } catch (error) {
    console.error('Update salary item error:', error);
    errorResponse(res, error.message || '薪酬项目更新失败', 500);
  }
};

// @desc    删除薪酬项目（软删除）
// @route   DELETE /api/admin/salary-items/:id
// @access  Private/Admin
export const deleteSalaryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await SalaryItem.findById(id);
    if (!item) {
      return errorResponse(res, '薪酬项目不存在', 404);
    }

    item.is_deleted = true;
    item.is_active = false;
    await item.save();

    successResponse(res, null, '薪酬项目删除成功');
  } catch (error) {
    console.error('Delete salary item error:', error);
    errorResponse(res, error.message || '薪酬项目删除失败', 500);
  }
};

export default {
  getSalaryItems,
  getSalaryItemById,
  createSalaryItem,
  updateSalaryItem,
  deleteSalaryItem
};

