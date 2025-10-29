<template>
  <div class="api-mode-switcher" v-if="isDev">
    <span>API: {{ mode }} | {{ baseURL }}</span>
    <button @click="switchMode('mock')" :disabled="mode==='mock'">Mock</button>
    <button @click="switchMode('real')" :disabled="mode==='real'">Real</button>
  </div>
</template>

<script>
import { getCurrentMode, getBaseURL } from '@/config/api.config';

export default {
  name: 'ApiModeSwitcher',
  data() {
    return {
      mode: getCurrentMode(),
      baseURL: getBaseURL(),
      isDev: process.env.NODE_ENV === 'development'
    };
  },
  methods: {
    switchMode(m) {
      localStorage.setItem('VUE_APP_API_MODE', m);
      alert(`已切换到 ${m}, 即将刷新`);
      window.location.reload();
    }
  }
};
</script>

<style scoped>
.api-mode-switcher {
  position: fixed;
  bottom: 8px;
  right: 8px;
  background: #111;
  color: #fff;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 6px;
  display: flex;
  gap: 6px;
  align-items: center;
}
button {
  background: #333;
  color: #fff;
  border: 1px solid #444;
  padding: 2px 8px;
  cursor: pointer;
  border-radius: 4px;
}
button:disabled {
  opacity: .5;
  cursor: default;
}
button:not(:disabled):hover {
  background: #555;
}
</style>