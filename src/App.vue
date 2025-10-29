<template>
  <router-view />
  <!-- 仅在开发环境渲染切换器，避免生产或 Codespace 公共环境意外刷新 -->
  <ApiModeSwitcher v-if="isDevEnv" />
</template>

<script>
import ApiModeSwitcher from './components/DevTools/ApiModeSwitcher.vue';
export default {
  name: 'App',
  components: { ApiModeSwitcher },
  data() {
    return {
      isDevEnv: process.env.NODE_ENV === 'development'
    };
  }
};
</script>

<style>
/* App.vue 不再需要重复的全局样式，已统一到 global.css */
#app {
  min-height: 100vh;
}
</style>
