import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { getBaseURL, clearCache } from './config/api.config';

// 引入全局样式
import './assets/styles/global.css';

console.log('[Main] 应用初始化');

const app = createApp(App);
app.use(store);
app.use(router);

// 暴露调试接口，方便浏览器实时查看/切换 baseURL
window.__getApiBaseURL = () => {
  try {
    return getBaseURL();
  } catch (e) {
    console.error('[__getApiBaseURL] error', e);
    return null;
  }
};
window.__logApiBase = () => {
  try {
    console.log('[API Base URL]', window.__getApiBaseURL());
  } catch (e) {
    console.error('[__logApiBase] error', e);
  }
};
window.__clearApiCache = () => {
  try {
    clearCache();
    console.log('[API] cache cleared');
  } catch (e) {
    console.error('[__clearApiCache] error', e);
  }
};

app.mount('#app');

if (process.env.NODE_ENV === 'development') {
  console.log('[Main] 已挂载，调试函数: window.__logApiBase(), window.__clearApiCache()');
}
