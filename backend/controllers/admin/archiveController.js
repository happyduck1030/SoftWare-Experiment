import Employee from '../../models/Employee.js';
import Position from '../../models/Position.js';
import Organization from '../../models/Organization.js';
import User from '../../models/User.js';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/responseFormatter.js';

// @desc    获取员工档案列表
// @route   GET /api/admin/archives
// @access  Private/Admin
export const getArchives = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      status, 
      org_id,
      pos_id,
      reviewed 
    } = req.query;

    const query = { is_deleted: false };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { id_card: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) query.status = status;
    if (reviewed !== undefined) query.reviewed = reviewed === 'true';
    if (pos_id) query.pos_id = pos_id;

    // 如果指定了机构，需要先找到该机构下的所有职位
    if (org_id) {
      const positions = await Position.find({ org_id, is_deleted: false });
      const positionIds = positions.map(p => p._id);
      query.pos_id = { $in: positionIds };
    }

    const skip = (page - 1) * limit;

    const employees = await Employee.find(query)
      .populate({
        path: 'pos_id',
        populate: { path: 'org_id' }
      })
      .populate('reviewed_by', 'username')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ created_at: -1 });

    const total = await Employee.countDocuments(query);

    paginatedResponse(res, employees, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get archives error:', error);
    errorResponse(res, error.message || '获取档案列表失败', 500);
  }
};

// @desc    获取单个员工档案
// @route   GET /api/admin/archives/:id
// @access  Private/Admin
export const getArchiveById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate({
        path: 'pos_id',
        populate: { path: 'org_id' }
      })
      .populate('reviewed_by', 'username');

    if (!employee) {
      return errorResponse(res, '员工档案不存在', 404);
    }

    // 获取机构路径
    const organizationPath = await employee.getOrganizationPath();
    
    const employeeData = employee.toObject();
    employeeData.organizationPath = organizationPath;

    successResponse(res, employeeData, '获取档案详情成功');
  } catch (error) {
    console.error('Get archive error:', error);
    errorResponse(res, error.message || '获取档案详情失败', 500);
  }
};

// @desc    登记员工档案
// @route   POST /api/admin/archives
// @access  Private/Admin
export const createArchive = async (req, res) => {
  try {
    const {
      name,
      gender,
      id_card,
      phone,
      email,
      hire_date,
      pos_id,
      education,
      address,
      emergency_contact,
      emergency_phone
    } = req.body;

    // 验证必填字段
    if (!name || !id_card || !hire_date || !pos_id) {
      return errorResponse(res, '姓名、身份证号、入职日期和职位不能为空', 400);
    }

    // 验证职位是否存在
    const position = await Position.findById(pos_id);
    if (!position) {
      return errorResponse(res, '职位不存在', 404);
    }

    // 检查身份证号是否已存在
    const existingEmployee = await Employee.findOne({
      id_card,
      is_deleted: false
    });

    if (existingEmployee) {
      return errorResponse(res, '该身份证号已存在', 400);
    }

    // 检查手机号是否已存在（如填写）
    if (phone) {
      const existingByPhone = await Employee.findOne({
        phone,
        is_deleted: false
      });
      if (existingByPhone) {
        return errorResponse(res, '该手机号已存在，请检查是否重复登记', 400);
      }
    }

    const employee = await Employee.create({
      name,
      gender: gender || '男',
      id_card,
      phone,
      email,
      hire_date,
      pos_id,
      education: education || '本科',
      address,
      emergency_contact,
      emergency_phone,
      status: '待复核',
      reviewed: false
    });

    const newEmployee = await Employee.findById(employee._id)
      .populate({
        path: 'pos_id',
        populate: { path: 'org_id' }
      });

    successResponse(res, newEmployee, '档案登记成功', 201);
  } catch (error) {
    console.error('Create archive error:', error);
    errorResponse(res, error.message || '档案登记失败', 500);
  }
};

