import api from './api';

// 获取个人档案
export const getMyArchive = async () => {
  const response = await api.get('/employee/archive');
  return response;
};

// 更新个人档案
export const updateMyArchive = async (data) => {
  const response = await api.put('/employee/archive', data);
  return response;
};

// 获取个人薪酬记录
export const getMySalary = async (startMonth, endMonth) => {
  const params = {};
  if (startMonth) params.startMonth = startMonth;
  if (endMonth) params.endMonth = endMonth;
  
  const response = await api.get('/employee/salary', { params });
  return response;
};

// 获取组织架构信息
export const getOrganizationInfo = async () => {
  const response = await api.get('/employee/organization');
  return response;
};

// 获取组织树（员工权限）
export const getOrganizationTreeEmployee = async () => {
  const response = await api.get('/employee/organizations/tree');
  return response;
};

// 获取下属员工列表（仅机构负责人）
export const getSubordinates = async () => {
  const response = await api.get('/employee/subordinates');
  return response;
};

// 获取下属员工详情（仅机构负责人）
export const getSubordinateDetail = async (id) => {
  const response = await api.get(`/employee/subordinates/${id}`);
  return response;
};

// 更新下属员工信息（仅机构负责人）
export const updateSubordinate = async (id, data) => {
  const response = await api.put(`/employee/subordinates/${id}`, data);
  return response;
};

// 查看下属员工薪酬汇总（仅机构负责人）
export const getSubordinateSalary = async (id) => {
  const response = await api.get(`/employee/subordinates/${id}/salary`);
  return response;
};


