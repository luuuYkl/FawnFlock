/**
 * API 配置 - 运行时计算，浏览器环境优先使用 Codespaces 转发域名
 */

const API_MODE = { REAL: 'real', MOCK: 'mock' };

const buildCodespaceURL = (port) => {
  if (typeof window === 'undefined') return null;
  const host = window.location.hostname || '';
  // 将类似 <name>-8080.app.github.dev 替换为 <name>-7878.app.github.dev
  if (/^.+-\d+\.app.github.dev$/.test(host)) {
    return `https://${host.replace(/-\d+\.app\.github\.dev$/, `-${port}.app.github.dev`)}`;
  }
  if (process.env.CODESPACE_NAME) {
    return `https://${process.env.CODESPACE_NAME}-${port}.app.github.dev`;
  }
  return null;
};

export const getCurrentMode = () =>
  localStorage.getItem('VUE_APP_API_MODE') || process.env.VUE_APP_API_MODE || API_MODE.MOCK;

export const getBaseURL = () => {
  const mode = getCurrentMode();
  const codespace = buildCodespaceURL(7878);
  const envMock = process.env.VUE_APP_MOCK_API_URL;
  const envReal = process.env.VUE_APP_REAL_API_URL;

  // 优先使用运行时检测到的 Codespace 域名，而不是构建时的环境变量
  const urls = {
    [API_MODE.MOCK]: codespace || envMock || 'http://localhost:7878',
    [API_MODE.REAL]: codespace || envReal || 'http://127.0.0.1:7878'
  };
  return urls[mode];
};

export const clearCache = () => {}; // 兼容调用
export const isMockMode = () => getCurrentMode() === API_MODE.MOCK;
export const isRealMode = () => getCurrentMode() === API_MODE.REAL;

export const API_ENDPOINTS = {
  // 用户相关
  USER_LOGIN: '/api/users/login',
  USER_REGISTER: '/api/users/register',
  USER_INFO: (id) => `/api/users/${id}`,
  USER_UPDATE_AVATAR: (id) => `/api/users/${id}/avatar`,
  
  // 帖子相关
  POSTS_LIST: '/api/posts',
  POST_DETAIL: (id) => `/api/posts/${id}`,
  POST_CREATE: '/api/posts',
  POST_LIKE: (id) => `/api/posts/${id}/like`,
  POST_UNLIKE: (id) => `/api/posts/${id}/like`, // 使用 DELETE 方法调用同一端点
  
  // 评论相关
  COMMENTS_LIST: (postId) => `/api/posts/${postId}/comments`,
  COMMENT_CREATE: (postId) => `/api/posts/${postId}/comments`
  ,
  // 语音/声纹相关
  VOICE_ENROLL: `/api/voices/enroll`,
  VOICE_UPLOAD_MEDIA: `/api/voices/upload`,
  VOICES_LIST: `/api/voices`,
  VOICE_DELETE: (id) => `/api/voices/${id}`,

  // 功能增强：搜索、通知、私信、话题
  SEARCH: `/api/search`,
  NOTIFICATIONS_LIST: `/api/notifications`,
  NOTIFICATION_CREATE: `/api/notifications`,
  MESSAGES_LIST: `/api/messages`,
  MESSAGE_CREATE: `/api/messages`,
  TOPICS_LIST: `/api/topics`,
  TOPIC_CREATE: `/api/topics`
};

export default {
  API_MODE,
  getCurrentMode,
  getBaseURL,
  clearCache,
  isMockMode,
  isRealMode,
  API_ENDPOINTS
};