import Position from '../../models/Position.js';
import Organization from '../../models/Organization.js';
import Employee from '../../models/Employee.js';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/responseFormatter.js';

// @desc    获取职位列表
// @route   GET /api/admin/positions
// @access  Private/Admin
export const getPositions = async (req, res) => {
  try {
    const { org_id, page = 1, limit = 20, search } = req.query;

    const query = { is_deleted: false };
    
    if (org_id) query.org_id = org_id;
    if (search) query.pos_name = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;

    const positions = await Position.find(query)
      .populate('org_id', 'org_name org_level')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ org_id: 1, pos_name: 1 });

    const total = await Position.countDocuments(query);

    paginatedResponse(res, positions, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get positions error:', error);
    errorResponse(res, error.message || '获取职位列表失败', 500);
  }
};

// @desc    获取单个职位详情
// @route   GET /api/admin/positions/:id
// @access  Private/Admin
export const getPositionById = async (req, res) => {
  try {
    const position = await Position.findById(req.params.id)
      .populate('org_id', 'org_name org_level');

    if (!position) {
      return errorResponse(res, '职位不存在', 404);
    }

    // 获取该职位的员工数量
    const employeeCount = await Employee.countDocuments({
      pos_id: position._id,
      is_deleted: false
    });

    const positionData = position.toObject();
    positionData.employeeCount = employeeCount;

    successResponse(res, positionData, '获取职位详情成功');
  } catch (error) {
    console.error('Get position error:', error);
    errorResponse(res, error.message || '获取职位详情失败', 500);
  }
};

// @desc    创建职位
// @route   POST /api/admin/positions
// @access  Private/Admin
export const createPosition = async (req, res) => {
  try {
    const { pos_name, org_id, description } = req.body;

    if (!pos_name || !org_id) {
      return errorResponse(res, '职位名称和所属机构不能为空', 400);
    }

    // 验证机构是否存在且为三级机构
    const organization = await Organization.findById(org_id);
    if (!organization) {
      return errorResponse(res, '机构不存在', 404);
    }

    if (organization.org_level !== 3) {
      return errorResponse(res, '职位只能归属于三级机构', 400);
    }

    // 检查同一机构下是否已有同名职位
    const existingPosition = await Position.findOne({
      pos_name,
      org_id,
      is_deleted: false
    });

    if (existingPosition) {
      return errorResponse(res, '该机构下已存在同名职位', 400);
    }

    const position = await Position.create({
      pos_name,
      org_id,
      description
    });

    const newPosition = await Position.findById(position._id)
      .populate('org_id', 'org_name org_level');

    successResponse(res, newPosition, '职位创建成功', 201);
  } catch (error) {
    console.error('Create position error:', error);
    errorResponse(res, error.message || '职位创建失败', 500);
  }
};

// @desc    更新职位
// @route   PUT /api/admin/positions/:id
// @access  Private/Admin
export const updatePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { pos_name, description } = req.body;

    const position = await Position.findById(id);
    if (!position) {
      return errorResponse(res, '职位不存在', 404);
    }

    // 更新字段
    if (pos_name) {
      // 检查同一机构下是否已有同名职位
      const existingPosition = await Position.findOne({
        pos_name,
        org_id: position.org_id,
        is_deleted: false,
        _id: { $ne: id }
      });

      if (existingPosition) {
        return errorResponse(res, '该机构下已存在同名职位', 400);
      }

      position.pos_name = pos_name;
    }

    if (description !== undefined) position.description = description;

    await position.save();

    const updatedPosition = await Position.findById(id)
      .populate('org_id', 'org_name org_level');

    successResponse(res, updatedPosition, '职位更新成功');
  } catch (error) {
    console.error('Update position error:', error);
    errorResponse(res, error.message || '职位更新失败', 500);
  }
};

// @desc    删除职位（软删除）
// @route   DELETE /api/admin/positions/:id
// @access  Private/Admin
export const deletePosition = async (req, res) => {
  try {
    const { id } = req.params;

    const position = await Position.findById(id);
    if (!position) {
      return errorResponse(res, '职位不存在', 404);
    }

    // 检查是否有员工在该职位
    const employeeCount = await Employee.countDocuments({
      pos_id: id,
      is_deleted: false
    });

    if (employeeCount > 0) {
      return errorResponse(res, '该职位下还有员工，无法删除', 400);
    }

    position.is_deleted = true;
    await position.save();

    successResponse(res, null, '职位删除成功');
  } catch (error) {
    console.error('Delete position error:', error);
    errorResponse(res, error.message || '职位删除失败', 500);
  }
};

export default {
  getPositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition
};