// @desc    复核员工档案
// @route   PUT /api/admin/archives/:id/review
// @access  Private/Admin
export const reviewArchive = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body; // true: 通过, false: 驳回

    if (approved === undefined) {
      return errorResponse(res, '请指定审核结果', 400);
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return errorResponse(res, '员工档案不存在', 404);
    }

    if (employee.reviewed) {
      return errorResponse(res, '该档案已复核', 400);
    }

    employee.reviewed = approved;
    employee.reviewed_by = req.user._id;
    employee.reviewed_at = new Date();
    
    if (approved) {
      employee.status = '在职';

      // 如果有待生效的负责人变更，则在通过时同步到机构
      if (employee.pending_manager_action && employee.pending_manager_org) {
        const targetOrg = await Organization.findById(employee.pending_manager_org);

        if (targetOrg) {
          if (employee.pending_manager_action === 'set') {
            targetOrg.manager_emp_id = employee._id;
          } else if (employee.pending_manager_action === 'unset') {
            // 仅在当前负责人是此员工时才清空，避免误清
            if (String(targetOrg.manager_emp_id) === String(employee._id)) {
              targetOrg.manager_emp_id = null;
            }
          }
          await targetOrg.save();
        }
      }
    } else {
      employee.status = '已驳回';
    }

    // 无论通过/驳回，都清理待生效的负责人变更意图
    employee.pending_manager_action = null;
    employee.pending_manager_org = null;

    await employee.save();

    // 复核通过后自动创建用户账号（若不存在）
    if (approved) {
      const existingUserByEmp = await User.findOne({ emp_id: employee._id });
      const existingUserByPhone = employee.phone
        ? await User.findOne({ username: employee.phone })
        : null;

      const position = await Position.findById(employee.pos_id).populate('org_id');
      const managedOrg = await Organization.findOne({
        manager_emp_id: employee._id,
        is_deleted: false
      });
      const shouldBeBoss = !!position?.is_boss || !!managedOrg;

      if (!existingUserByEmp && !existingUserByPhone) {
        await User.create({
          username: employee.phone || employee.id_card,
          password: '123456', // 模型内自动加密
          emp_id: employee._id,
          role: shouldBeBoss ? 'boss' : 'employee'
        });
      } else if (existingUserByEmp) {
        // 若已存在账号但角色需提升为 boss
        if (shouldBeBoss && existingUserByEmp.role === 'employee') {
          existingUserByEmp.role = 'boss';
          await existingUserByEmp.save();
        }
      }
    }

    const updatedEmployee = await Employee.findById(id)
      .populate({
        path: 'pos_id',
        populate: { path: 'org_id' }
      })
      .populate('reviewed_by', 'username');

    successResponse(res, updatedEmployee, approved ? '档案复核通过' : '档案已驳回');
  } catch (error) {
    console.error('Review archive error:', error);
    errorResponse(res, error.message || '档案复核失败', 500);
  }
};

// @desc    更新员工档案
// @route   PUT /api/admin/archives/:id
// @access  Private/Admin
export const updateArchive = async (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = await Employee.findById(id);
    if (!employee) {
      return errorResponse(res, '员工档案不存在', 404);
    }

    // 管理员可以更新所有字段
    const allowedFields = [
      'name', 'gender', 'phone', 'email', 'pos_id', 
      'education', 'address', 'emergency_contact', 
      'emergency_phone', 'status'
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // 暂存负责人变更意图，待复核通过后生效
    if (req.body.managerAction) {
      updates.pending_manager_action = req.body.managerAction;
      updates.pending_manager_org = req.body.managerOrgId || employee.pending_manager_org;
    }

    // 只要有字段被修改，就需要重新复核（包括电话、邮箱等所有信息）
    const needsReview = Object.keys(updates).length > 0;
    
    // 已复核的档案，或者之前是“已驳回”的档案，只要再次修改都视为重新提交，状态改为待复核
    if (needsReview && (employee.reviewed || employee.status === '已驳回')) {
      updates.reviewed = false;
      updates.status = '待复核';
    }

    // 验证职位
    if (updates.pos_id) {
      const position = await Position.findById(updates.pos_id);
      if (!position) {
        return errorResponse(res, '职位不存在', 404);
      }
    }

    Object.assign(employee, updates);
    await employee.save();

    // 如果更新了职位，同步更新关联用户的角色（根据职位是否为负责人 + 是否为机构负责人）
    if (updates.pos_id) {
      const user = await User.findOne({ emp_id: employee._id });
      if (user && user.role !== 'admin') {
        const newPosition = await Position.findById(employee.pos_id).populate('org_id');
        const managedOrg = await user.isBossOfOrganization();
        const shouldBeBoss = !!managedOrg || !!newPosition?.is_boss;
        if (shouldBeBoss && user.role === 'employee') {
          user.role = 'boss';
          await user.save();
        } else if (!shouldBeBoss && user.role === 'boss') {
          user.role = 'employee';
          await user.save();
        }
      }
    }

    const updatedEmployee = await Employee.findById(id)
      .populate({
        path: 'pos_id',
        populate: { path: 'org_id' }
      });

    successResponse(res, updatedEmployee, '档案更新成功');
  } catch (error) {
    console.error('Update archive error:', error);
    errorResponse(res, error.message || '档案更新失败', 500);
  }
};

// @desc    删除员工档案（软删除）
// @route   DELETE /api/admin/archives/:id
// @access  Private/Admin
export const deleteArchive = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
      return errorResponse(res, '员工档案不存在', 404);
    }

    employee.is_deleted = true;
    employee.status = '已删除';
    await employee.save();

    successResponse(res, null, '档案删除成功');
  } catch (error) {
    console.error('Delete archive error:', error);
    errorResponse(res, error.message || '档案删除失败', 500);
  }
};

export default {
  getArchives,
  getArchiveById,
  createArchive,
  reviewArchive,
  updateArchive,
  deleteArchive
};



