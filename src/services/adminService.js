import api from './api';

// ==================== 机构管理 ====================

// 获取机构列表
export const getOrganizations = async (params) => {
  console.log('[API] 获取机构列表', params);
  const response = await api.get('/admin/organizations', { params });
  console.log('[API Response] 机构列表', response);
  return response;
};

// 获取机构树
export const getOrganizationTree = async () => {
  console.log('[API] 获取机构树');
  const response = await api.get('/admin/organizations/tree');
  console.log('[API Response] 机构树', response);
  return response;
};

// 获取单个机构详情
export const getOrganizationById = async (id) => {
  console.log('[API] 获取机构详情', id);
  const response = await api.get(`/admin/organizations/${id}`);
  console.log('[API Response] 机构详情', response);
  return response;
};

// 创建机构
export const createOrganization = async (data) => {
  console.log('[API] 创建机构', data);
  const response = await api.post('/admin/organizations', data);
  console.log('[API Response] 创建机构', response);
  return response;
};

// 更新机构
export const updateOrganization = async (id, data) => {
  console.log('[API] 更新机构', id, data);
  const response = await api.put(`/admin/organizations/${id}`, data);
  console.log('[API Response] 更新机构', response);
  return response;
};

// 删除机构
export const deleteOrganization = async (id) => {
  console.log('[API] 删除机构', id);
  const response = await api.delete(`/admin/organizations/${id}`);
  console.log('[API Response] 删除机构', response);
  return response;
};

// ==================== 职位管理 ====================

// 获取职位列表
export const getPositions = async (params) => {
  console.log('[API] 获取职位列表', params);
  const response = await api.get('/admin/positions', { params });
  console.log('[API Response] 职位列表', response);
  return response;
};

// 获取单个职位详情
export const getPositionById = async (id) => {
  console.log('[API] 获取职位详情', id);
  const response = await api.get(`/admin/positions/${id}`);
  console.log('[API Response] 职位详情', response);
  return response;
};

// 创建职位
export const createPosition = async (data) => {
  console.log('[API] 创建职位', data);
  const response = await api.post('/admin/positions', data);
  console.log('[API Response] 创建职位', response);
  return response;
};

// 更新职位
export const updatePosition = async (id, data) => {
  console.log('[API] 更新职位', id, data);
  const response = await api.put(`/admin/positions/${id}`, data);
  console.log('[API Response] 更新职位', response);
  return response;
};

// 删除职位
export const deletePosition = async (id) => {
  console.log('[API] 删除职位', id);
  const response = await api.delete(`/admin/positions/${id}`);
  console.log('[API Response] 删除职位', response);
  return response;
};

// ==================== 档案管理 ====================

// 获取档案列表
export const getArchives = async (params) => {
  console.log('[API] 获取档案列表', params);
  const response = await api.get('/admin/archives', { params });
  console.log('[API Response] 档案列表', response);
  return response;
};

// 获取单个档案详情
export const getArchiveById = async (id) => {
  console.log('[API] 获取档案详情', id);
  const response = await api.get(`/admin/archives/${id}`);
  console.log('[API Response] 档案详情', response);
  return response;
};

// 登记档案
export const createArchive = async (data) => {
  console.log('[API] 登记档案', data);
  const response = await api.post('/admin/archives', data);
  console.log('[API Response] 登记档案', response);
  return response;
};

// 复核档案
export const reviewArchive = async (id, approved) => {
  console.log('[API] 复核档案', id, approved);
  const response = await api.put(`/admin/archives/${id}/review`, { approved });
  console.log('[API Response] 复核档案', response);
  return response;
};

// 更新档案
export const updateArchive = async (id, data) => {
  console.log('[API] 更新档案', id, data);
  const response = await api.put(`/admin/archives/${id}`, data);
  console.log('[API Response] 更新档案', response);
  return response;
};

// 删除档案
export const deleteArchive = async (id) => {
  console.log('[API] 删除档案', id);
  const response = await api.delete(`/admin/archives/${id}`);
  console.log('[API Response] 删除档案', response);
  return response;
};

// ==================== 薪酬项目管理 ====================

