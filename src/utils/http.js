import axios from 'axios';
import { API_ENDPOINTS } from '@/config/api.config';
import { getBaseURL, getCurrentMode } from '@/config/api.config';

// 有效的 API 模式
function effectiveMode() {
  return localStorage.getItem('VUE_APP_API_MODE') || getCurrentMode();
}

// 有效的基础 URL
function effectiveBaseURL() {
  return getBaseURL();
}

// 创建 axios 实例
const http = axios.create({
  baseURL: effectiveBaseURL(),
  timeout: 10000
});

// 请求拦截器
http.interceptors.request.use(
  (cfg) => {
    cfg.headers['X-API-Mode'] = effectiveMode();
    
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');
    if (token) {
      cfg.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return cfg;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
http.interceptors.response.use(
  (r) => r.data,
  (e) => Promise.reject(e)
);

export default http;
export { API_ENDPOINTS };