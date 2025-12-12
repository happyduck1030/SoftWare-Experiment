import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Organization from '../models/Organization.js';
import Position from '../models/Position.js';
import generateToken from '../utils/generateToken.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';

// @desc    用户注册
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { username, password, emp_id } = req.body;

    // 检查用户名是否已存在
    const userExists = await User.findOne({ username });
    if (userExists) {
      return errorResponse(res, '用户名已存在', 400);
    }

    // 如果提供了 emp_id，检查员工是否存在
    if (emp_id) {
      const employee = await Employee.findById(emp_id);
      if (!employee) {
        return errorResponse(res, '员工不存在', 404);
      }

      // 检查该员工是否已关联用户
      const empUser = await User.findOne({ emp_id });
      if (empUser) {
        return errorResponse(res, '该员工已关联用户账号', 400);
      }
    }

    // 创建用户
    const user = await User.create({
      username,
      password,
      emp_id: emp_id || null,
      role: 'employee'
    });

    // 生成 token
    const token = generateToken(user._id);

    successResponse(res, {
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        emp_id: user.emp_id
      },
      token
    }, '注册成功', 201);
  } catch (error) {
    console.error('Register error:', error);
    errorResponse(res, error.message || '注册失败', 500);
  }
};

// @desc    用户登录
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证输入
    if (!username || !password) {
      return errorResponse(res, '请提供用户名和密码', 400);
    }

    // 查找用户（包含密码字段）
    const user = await User.findOne({ username })
      .select('+password')
      .populate({
        path: 'emp_id',
        populate: {
          path: 'pos_id',
          populate: { path: 'org_id' }
        }
      });

    if (!user) {
      return errorResponse(res, '用户名或密码错误', 401);
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, '用户名或密码错误', 401);
    }

    // 检查用户是否被禁用
    if (!user.is_active) {
      return errorResponse(res, '账号已被禁用', 401);
    }

    // 更新最后登录时间
    user.last_login = new Date();
    await user.save();

    // 检查用户是否是机构负责人
    const managedOrg = await user.isBossOfOrganization();
    if (managedOrg && user.role === 'employee') {
      user.role = 'boss';
      await user.save();
    }

    // 获取用户完整信息
    let userInfo = {
      id: user._id,
      username: user.username,
      role: user.role,
      isBoss: !!managedOrg
    };

    // 如果用户关联了员工，获取完整的机构信息和上级信息
    if (user.emp_id) {
      const employee = user.emp_id;
      await employee.populate('pos_id');
      
      // 获取职位信息
      const position = employee.pos_id;
      
      // 获取机构完整路径
      let organizationPath = null;
      let organizationIds = [];
      
      if (position && position.org_id) {
        const level3Org = await Organization.findById(position.org_id);
        if (level3Org) {
          organizationIds.push(level3Org._id);
          const pathNames = { level3: level3Org.org_name };
          
          // 获取二级机构
          if (level3Org.parent_org_id) {
            const level2Org = await Organization.findById(level3Org.parent_org_id);
            if (level2Org) {
              organizationIds.unshift(level2Org._id);
              pathNames.level2 = level2Org.org_name;
              
              // 获取一级机构
              if (level2Org.parent_org_id) {
                const level1Org = await Organization.findById(level2Org.parent_org_id);
                if (level1Org) {
                  organizationIds.unshift(level1Org._id);
                  pathNames.level1 = level1Org.org_name;
                }
              }
            }
          }
          
          organizationPath = pathNames;
        }
      }

      // 获取各级上级领导信息
      const supervisors = await employee.getSupervisors();

      userInfo = {
        ...userInfo,
        employeeId: employee._id,
        name: employee.name,
        position: position?.pos_name || '',
        organizationPath,
        organizationIds,
        supervisors,
        bossOfOrganizationId: managedOrg ? managedOrg._id : null,
        bossOfOrganizationName: managedOrg ? managedOrg.org_name : null
      };
    }

    // 生成 token
    const token = generateToken(user._id);

    successResponse(res, {
      user: userInfo,
      token
    }, '登录成功');
  } catch (error) {
    console.error('Login error:', error);
    errorResponse(res, error.message || '登录失败', 500);
  }
};

// @desc    获取当前用户信息
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'emp_id',
        populate: {
          path: 'pos_id',
          populate: { path: 'org_id' }
        }
      });

    if (!user) {
      return errorResponse(res, '用户不存在', 404);
    }

    // 检查是否是机构负责人
    const managedOrg = await user.isBossOfOrganization();

    let userInfo = {
      id: user._id,
      username: user.username,
      role: user.role,
      isBoss: !!managedOrg
    };

    if (user.emp_id) {
      const employee = user.emp_id;
      const position = employee.pos_id;
      
      // 获取机构路径
      let organizationPath = null;
      if (position && position.org_id) {
        const level3Org = await Organization.findById(position.org_id);
        if (level3Org) {
          const pathNames = { level3: level3Org.org_name };
          
          if (level3Org.parent_org_id) {
            const level2Org = await Organization.findById(level3Org.parent_org_id);
            if (level2Org) {
              pathNames.level2 = level2Org.org_name;
              if (level2Org.parent_org_id) {
                const level1Org = await Organization.findById(level2Org.parent_org_id);
                if (level1Org) {
                  pathNames.level1 = level1Org.org_name;
                }
              }
            }
          }
          
          organizationPath = pathNames;
        }
      }

      const supervisors = await employee.getSupervisors();

      userInfo = {
        ...userInfo,
        employeeId: employee._id,
        name: employee.name,
        position: position?.pos_name || '',
        organizationPath,
        supervisors,
        bossOfOrganizationId: managedOrg ? managedOrg._id : null
      };
    }

    successResponse(res, userInfo, '获取用户信息成功');
  } catch (error) {
    console.error('GetMe error:', error);
    errorResponse(res, error.message || '获取用户信息失败', 500);
  }
};

// @desc    修改密码
// @route   PUT /api/auth/password
// @access  Private
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, '请提供当前密码和新密码', 400);
    }

    const user = await User.findById(req.user._id).select('+password');

    // 验证当前密码
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, '当前密码错误', 401);
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    successResponse(res, null, '密码修改成功');
  } catch (error) {
    console.error('Update password error:', error);
    errorResponse(res, error.message || '密码修改失败', 500);
  }
};

export default { register, login, getMe, updatePassword };