// 获取薪酬项目列表
export const getSalaryItems = async (params) => {
  console.log('[API] 获取薪酬项目列表', params);
  const response = await api.get('/admin/salary-items', { params });
  console.log('[API Response] 薪酬项目列表', response);
  return response;
};

// 创建薪酬项目
export const createSalaryItem = async (data) => {
  console.log('[API] 创建薪酬项目', data);
  const response = await api.post('/admin/salary-items', data);
  console.log('[API Response] 创建薪酬项目', response);
  return response;
};

// 更新薪酬项目
export const updateSalaryItem = async (id, data) => {
  console.log('[API] 更新薪酬项目', id, data);
  const response = await api.put(`/admin/salary-items/${id}`, data);
  console.log('[API Response] 更新薪酬项目', response);
  return response;
};

// 删除薪酬项目
export const deleteSalaryItem = async (id) => {
  console.log('[API] 删除薪酬项目', id);
  const response = await api.delete(`/admin/salary-items/${id}`);
  console.log('[API Response] 删除薪酬项目', response);
  return response;
};

// ==================== 薪酬标准管理 ====================

// 获取薪酬标准列表
export const getSalaryStandards = async (params) => {
  console.log('[API] 获取薪酬标准列表', params);
  const response = await api.get('/admin/salary-standards', { params });
  console.log('[API Response] 薪酬标准列表', response);
  return response;
};

// 创建薪酬标准
export const createSalaryStandard = async (data) => {
  console.log('[API] 创建薪酬标准', data);
  const response = await api.post('/admin/salary-standards', data);
  console.log('[API Response] 创建薪酬标准', response);
  return response;
};

// 复核薪酬标准
export const reviewSalaryStandard = async (id, approved) => {
  console.log('[API] 复核薪酬标准', id, approved);
  const response = await api.put(`/admin/salary-standards/${id}/review`, { approved });
  console.log('[API Response] 复核薪酬标准', response);
  return response;
};

// 更新薪酬标准
export const updateSalaryStandard = async (id, data) => {
  console.log('[API] 更新薪酬标准', id, data);
  const response = await api.put(`/admin/salary-standards/${id}`, data);
  console.log('[API Response] 更新薪酬标准', response);
  return response;
};

// 删除薪酬标准
export const deleteSalaryStandard = async (id) => {
  console.log('[API] 删除薪酬标准', id);
  const response = await api.delete(`/admin/salary-standards/${id}`);
  console.log('[API Response] 删除薪酬标准', response);
  return response;
};

// ==================== 薪酬发放管理 ====================

// 获取薪酬发放列表
export const getSalaryPayments = async (params) => {
  console.log('[API] 获取薪酬发放列表', params);
  const response = await api.get('/admin/salary-payments', { params });
  console.log('[API Response] 薪酬发放列表', response);
  return response;
};

// 创建薪酬发放
export const createSalaryPayment = async (data) => {
  console.log('[API] 创建薪酬发放', data);
  const response = await api.post('/admin/salary-payments', data);
  console.log('[API Response] 创建薪酬发放', response);
  return response;
};

// 复核薪酬发放
export const reviewSalaryPayment = async (batchId, approved) => {
  console.log('[API] 复核薪酬发放', batchId, approved);
  const response = await api.put(`/admin/salary-payments/batch/${batchId}/review`, { approved });
  console.log('[API Response] 复核薪酬发放', response);
  return response;
};

export default {
  // 机构
  getOrganizations,
  getOrganizationTree,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  
  // 职位
  getPositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition,
  
  // 档案
  getArchives,
  getArchiveById,
  createArchive,
  reviewArchive,
  updateArchive,
  deleteArchive,
  
  // 薪酬项目
  getSalaryItems,
  createSalaryItem,
  updateSalaryItem,
  deleteSalaryItem,
  
  // 薪酬标准
  getSalaryStandards,
  createSalaryStandard,
  reviewSalaryStandard,
  updateSalaryStandard,
  deleteSalaryStandard,
  
  // 薪酬发放
  getSalaryPayments,
  createSalaryPayment,
  reviewSalaryPayment
};

