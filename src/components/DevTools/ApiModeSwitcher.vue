<template>
  <div
    class="api-mode-switcher"
    v-if="isDev"
    ref="root"
    :style="{ left: x + 'px', top: y + 'px' }"
    @mousedown.prevent="startDrag"
    @touchstart.prevent="startTouch"
    title="拖动以移动"
  >
    <div class="handle">API: {{ mode }} | {{ baseURL }}</div>
    <div class="controls">
      <button @click="switchMode('mock')" :disabled="mode==='mock'">Mock</button>
      <button @click="switchMode('real')" :disabled="mode==='real'">Real</button>
    </div>
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
      isDev: process.env.NODE_ENV === 'development',
      dragging: false,
      x: 0,
      y: 0,
      offsetX: 0,
      offsetY: 0
    };
  },
  mounted() {
    // restore saved position or place at bottom-right by default
    const raw = localStorage.getItem('apiSwitcherPos');
    if (raw) {
      try {
        const p = JSON.parse(raw);
        this.x = p.x || 8;
        this.y = p.y || 8;
      } catch (e) {
        this.setDefaultPos();
      }
    } else {
      this.setDefaultPos();
    }
    window.addEventListener('resize', this.onWindowResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  },
  methods: {
    setDefaultPos() {
      // put near bottom-right
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.x = Math.max(8, w - 220);
      this.y = Math.max(8, h - 96);
    },
    onWindowResize() {
      // keep within viewport
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.x = Math.min(this.x, Math.max(8, w - 120));
      this.y = Math.min(this.y, Math.max(8, h - 48));
    },
    switchMode(m) {
      localStorage.setItem('VUE_APP_API_MODE', m);
      alert(`已切换到 ${m}, 即将刷新`);
      window.location.reload();
    },
    startTouch(e) {
      const t = e.touches && e.touches[0];
      if (!t) return;
      this.offsetX = t.clientX - this.x;
      this.offsetY = t.clientY - this.y;
      this.dragging = true;
      window.addEventListener('touchmove', this.onTouchMove, { passive: false });
      window.addEventListener('touchend', this.endDrag);
    },
    onTouchMove(e) {
      const t = e.touches && e.touches[0];
      if (!t) return;
      this.x = Math.max(8, Math.min(window.innerWidth - 80, t.clientX - this.offsetX));
      this.y = Math.max(8, Math.min(window.innerHeight - 40, t.clientY - this.offsetY));
      e.preventDefault();
    },
    startDrag(e) {
      this.offsetX = e.clientX - this.x;
      this.offsetY = e.clientY - this.y;
      this.dragging = true;
      window.addEventListener('mousemove', this.onDrag);
      window.addEventListener('mouseup', this.endDrag);
    },
    onDrag(e) {
      if (!this.dragging) return;
      this.x = Math.max(8, Math.min(window.innerWidth - 80, e.clientX - this.offsetX));
      this.y = Math.max(8, Math.min(window.innerHeight - 40, e.clientY - this.offsetY));
    },
    endDrag() {
      this.dragging = false;
      window.removeEventListener('mousemove', this.onDrag);
      window.removeEventListener('mouseup', this.endDrag);
      window.removeEventListener('touchmove', this.onTouchMove);
      window.removeEventListener('touchend', this.endDrag);
      localStorage.setItem('apiSwitcherPos', JSON.stringify({ x: this.x, y: this.y }));
    }
  }
};
</script>

<style scoped>
.api-mode-switcher {
  position: fixed;
  background: #111;
  color: #fff;
  font-size: 12px;
  padding: 8px 10px;
  border-radius: 8px;
  display: flex;
  gap: 8px;
  align-items: center;
  cursor: grab;
  z-index: 2000;
  user-select: none;
}
.api-mode-switcher:active { cursor: grabbing; }
.api-mode-switcher .handle { font-weight:600; margin-right:8px; }
.api-mode-switcher .controls { display:flex; gap:6px; }
button {
  background: #333;
  color: #fff;
  border: 1px solid #444;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 6px;
}
button:disabled {
  opacity: .5;
  cursor: default;
}
button:not(:disabled):hover {
  background: #555;
}
</style>