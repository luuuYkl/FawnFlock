# 🎨 FawnFlock 全局样式使用指南

## 📋 目录
- [设计系统概览](#设计系统概览)
- [CSS 变量](#css-变量)
- [工具类](#工具类)
- [组件样式](#组件样式)
- [最佳实践](#最佳实践)

---

## 🎯 设计系统概览

FawnFlock 使用统一的设计系统，基于 CSS 变量和工具类，确保整个应用的视觉一致性。

### 核心特性
- ✅ **统一的颜色系统** - 主题色、状态色、中性色
- ✅ **响应式设计** - 移动端优先
- ✅ **丰富的动画** - 预定义关键帧动画
- ✅ **模块化组件** - 可复用的样式组件
- ✅ **暗黑模式支持** - 预留接口

---

## 🎨 CSS 变量

所有 CSS 变量定义在 `src/assets/styles/global.css` 中，使用 `var(--变量名)` 引用。

### 主题色

```css
/* 使用示例 */
.my-button {
  background: var(--primary-gradient);
  color: white;
}
```

**可用变量：**
- `--primary-color`: #667eea（主色）
- `--primary-dark`: #764ba2（主色暗）
- `--primary-light`: #8b9ef8（主色亮）
- `--primary-gradient`: 渐变（135deg, #667eea → #764ba2）

### 文本颜色

```css
.title {
  color: var(--text-primary);  /* #333 */
}
.subtitle {
  color: var(--text-secondary);  /* #666 */
}
.hint {
  color: var(--text-tertiary);  /* #999 */
}
```

### 背景色

```css
.card {
  background: var(--bg-primary);  /* 白色 */
}
.page {
  background: var(--bg-gradient);  /* 渐变灰 */
}
```

### 状态色

```css
/* 成功 */
.success-msg {
  color: var(--success-color);
  background: var(--success-light);
  border: 1px solid var(--success-border);
}

/* 错误 */
.error-msg {
  color: var(--error-color);
  background: var(--error-light);
  border: 1px solid var(--error-border);
}

/* 警告 */
.warning-msg {
  color: var(--warning-color);
  background: var(--warning-light);
}

/* 信息 */
.info-msg {
  color: var(--info-color);
  background: var(--info-light);
}
```

### 间距

```css
.container {
  padding: var(--spacing-lg);      /* 20px */
  margin-bottom: var(--spacing-xl); /* 30px */
}
```

**可用尺寸：**
- `--spacing-xs`: 5px
- `--spacing-sm`: 10px
- `--spacing-md`: 15px
- `--spacing-lg`: 20px
- `--spacing-xl`: 30px
- `--spacing-2xl`: 40px
- `--spacing-3xl`: 60px

### 圆角

```css
.card {
  border-radius: var(--border-radius-md);  /* 12px */
}
.button {
  border-radius: var(--border-radius-xl);  /* 25px */
}
.avatar {
  border-radius: var(--border-radius-full); /* 50% */
}
```

### 阴影

```css
.card {
  box-shadow: var(--shadow-md);
}
.card:hover {
  box-shadow: var(--shadow-lg);
}
.primary-button {
  box-shadow: var(--shadow-primary);
}
```

### 字体

```css
.text {
  font-size: var(--font-size-base);  /* 16px */
  font-weight: var(--font-weight-normal);  /* 400 */
}
.title {
  font-size: var(--font-size-2xl);  /* 24px */
  font-weight: var(--font-weight-bold);  /* 700 */
}
```

---

## 🛠️ 工具类

### 按钮

```html
<!-- 主要按钮 -->
<button class="btn btn-primary">提交</button>

<!-- 次要按钮 -->
<button class="btn btn-secondary">取消</button>

<!-- 幽灵按钮 -->
<button class="btn btn-ghost">返回</button>

<!-- 小按钮 -->
<button class="btn btn-primary btn-sm">小按钮</button>

<!-- 大按钮 -->
<button class="btn btn-primary btn-lg">大按钮</button>
```

### 卡片

```html
<!-- 标准卡片 -->
<div class="card">
  <h3>标题</h3>
  <p>内容</p>
</div>

<!-- 大卡片 -->
<div class="card card-lg">
  <h2>大标题</h2>
  <p>更多内容</p>
</div>
```

### 输入框

```html
<div class="input-wrapper">
  <input type="text" placeholder="请输入...">
</div>

<!-- 错误状态 -->
<div class="input-wrapper error">
  <input type="text" placeholder="请输入...">
</div>
```

### 消息提示

```html
<div class="message message-success">操作成功！</div>
<div class="message message-error">操作失败！</div>
<div class="message message-warning">请注意！</div>
<div class="message message-info">温馨提示</div>
```

### 加载动画

```html
<!-- 标准 spinner -->
<div class="spinner"></div>

<!-- 小 spinner -->
<div class="spinner-sm"></div>
```

### 骨架屏

```html
<div class="skeleton skeleton-text"></div>
<div class="skeleton skeleton-avatar"></div>
```

### 布局工具类

```html
<!-- Flex 布局 -->
<div class="flex">左右排列</div>
<div class="flex-center">居中</div>
<div class="flex-between">两端对齐</div>
<div class="flex-column">垂直排列</div>

<!-- 宽度/高度 -->
<div class="w-full">100% 宽度</div>
<div class="h-full">100% 高度</div>
```

### 间距工具类

```html
<div class="mt-lg">上边距 20px</div>
<div class="mb-xl">下边距 30px</div>
<div class="p-md">内边距 15px</div>
```

**可用类：**
- `mt-*`, `mb-*`: 上/下边距
- `p-*`: 内边距
- 尺寸：`xs`, `sm`, `md`, `lg`, `xl`

### 文本工具类

```html
<p class="text-primary">主要文本</p>
<p class="text-secondary">次要文本</p>
<p class="text-tertiary">辅助文本</p>
<p class="text-gradient">渐变文本</p>
<p class="text-center">居中对齐</p>
<p class="text-sm">小号文本</p>
<p class="text-lg">大号文本</p>
<p class="text-bold">加粗文本</p>
```

---

## 🎬 动画

### 预定义动画

```css
/* 使用示例 */
.fade-in {
  animation: fadeIn 0.3s ease;
}

.slide-up {
  animation: slideUp 0.3s ease;
}

.float {
  animation: float 3s ease-in-out infinite;
}

.spinner {
  animation: spin 0.8s linear infinite;
}
```

**可用动画：**
- `spin`: 旋转（加载动画）
- `loading`: 骨架屏波浪
- `slideIn`: 从上滑入
- `fadeIn`: 淡入
- `slideUp`: 从下滑上
- `float`: 浮动
- `shake`: 抖动
- `pulse`: 脉冲

---

## 📦 组件样式示例

### 登录按钮

```vue
<template>
  <button class="btn btn-primary btn-lg w-full">
    <span v-if="!loading">登录</span>
    <span v-else class="spinner-sm"></span>
  </button>
</template>

<style scoped>
/* 使用全局变量自定义 */
.custom-style {
  background: var(--primary-gradient);
  box-shadow: var(--shadow-primary);
}
</style>
```

### 帖子卡片

```vue
<template>
  <div class="card">
    <h2 class="text-xl text-bold mb-sm">{{ title }}</h2>
    <p class="text-secondary mb-md">{{ content }}</p>
    <div class="flex gap-sm">
      <button class="btn btn-sm">❤️ {{ likes }}</button>
      <button class="btn btn-sm">💬 {{ comments }}</button>
    </div>
  </div>
</template>
```

### 错误提示

```vue
<template>
  <div v-if="error" class="message message-error">
    <span>{{ errorMessage }}</span>
  </div>
</template>
```

---

## ✅ 最佳实践

### 1. 优先使用工具类

❌ **不推荐：**
```css
.my-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border-radius: 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

✅ **推荐：**
```html
<button class="btn btn-primary">提交</button>
```

### 2. 使用 CSS 变量而非硬编码

❌ **不推荐：**
```css
.card {
  color: #333;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
```

✅ **推荐：**
```css
.card {
  color: var(--text-primary);
  background: var(--bg-primary);
  box-shadow: var(--shadow-md);
}
```

### 3. 保持组件样式简洁

❌ **不推荐：**
```vue
<style scoped>
.my-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.my-card h2 {
  font-size: 20px;
  font-weight: 700;
  color: #333;
}
</style>
```

✅ **推荐：**
```vue
<template>
  <div class="card">
    <h2 class="text-xl text-bold">标题</h2>
  </div>
</template>

<style scoped>
/* 只定义特殊样式 */
.special-hover:hover {
  transform: scale(1.05);
}
</style>
```

### 4. 响应式设计

```css
/* 全局已定义移动端断点，直接使用 */
@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }
}
```

### 5. 过渡动画

```css
/* 使用预定义的 transition */
.hover-effect {
  transition: all var(--transition-base);
}

.hover-effect:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

---

## 🔧 自定义扩展

如果需要扩展全局样式：

1. 在 `global.css` 中添加新的 CSS 变量
2. 创建新的工具类
3. 文档化你的更改

```css
/* global.css */
:root {
  /* 添加新变量 */
  --my-custom-color: #ff6b6b;
}

/* 添加新工具类 */
.btn-danger {
  background: var(--my-custom-color);
  color: white;
}
```

---

## 📚 参考资源

- **全局样式文件**: `src/assets/styles/global.css`
- **示例组件**: 
  - `LoginPage1.vue` - 登录页面
  - `PostHomePage.vue` - 帖子列表
  - `PostCard.vue` - 帖子卡片
  - `LikeButton.vue` - 点赞按钮

---

**享受统一的设计系统带来的便利！** 🎉
