import Employee from '../models/Employee.js';
import Organization from '../models/Organization.js';
import Position from '../models/Position.js';
import SalaryPayment from '../models/SalaryPayment.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';

// @desc    获取当前员工的档案信息
// @route   GET /api/employee/archive
// @access  Private (Employee)
export const getMyArchive = async (req, res) => {
  try {
    if (!req.user.emp_id) {
      return errorResponse(res, '当前用户未关联员工信息', 400);
    }

    const employee = await Employee.findById(req.user.emp_id._id)
      .populate({
        path: 'pos_id',
        populate: { path: 'org_id' }
      });

    if (!employee) {
      return errorResponse(res, '员工信息不存在', 404);
    }

    // 获取机构路径
    const organizationPath = await employee.getOrganizationPath();
    
    // 获取上级信息
    const supervisors = await employee.getSupervisors();

    const archiveData = {
      id: employee._id,
      name: employee.name,
      gender: employee.gender,
      idCard: employee.id_card,
      phone: employee.phone,
      email: employee.email,
      hireDate: employee.hire_date,
      organizationPath,
      positionName: employee.pos_id?.pos_name || '',
      education: employee.education,
      address: employee.address,
      emergencyContact: employee.emergency_contact,
      emergencyPhone: employee.emergency_phone,
      status: employee.status,
      directBoss: supervisors?.level3Boss || null,
      allSupervisors: supervisors
    };

    successResponse(res, archiveData, '获取档案信息成功');
  } catch (error) {
    console.error('Get my archive error:', error);
    errorResponse(res, error.message || '获取档案信息失败', 500);
  }
};

// @desc    更新当前员工的可编辑信息
// @route   PUT /api/employee/archive
// @access  Private (Employee)
export const updateMyArchive = async (req, res) => {
  try {
    if (!req.user.emp_id) {
      return errorResponse(res, '当前用户未关联员工信息', 400);
    }

    // 员工只能更新这些字段
    const allowedFields = ['phone', 'email', 'address', 'emergency_contact', 'emergency_phone'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse(res, '没有可更新的字段', 400);
    }

    const employee = await Employee.findByIdAndUpdate(
      req.user.emp_id._id,
      updates,
      { new: true, runValidators: true }
    ).populate('pos_id');

    successResponse(res, employee, '信息更新成功');
  } catch (error) {
    console.error('Update my archive error:', error);
    errorResponse(res, error.message || '信息更新失败', 500);
  }
};

// @desc    获取当前员工的薪酬记录
// @route   GET /api/employee/salary
// @access  Private (Employee)
export const getMySalary = async (req, res) => {
  try {
    if (!req.user.emp_id) {
      return errorResponse(res, '当前用户未关联员工信息', 400);
    }

    const { startMonth, endMonth } = req.query;

    // 获取薪酬记录
    const payments = await SalaryPayment.getEmployeePayments(
      req.user.emp_id._id,
      startMonth,
      endMonth
    );

    // 按月份分组
    const groupedByMonth = {};
    payments.forEach(payment => {
      const monthKey = payment.pay_month.toISOString().substring(0, 7);
      if (!groupedByMonth[monthKey]) {
        groupedByMonth[monthKey] = {
          month: monthKey,
          paymentDate: payment.pay_month,
          items: [],
          total: 0
        };
      }
      groupedByMonth[monthKey].items.push({
        name: payment.item_id.item_name,
        amount: payment.amount
      });
      groupedByMonth[monthKey].total += payment.amount;
    });

    const salaryRecords = Object.values(groupedByMonth).sort((a, b) => 
      new Date(b.month) - new Date(a.month)
    );

    successResponse(res, salaryRecords, '获取薪酬记录成功');
  } catch (error) {
    console.error('Get my salary error:', error);
    errorResponse(res, error.message || '获取薪酬记录失败', 500);
  }
};

