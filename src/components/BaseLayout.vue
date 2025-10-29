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

        <AppFooter /> <!-- 正确使用 AppFooter 组件 -->
    </div>
</template>

<script>
import AppFooter from './Footer.vue'; // 确保正确导入组件.

export default {
    components: {
        AppFooter // 在 components 中注册 AppFooter
    }
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
  background: var(--bg-gradient);
}
</style>