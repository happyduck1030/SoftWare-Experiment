import axios from 'axios';

// API基础URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// 创建axios实例
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器 - 添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一处理错误
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // 服务器返回错误
      const { status, data, config } = error.response;
      const url = config?.url || '';

      // 登录接口特殊处理：直接把后端返回抛给调用处，不做跳转
      const isLoginRequest = url.includes('/auth/login');

      if (!isLoginRequest) {
        switch (status) {
          case 401: {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            console.log('未授权，清除token并跳转到登录页');
            window.location.href = '/404';
            break;
          }
          case 403: {
            console.error('没有权限访问此资源');
            window.location.href = '/404';
            break;
          }
          case 404:
            console.error('请求的资源不存在');
            break;
          case 500:
            console.error('服务器错误');
            break;
          default:
            console.error(data?.message || '请求失败');
        }
      }

      return Promise.reject(error.response.data || data || { message: '请求失败' });
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('网络错误，请检查您的连接');
      return Promise.reject({ message: '网络错误，请检查您的连接' });
    } else {
      // 其他错误
      console.error('请求配置错误');
      return Promise.reject({ message: '请求配置错误' });
    }
  }
);

export default api;


