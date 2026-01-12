<template>
    <div class="base-layout">
        <div class="divider"></div>
        <div>
            <slot name="header"></slot>
        </div>
        <div class="divider"></div>

        <main>
            <slot></slot> <!-- 插入页面的内容 -->
        </main>
    </div>
</template>

<script>
export default {
    components: {}
};
</script>

<style scoped>
.base-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg-secondary);
}

.divider {
  border: none;
  height: 1px;
  background-color: var(--border-color-light);
  margin: 0;
}

main {
  flex: 1;
  padding: 0;
  padding-bottom: 72px; /* 为底部固定导航留出空间（减小间距） */
  background: var(--bg-gradient);
}
</style>