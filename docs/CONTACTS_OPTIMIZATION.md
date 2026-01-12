# 联系人界面优化文档

## 概述

全新设计的联系人列表界面，采用现代化卡片式布局，支持搜索、筛选、分组和快速导航功能。

## 设计规范

### 布局结构

1. **顶部搜索栏（固定，56px）**
   - 高度：56px
   - 背景：#ffffff
   - 搜索框：40px 高，20px 圆角
   - 背景色：#f0f0f0（普通）/ #e9ecef（聚焦）

2. **筛选面板（可展开）**
   - 四种筛选选项：全部/在线/最近/星标
   - 胶囊式按钮：8px 内边距，20px 圆角
   - 激活色：#6366f1

3. **联系人列表（可滚动）**
   - 最小高度：calc(100vh - 112px)
   - 背景：#f5f5f5
   - 分组展示，首字母导航

4. **底部导航栏（固定，56px）**
   - 5 个导航项：首页/发现/发布/消息/我的
   - 激活色：#6366f1

### 联系人卡片

- **卡片高度**：自适应（约 72px）
- **背景**：#ffffff
- **内边距**：12px 16px
- **分隔线**：1px solid #f3f4f6
- **头像大小**：48px（移动端 44px）
- **头像圆角**：50%（圆形）
- **在线指示器**：12px 圆点，#10b981（在线）/ #d1d5db（离线）

### 文字规范

- **用户名**：16px（移动端 15px），#0f172a，字重 600
- **状态/最后消息**：13px（移动端 12px），#9ca3af
- **分组标题**：14px，#6b7280，字重 600，大写
- **未读数量**：11px，#ffffff，背景 #ef4444

### 颜色系统

```css
/* 主色调 */
--primary-color: #6366f1;
--secondary-color: #8b5cf6;

/* 背景色 */
--bg-primary: #ffffff;
--bg-secondary: #f5f5f5;
--bg-hover: #f9fafb;
--bg-active: #f3f4f6;

/* 文字色 */
--text-primary: #0f172a;
--text-secondary: #6b7280;
--text-tertiary: #9ca3af;

/* 状态色 */
--online-color: #10b981;
--offline-color: #d1d5db;
--unread-color: #ef4444;

/* 边框色 */
--border-light: #f3f4f6;
--border-medium: #e5e7eb;
```

## 核心功能

### 1. 搜索功能

```javascript
// 实时搜索，支持名称和状态搜索
handleSearch() {
  const query = this.searchQuery.toLowerCase();
  const filtered = this.contacts.filter(contact =>
    contact.name.toLowerCase().includes(query) ||
    (contact.status && contact.status.toLowerCase().includes(query))
  );
  return filtered;
}
```

### 2. 筛选功能

支持四种筛选模式：
- **全部**：显示所有联系人
- **在线**：仅显示在线用户
- **最近**：显示有最近消息的联系人
- **星标**：显示收藏的联系人

### 3. 分组展示

- **最近联系人**（置顶，最多 5 个）
  - 按最后消息时间降序排列
  - 仅在"全部"筛选模式下显示
  - 显示未读消息数量

- **字母分组**
  - 中文按拼音首字母分组
  - 英文按首字母分组
  - 其他字符归入 `#` 组
  - 组内按名称字母顺序排序

### 4. 快速导航

- 右侧字母索引条
- 点击字母滚动到对应分组
- 平滑滚动效果

### 5. 在线状态

- 绿色指示器：在线用户
- 灰色指示器：离线用户
- 位于头像右下角

### 6. 未读消息

- 红色数字徽章
- 超过 99 显示为 "99+"
- 位于卡片右上角

## 交互设计

### 点击行为

1. **点击联系人卡片**
   - 跳转到消息界面
   - 传递 contactId 参数

2. **点击"更多"按钮**
   - 显示联系人操作菜单
   - 阻止事件冒泡

3. **点击字母索引**
   - 滚动到对应分组
   - 平滑动画

### 悬停效果

- 联系人卡片：背景变为 #f9fafb
- 按钮：背景变为 #f3f4f6
- 字母索引：放大 1.2 倍

### 激活效果

- 卡片按下：缩小至 0.98 倍
- 按钮按下：缩小至 0.95 倍

## 动画效果

### 1. 入场动画