// @desc    获取组织架构信息
// @route   GET /api/employee/organization
// @access  Private (Employee)
export const getOrganizationInfo = async (req, res) => {
  try {
    if (!req.user.emp_id) {
      return errorResponse(res, '当前用户未关联员工信息', 400);
    }

    const employee = await Employee.findById(req.user.emp_id._id)
      .populate({
        path: 'pos_id',
        populate: { path: 'org_id' }
      });

    if (!employee || !employee.pos_id || !employee.pos_id.org_id) {
      return errorResponse(res, '机构信息不存在', 404);
    }

    // 获取三级机构
    const level3Org = await Organization.findById(employee.pos_id.org_id)
      .populate('manager_emp_id', 'name phone email');
    
    let organizationPath = { level3: level3Org.org_name };
    let supervisors = {};

    // 获取三级机构负责人
    if (level3Org.manager_emp_id) {
      const pos = await Position.findOne({ _id: level3Org.manager_emp_id.pos_id });
      supervisors.level3Boss = {
        name: level3Org.manager_emp_id.name,
        position: pos?.pos_name || '负责人',
        phone: level3Org.manager_emp_id.phone || ''
      };
    }

    // 获取二级机构
    let level2Org = null;
    if (level3Org.parent_org_id) {
      level2Org = await Organization.findById(level3Org.parent_org_id)
        .populate('manager_emp_id', 'name phone email');
      
      if (level2Org) {
        organizationPath.level2 = level2Org.org_name;
        
        if (level2Org.manager_emp_id) {
          const pos = await Position.findOne({ _id: level2Org.manager_emp_id.pos_id });
          supervisors.level2Boss = {
            name: level2Org.manager_emp_id.name,
            position: pos?.pos_name || '负责人',
            phone: level2Org.manager_emp_id.phone || ''
          };
        }
      }
    }

    // 获取一级机构
    if (level2Org && level2Org.parent_org_id) {
      const level1Org = await Organization.findById(level2Org.parent_org_id)
        .populate('manager_emp_id', 'name phone email');
      
      if (level1Org) {
        organizationPath.level1 = level1Org.org_name;
        
        if (level1Org.manager_emp_id) {
          const pos = await Position.findOne({ _id: level1Org.manager_emp_id.pos_id });
          supervisors.level1Boss = {
            name: level1Org.manager_emp_id.name,
            position: pos?.pos_name || '负责人',
            phone: level1Org.manager_emp_id.phone || ''
          };
        }
      }
    }

    // 检查当前员工是否是某个机构的负责人
    const managedOrg = await req.user.isBossOfOrganization();

    const orgInfo = {
      name: employee.name,
      position: employee.pos_id.pos_name,
      isBoss: !!managedOrg,
      organizationPath,
      supervisors,
      joinDate: employee.hire_date
    };

    successResponse(res, orgInfo, '获取组织架构信息成功');
  } catch (error) {
    console.error('Get organization info error:', error);
    errorResponse(res, error.message || '获取组织架构信息失败', 500);
  }
};

// @desc    获取下属员工列表（仅机构负责人）
// @route   GET /api/employee/subordinates
// @access  Private (Boss)
export const getSubordinates = async (req, res) => {
  try {
    // 检查是否是机构负责人
    const managedOrg = await req.user.isBossOfOrganization();
    
    if (!managedOrg) {
      return errorResponse(res, '您不是任何机构的负责人', 403);
    }

    // 获取该机构下的所有职位
    const positions = await Position.find({ 
      org_id: managedOrg._id,
      is_deleted: false 
    });

    const positionIds = positions.map(p => p._id);

    // 获取这些职位下的所有员工
    const employees = await Employee.find({
      pos_id: { $in: positionIds },
      is_deleted: false,
      _id: { $ne: req.user.emp_id._id } // 排除自己
    })
    .populate('pos_id', 'pos_name')
    .select('name gender phone email hire_date status pos_id')
    .lean();

    // 获取每个员工的最近薪酬
    const employeesWithSalary = await Promise.all(
      employees.map(async (emp) => {
        const recentPayment = await SalaryPayment.aggregate([
          {
            $match: {
              emp_id: emp._id,
              reviewed: true,
              is_deleted: false
            }
          },
          {
            $sort: { pay_month: -1 }
          },
          {
            $group: {
              _id: '$pay_month',
              total: { $sum: '$amount' }
            }
          },
          {
            $limit: 1
          }
        ]);

        return {
          id: emp._id,
          name: emp.name,
          gender: emp.gender,
          position: emp.pos_id?.pos_name || '',
          phone: emp.phone || '',
          email: emp.email || '',
          entryDate: emp.hire_date,
          status: emp.status,
          recentSalary: recentPayment[0]?.total || 0
        };
      })
    );

    successResponse(res, employeesWithSalary, '获取下属列表成功');
  } catch (error) {
    console.error('Get subordinates error:', error);
    errorResponse(res, error.message || '获取下属列表失败', 500);
  }
};

