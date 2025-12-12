import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Organization from '../models/Organization.js';

// 验证 JWT Token
export const protect = async (req, res, next) => {
  try {
    let token;

    // 从 Header 中获取 token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未授权访问，请先登录'
      });
    }

    try {
      // 验证 token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 获取用户信息
      req.user = await User.findById(decoded.id)
        .populate({
          path: 'emp_id',
          populate: {
            path: 'pos_id',
            populate: {
              path: 'org_id'
            }
          }
        });

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '用户不存在'
        });
      }

      if (!req.user.is_active) {
        return res.status(401).json({
          success: false,
          message: '用户已被禁用'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token 无效或已过期'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 验证管理员权限
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `角色 ${req.user.role} 无权访问此资源`
      });
    }
    next();
  };
};

// 验证是否是管理员
export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    });
  }
  next();
};

// 验证是否是机构负责人
export const isBoss = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return next(); // 管理员可以访问所有资源
    }

    const org = await req.user.isBossOfOrganization();
    
    if (!org) {
      return res.status(403).json({
        success: false,
        message: '您不是任何机构的负责人'
      });
    }

    req.managedOrganization = org;
    next();
  } catch (error) {
    console.error('isBoss middleware error:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 验证是否可以访问员工信息（管理员或该员工本人或其上级）
export const canAccessEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 管理员可以访问所有员工
    if (req.user.role === 'admin') {
      return next();
    }

    // 检查是否是本人
    if (req.user.emp_id && req.user.emp_id._id.toString() === id) {
      return next();
    }

    // 检查是否是该员工的上级（机构负责人）
    const targetEmployee = await Employee.findById(id).populate({
      path: 'pos_id',
      populate: { path: 'org_id' }
    });

    if (!targetEmployee) {
      return res.status(404).json({
        success: false,
        message: '员工不存在'
      });
    }

    // 检查当前用户是否是该员工所在机构的负责人
    const org = await req.user.isBossOfOrganization();
    if (org && targetEmployee.pos_id.org_id._id.toString() === org._id.toString()) {
      req.isManaging = true;
      return next();
    }

    return res.status(403).json({
      success: false,
      message: '您无权访问该员工信息'
    });
  } catch (error) {
    console.error('canAccessEmployee middleware error:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 验证是否可以修改员工信息（管理员或机构负责人修改下属）
export const canUpdateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 管理员可以修改所有员工
    if (req.user.role === 'admin') {
      req.canUpdateAll = true;
      return next();
    }

    // 普通员工可以修改自己的部分信息
    if (req.user.emp_id && req.user.emp_id._id.toString() === id) {
      req.canUpdateSelf = true;
      return next();
    }

    // 机构负责人可以修改下属的部分信息
    const targetEmployee = await Employee.findById(id).populate({
      path: 'pos_id',
      populate: { path: 'org_id' }
    });

    if (!targetEmployee) {
      return res.status(404).json({
        success: false,
        message: '员工不存在'
      });
    }

    const org = await req.user.isBossOfOrganization();
    if (org && targetEmployee.pos_id.org_id._id.toString() === org._id.toString()) {
      req.canUpdateSubordinate = true;
      return next();
    }

    return res.status(403).json({
      success: false,
      message: '您无权修改该员工信息'
    });
  } catch (error) {
    console.error('canUpdateEmployee middleware error:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

export default { protect, authorize, isAdmin, isBoss, canAccessEmployee, canUpdateEmployee };