```css
@keyframes contactSlideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### 2. 筛选面板

- 展开：从顶部滑入，0.3s ease
- 收起：向顶部滑出，0.3s ease

### 3. 联系人列表

- 使用 `<TransitionGroup>` 包裹
- 进入：从左侧淡入滑入
- 离开：向右侧淡出滑出

## 响应式设计

### 移动端（< 480px）

- 头像：44px × 44px
- 用户名：15px
- 状态文字：12px
- 优化触摸目标大小

### 平板/桌面端（≥ 768px）

- 最大宽度：640px
- 居中显示
- 左右边框：1px solid #e5e7eb

## 数据结构

### 联系人对象

```javascript
{
  id: 1,                    // 唯一标识
  name: '张三',              // 用户名
  avatar: '',               // 头像 URL（可选）
  online: true,             // 在线状态
  status: '在线',            // 状态文字
  lastMessage: '好的',       // 最后消息预览
  lastTime: '2024-01-01',   // 最后消息时间
  unreadCount: 2,           // 未读消息数
  favorite: false           // 是否星标
}
```

## API 集成

### 获取联系人列表

```javascript
async fetchContacts() {
  try {
    // TODO: 替换为实际 API 调用
    const response = await messageAPI.getContacts();
    this.contacts = response.data;
  } catch (error) {
    console.error('获取联系人失败:', error);
  }
}
```

### 推荐 API 端点

- `GET /api/contacts` - 获取联系人列表
- `GET /api/contacts/search?q={query}` - 搜索联系人
- `PUT /api/contacts/{id}/favorite` - 添加/取消星标
- `GET /api/contacts/{id}` - 获取联系人详情

## 性能优化

### 1. 计算属性缓存

```javascript
computed: {
  filteredContacts() {
    // 自动缓存，仅在依赖项变化时重新计算
  },
  groupedContacts() {
    // 复杂的分组逻辑使用计算属性
  }
}
```

### 2. 图片懒加载

```javascript
handleImageError(e) {
  e.target.src = this.defaultAvatar; // 加载失败时使用默认头像
}
```

### 3. 虚拟滚动（可选）

对于超过 1000 个联系人的场景，建议使用虚拟滚动库如 `vue-virtual-scroller`。

### 4. 搜索防抖

```javascript
// 推荐使用 lodash.debounce 或自定义防抖
handleSearch: debounce(function() {
  // 搜索逻辑
}, 300)
```

## 可访问性

- 使用语义化 HTML 标签
- 为图标按钮添加 `title` 属性
- 键盘导航支持（Tab 键）
- 屏幕阅读器友好

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 已知问题

1. 中文拼音首字母映射不完整，建议使用完整的拼音库（如 `pinyin-pro`）
2. 联系人菜单功能待实现
3. WebSocket 实时在线状态同步待集成

## 后续优化方向

1. **实时更新**
   - WebSocket 连接
   - 在线状态实时同步
   - 新消息实时推送

2. **增强功能**
   - 长按菜单
   - 批量操作（删除、移动分组）
   - 视频通话入口

3. **性能提升**
   - 虚拟滚动
   - 图片懒加载优化
   - PWA 离线缓存

4. **用户体验**
   - 下拉刷新
   - 骨架屏加载
   - 手势操作（滑动删除等）

## 使用示例

### 1. 路由配置

```javascript
{
  path: '/contacts',
  name: 'Contacts',
  component: () => import('../views/Contacts.vue')
}
```

### 2. 导航跳转

```javascript
// 从其他页面跳转到联系人列表
this.$router.push({ name: 'Contacts' });

// 从联系人列表打开聊天
openChat(contact) {
  this.$router.push({ 
    name: 'Messages', 
    params: { contactId: contact.id } 
  });
}
```

### 3. API 集成

```javascript
// 在 services/api.service.js 中添加
export const messageAPI = {
  getContacts: () => http.get('/api/contacts'),
  searchContacts: (query) => http.get(`/api/contacts/search?q=${query}`),
  toggleFavorite: (id) => http.put(`/api/contacts/${id}/favorite`)
};
```

## 文件位置

- 主组件：`src/views/Contacts.vue`
- 路由配置：`src/router/index.js`
- API 服务：`src/services/api.service.js`
- 文档：`docs/CONTACTS_OPTIMIZATION.md`

## 总结

这个联系人界面实现了：

✅ 现代化卡片式设计  
✅ 完整的搜索和筛选功能  
✅ 智能分组和快速导航  
✅ 在线状态和未读消息显示  
✅ 流畅的动画和交互  
✅ 移动端优先的响应式设计  
✅ 与其他界面的设计统一性  

完全符合项目的设计规范和用户体验要求。