// @desc    获取下属员工详情（仅机构负责人）
// @route   GET /api/employee/subordinates/:id
// @access  Private (Boss)
export const getSubordinateDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // 检查是否是机构负责人
    const managedOrg = await req.user.isBossOfOrganization();
    
    if (!managedOrg) {
      return errorResponse(res, '您不是任何机构的负责人', 403);
    }

    const employee = await Employee.findById(id)
      .populate('pos_id')
      .select('-id_card'); // 不返回身份证号等敏感信息

    if (!employee) {
      return errorResponse(res, '员工不存在', 404);
    }

    // 验证该员工是否属于当前用户管理的机构
    const position = await Position.findById(employee.pos_id);
    if (!position || position.org_id.toString() !== managedOrg._id.toString()) {
      return errorResponse(res, '该员工不属于您管理的机构', 403);
    }

    successResponse(res, employee, '获取员工详情成功');
  } catch (error) {
    console.error('Get subordinate detail error:', error);
    errorResponse(res, error.message || '获取员工详情失败', 500);
  }
};

// @desc    更新下属员工信息（仅机构负责人）
// @route   PUT /api/employee/subordinates/:id
// @access  Private (Boss)
export const updateSubordinate = async (req, res) => {
  try {
    const { id } = req.params;

    // 检查是否是机构负责人
    const managedOrg = await req.user.isBossOfOrganization();
    
    if (!managedOrg) {
      return errorResponse(res, '您不是任何机构的负责人', 403);
    }

    const employee = await Employee.findById(id).populate('pos_id');

    if (!employee) {
      return errorResponse(res, '员工不存在', 404);
    }

    // 验证该员工是否属于当前用户管理的机构
    const position = await Position.findById(employee.pos_id);
    if (!position || position.org_id.toString() !== managedOrg._id.toString()) {
      return errorResponse(res, '该员工不属于您管理的机构', 403);
    }

    // 机构负责人只能更新这些字段
    const allowedFields = ['phone', 'email', 'status', 'address', 'emergency_contact', 'emergency_phone'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse(res, '没有可更新的字段', 400);
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('pos_id');

    successResponse(res, updatedEmployee, '更新员工信息成功');
  } catch (error) {
    console.error('Update subordinate error:', error);
    errorResponse(res, error.message || '更新员工信息失败', 500);
  }
};

// @desc    查看下属员工薪酬汇总（仅机构负责人）
// @route   GET /api/employee/subordinates/:id/salary
// @access  Private (Boss)
export const getSubordinateSalary = async (req, res) => {
  try {
    const { id } = req.params;

    // 检查是否是机构负责人
    const managedOrg = await req.user.isBossOfOrganization();
    
    if (!managedOrg) {
      return errorResponse(res, '您不是任何机构的负责人', 403);
    }

    const employee = await Employee.findById(id).populate('pos_id');

    if (!employee) {
      return errorResponse(res, '员工不存在', 404);
    }

    // 验证该员工是否属于当前用户管理的机构
    const position = await Position.findById(employee.pos_id);
    if (!position || position.org_id.toString() !== managedOrg._id.toString()) {
      return errorResponse(res, '该员工不属于您管理的机构', 403);
    }

    // 获取薪酬汇总（只显示总额，不显示明细）
    const salaryRecords = await SalaryPayment.aggregate([
      {
        $match: {
          emp_id: employee._id,
          reviewed: true,
          is_deleted: false
        }
      },
      {
        $group: {
          _id: '$pay_month',
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { _id: -1 }
      },
      {
        $limit: 12 // 只返回最近12个月
      },
      {
        $project: {
          month: {
            $dateToString: { format: '%Y-%m', date: '$_id' }
          },
          total: 1,
          _id: 0
        }
      }
    ]);

    successResponse(res, salaryRecords, '获取员工薪酬汇总成功');
  } catch (error) {
    console.error('Get subordinate salary error:', error);
    errorResponse(res, error.message || '获取员工薪酬汇总失败', 500);
  }
};

export default {
  getMyArchive,
  updateMyArchive,
  getMySalary,
  getOrganizationInfo,
  getSubordinates,
  getSubordinateDetail,
  updateSubordinate,
  getSubordinateSalary
};

