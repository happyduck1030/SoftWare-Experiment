import api from './api';

// 用户登录
export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response;
};

// 用户注册
export const register = async (username, password, emp_id) => {
  const response = await api.post('/auth/register', { username, password, emp_id });
  return response;
};

// 获取当前用户信息
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response;
};

// 修改密码
export const updatePassword = async (currentPassword, newPassword) => {
  const response = await api.put('/auth/password', { currentPassword, newPassword });
  return response;
};

