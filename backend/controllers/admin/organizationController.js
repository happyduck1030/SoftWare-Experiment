import Organization from '../../models/Organization.js';
import Employee from '../../models/Employee.js';
import Position from '../../models/Position.js';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/responseFormatter.js';

// @desc    获取机构列表
// @route   GET /api/admin/organizations
// @access  Private/Admin
export const getOrganizations = async (req, res) => {
  try {
    const { level, parent_org_id, page = 1, limit = 100 } = req.query;

    const query = { is_deleted: false };
    
    if (level) query.org_level = level;
    if (parent_org_id) query.parent_org_id = parent_org_id;
    if (parent_org_id === 'null') query.parent_org_id = null;

    const skip = (page - 1) * limit;

    const organizations = await Organization.find(query)
      .populate('parent_org_id', 'org_name org_level')
      .populate('manager_emp_id', 'name phone email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ org_level: 1, org_name: 1 });

    const total = await Organization.countDocuments(query);

    paginatedResponse(res, organizations, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get organizations error:', error);
    errorResponse(res, error.message || '获取机构列表失败', 500);
  }
};

// @desc    获取机构树
// @route   GET /api/admin/organizations/tree
// @access  Private/Admin
export const getOrganizationTree = async (req, res) => {
  try {
    const tree = await Organization.getOrganizationTree();
    successResponse(res, tree, '获取机构树成功');
  } catch (error) {
    console.error('Get organization tree error:', error);
    errorResponse(res, error.message || '获取机构树失败', 500);
  }
};

// @desc    获取单个机构详情
// @route   GET /api/admin/organizations/:id
// @access  Private/Admin
export const getOrganizationById = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id)
      .populate('parent_org_id', 'org_name org_level')
      .populate('manager_emp_id', 'name phone email pos_id');

    if (!organization) {
      return errorResponse(res, '机构不存在', 404);
    }

    successResponse(res, organization, '获取机构详情成功');
  } catch (error) {
    console.error('Get organization error:', error);
    errorResponse(res, error.message || '获取机构详情失败', 500);
  }
};

// @desc    创建机构
// @route   POST /api/admin/organizations
// @access  Private/Admin
export const createOrganization = async (req, res) => {
  try {
    const { org_name, org_level, parent_org_id, manager_emp_id } = req.body;

    // 验证必填字段
    if (!org_name || !org_level) {
      return errorResponse(res, '机构名称和层级不能为空', 400);
    }

    // 验证层级规则
    if (org_level < 1 || org_level > 3) {
      return errorResponse(res, '机构层级必须是1、2或3', 400);
    }

    // 一级机构不能有父机构
    if (org_level === 1 && parent_org_id) {
      return errorResponse(res, '一级机构不能有父机构', 400);
    }

    // 二级和三级机构必须有父机构
    if (org_level > 1 && !parent_org_id) {
      return errorResponse(res, `${org_level}级机构必须指定父机构`, 400);
    }

    // 验证父机构
    if (parent_org_id) {
      const parentOrg = await Organization.findById(parent_org_id);
      if (!parentOrg) {
        return errorResponse(res, '父机构不存在', 404);
      }
      
      // 验证父机构层级
      if (parentOrg.org_level !== org_level - 1) {
        return errorResponse(res, '父机构层级不正确', 400);
      }
    }

    // 验证负责人
    if (manager_emp_id) {
      const manager = await Employee.findById(manager_emp_id);
      if (!manager) {
        return errorResponse(res, '负责人不存在', 404);
      }
    }

    const organization = await Organization.create({
      org_name,
      org_level,
      parent_org_id: parent_org_id || null,
      manager_emp_id: manager_emp_id || null
    });

    successResponse(res, organization, '机构创建成功', 201);
  } catch (error) {
    console.error('Create organization error:', error);
    errorResponse(res, error.message || '机构创建失败', 500);
  }
};

// @desc    更新机构
// @route   PUT /api/admin/organizations/:id
// @access  Private/Admin
export const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { org_name, manager_emp_id, parent_org_id } = req.body;

    const organization = await Organization.findById(id);
    if (!organization) {
      return errorResponse(res, '机构不存在', 404);
    }

    // 验证负责人
    if (manager_emp_id) {
      const manager = await Employee.findById(manager_emp_id);
      if (!manager) {
        return errorResponse(res, '负责人不存在', 404);
      }
    }

    // 更新字段
    if (org_name) organization.org_name = org_name;
    if (manager_emp_id !== undefined) organization.manager_emp_id = manager_emp_id || null;
    if (parent_org_id !== undefined && organization.org_level > 1) {
      if (parent_org_id) {
        const parentOrg = await Organization.findById(parent_org_id);
        if (!parentOrg) {
          return errorResponse(res, '父机构不存在', 404);
        }
        organization.parent_org_id = parent_org_id;
      }
    }

    await organization.save();

    const updatedOrg = await Organization.findById(id)
      .populate('parent_org_id', 'org_name')
      .populate('manager_emp_id', 'name phone email');

    successResponse(res, updatedOrg, '机构更新成功');
  } catch (error) {
    console.error('Update organization error:', error);
    errorResponse(res, error.message || '机构更新失败', 500);
  }
};

// @desc    删除机构（软删除）
// @route   DELETE /api/admin/organizations/:id
// @access  Private/Admin
export const deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;

    const organization = await Organization.findById(id);
    if (!organization) {
      return errorResponse(res, '机构不存在', 404);
    }

    // 检查是否有下级机构
    const childOrgs = await Organization.countDocuments({
      parent_org_id: id,
      is_deleted: false
    });

    if (childOrgs > 0) {
      return errorResponse(res, '该机构下还有子机构，无法删除', 400);
    }

    // 检查是否有职位
    const positions = await Position.countDocuments({
      org_id: id,
      is_deleted: false
    });

    if (positions > 0) {
      return errorResponse(res, '该机构下还有职位，无法删除', 400);
    }

    organization.is_deleted = true;
    await organization.save();

    successResponse(res, null, '机构删除成功');
  } catch (error) {
    console.error('Delete organization error:', error);
    errorResponse(res, error.message || '机构删除失败', 500);
  }
};

export default {
  getOrganizations,
  getOrganizationTree,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization
};

