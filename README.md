# 🦌 FawnFlock - 社交媒体平台

一个基于 Vue 3 + TypeScript + Express 构建的现代化社交媒体应用。

![Status](https://img.shields.io/badge/status-active-success.svg)
![Vue](https://img.shields.io/badge/Vue-3.2.13-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## 📋 目录

- [项目简介](#项目简介)
- [技术栈](#技术栈)
- [功能特性](#功能特性)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [开发日志](#开发日志)
- [API 文档](#api-文档)
- [测试指南](#测试指南)
- [样式系统](#样式系统)

---

## 🎯 项目简介

FawnFlock 是一个功能完整的社交媒体平台，支持用户注册、登录、发帖、评论、点赞等核心社交功能。项目采用前后端分离架构，具有现代化的 UI 设计和流畅的用户体验。

### ✨ 核心亮点

- 🎨 **统一设计系统** - 基于 CSS 变量的全局样式系统
- 📱 **响应式设计** - 完美适配移动端和桌面端
- ⚡ **流畅交互** - 丰富的动画效果和过渡
- 🔐 **用户认证** - 完整的注册/登录系统
- 💬 **实时互动** - 评论、点赞功能
- 🎭 **状态管理** - 加载、错误、空状态的友好处理

---

## 🛠️ 技术栈

### 前端

- **框架**: Vue 3.2.13 (Composition API)
- **路由**: Vue Router 4.x
- **状态管理**: Vuex 4.x
- **HTTP 客户端**: Axios
- **样式**: CSS3 + CSS Variables
- **构建工具**: Vue CLI / Webpack

### 后端 (Mock)

- **运行时**: Node.js
- **框架**: Express.js
- **语言**: TypeScript
- **开发工具**: ts-node-dev
- **数据存储**: JSON 文件 (Mock)

### 后端 (生产环境)

- **语言**: Rust
- **框架**: Salvo
- **数据库**: MySQL / MariaDB
- **认证**: JWT

---

## 🚀 功能特性

### 已完成功能 ✅

#### 1. 用户系统
- [x] 登录页面 (渐变 UI + 动画效果)
- [x] 手机号注册/登录
- [x] 表单验证 (手机号格式、密码强度)
- [x] 密码强度指示器
- [x] 密码可见性切换
- [x] 实时验证反馈
- [x] 隐私协议确认

#### 2. 帖子功能
- [x] 帖子列表页
  - 骨架屏加载动画
  - 下拉刷新
  - 上拉加载更多 (分页)
  - 空状态提示
  - 错误处理 + 重试
- [x] 帖子详情页
  - 完整内容展示
  - 作者信息
  - 相对时间显示
  - 图片画廊
  - 返回/分享按钮
- [x] 帖子卡片组件
  - 悬停效果
  - 内容截断 (3行)
  - 点击跳转

#### 3. 互动功能
- [x] 点赞/取消点赞
- [x] 点赞数实时更新
- [x] 评论列表展示
- [x] 发表评论
- [x] 评论数统计
- [x] 字数限制 (500字)
- [x] 评论实时刷新

#### 4. UI/UX
- [x] 统一设计系统
- [x] 紫色渐变主题
- [x] 流畅动画效果
- [x] 响应式布局
- [x] 加载状态
- [x] 错误提示
- [x] 空状态设计

### 开发中功能 🔄

- [ ] 发帖功能 (CreatePost.vue)
  - 文本输入
  - 图片上传
  - 草稿保存
- [ ] 个人中心 (UserProfile.vue)
  - 用户信息
  - 我的帖子
  - 我的点赞

### 计划功能 📝

- [ ] 搜索功能
- [ ] 通知系统
- [ ] 私信功能
- [ ] 话题/标签
- [ ] 用户关注

---

## ⚡ 快速开始

### 环境要求

- Node.js >= 14.x
- npm >= 6.x

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/luuuYkl/FawnFlock.git
cd FawnFlock

# 安装前端依赖
npm install

# 安装 Mock 后端依赖
cd mock-backend-service
npm install
cd ..
```

### 启动开发服务

#### 方式一：使用脚本（推荐）

```bash
# 重启所有服务
./restart-services.sh
```

#### 方式二：手动启动

```bash
# 终端 1 - 启动 Mock 后端
cd mock-backend-service
npm run dev

# 终端 2 - 启动前端
npm run serve
```

### 访问应用

- **前端**: http://localhost:8080
- **后端 API**: http://localhost:7878
- **API 文档**: http://localhost:7878

### 生产环境构建

```bash
# 构建前端
npm run build

# 生产环境的后端配置 (Rust)
# 1. 在 back side/.env 配置数据库
DATABASE_URL="mysql://username:password@localhost/test"
JWT_SECRET="your_secret_key"

# 2. 运行 Rust 后端
cd "back side/code"
cargo run
```

---

## 📁 项目结构

```
FawnFlock/
├── public/                      # 静态资源
├── src/                         # 前端源码
│   ├── assets/                  # 资源文件
│   │   └── styles/
│   │       └── global.css       # 全局样式系统
│   ├── components/              # Vue 组件
│   │   ├── BaseLayout.vue       # 基础布局
│   │   ├── Footer.vue           # 页脚
│   │   ├── PostHomePage.vue     # 帖子列表页
│   │   ├── DevTools/            # 开发工具
│   │   └── posts/               # 帖子相关组件
│   │       ├── PostCard.vue     # 帖子卡片
│   │       ├── PostDetail.vue   # 帖子详情
│   │       ├── LikeButton.vue   # 点赞按钮
│   │       └── CommentButton.vue # 评论按钮
│   ├── config/                  # 配置文件
│   │   └── api.config.js        # API 端点配置
│   ├── router/                  # 路由配置
│   │   └── index.js             # 路由定义
│   ├── services/                # 服务层
│   │   └── api.service.js       # API 服务
│   ├── store/                   # Vuex 状态管理
│   │   └── index.js
│   ├── utils/                   # 工具函数
│   │   └── http.js              # HTTP 客户端
│   ├── views/                   # 页面组件
│   │   ├── LoginPage/           # 登录相关页面
│   │   │   ├── LoginPage1.vue   # 登录首页
│   │   │   └── LoginPagePhoneNumber.vue # 手机号登录
│   │   ├── CreatePost.vue       # 发帖页面
│   │   └── HomePage/
│   ├── App.vue                  # 根组件
│   └── main.js                  # 入口文件
├── mock-backend-service/        # Mock 后端服务
│   ├── src/
│   │   ├── controllers/         # 控制器
│   │   │   ├── userController.ts
│   │   │   ├── postController.ts
│   │   │   └── commentController.ts
│   │   ├── data/                # 模拟数据
│   │   │   ├── users.json
│   │   │   ├── posts.json
│   │   │   └── comments.json
│   │   ├── routes/              # 路由
│   │   │   └── index.ts
│   │   └── server.ts            # 服务器入口
│   ├── package.json
│   └── tsconfig.json
├── back side/                   # Rust 后端 (生产)
│   └── code/
│       ├── src/
│       └── Cargo.toml
├── STYLE_GUIDE.md               # 样式使用指南
├── TEST_GUIDE.md                # 测试指南
├── README.md                    # 项目文档
└── package.json                 # 前端依赖

```

---

## 📝 开发日志

### 2025-10-29 - 核心功能完成

#### ✅ 完成的工作

**1. 全局样式系统**
- 创建统一的设计系统 (`src/assets/styles/global.css`)
- 定义 CSS 变量：颜色、间距、字体、阴影、圆角
- 创建工具类：按钮、卡片、输入框、消息提示
- 预定义动画：spin、loading、slideIn、fadeIn、float、shake
- 响应式设计：移动端、平板、桌面端断点
- 编写样式使用指南 (`STYLE_GUIDE.md`)

**2. 登录/注册系统**
- `LoginPage1.vue` - 登录首页
  - 渐变紫色背景
  - Logo 浮动动画
  - 现代化按钮样式
  - 隐私协议验证
- `LoginPagePhoneNumber.vue` - 手机号登录
  - 手机号格式验证 (正则: `/^1[3-9]\d{9}$/`)
  - 密码强度指示器 (弱/中/强)
  - 密码可见性切换
  - 实时表单验证
  - 错误提示优化
  - 成功/失败消息

**3. 帖子列表页 (PostHomePage.vue)**
- 骨架屏加载 (3个骨架卡片 + 波浪动画)
- 下拉刷新 (移动端触摸支持)
- 上拉加载更多 (滚动分页)
- 空状态提示 (友好的空数据界面)
- 错误处理 (重试按钮)
- 现代化 UI (渐变背景、卡片阴影)
- 发帖按钮 (导航到 CreatePost)
- TransitionGroup 列表动画

**4. 帖子详情页 (PostDetail.vue)**
- 完整帖子内容展示
- 作者信息 (头像 + 名称 + 时间)
- 相对时间显示 (刚刚/5分钟前/2小时前)
- 图片画廊 (多图支持)
- 返回按钮
- 分享功能 (Web Share API + 复制链接降级)
- 点赞功能 (集成 LikeButton)
- 评论系统：
  - 评论输入框 (500字限制)
  - 字数统计 (超450字警告)
  - 实时表单验证
  - 发送按钮 (加载状态)
  - 评论列表 (时间倒序)
  - 空状态提示
  - 滑入动画

**5. 组件优化**
- `PostCard.vue`
  - 使用全局样式变量
  - 悬停效果 (上移 + 阴影)
  - 内容截断 (3行 + 省略号)
  - 修复 CSS 兼容性 (line-clamp)
- `LikeButton.vue`
  - Emoji 图标 (🤍 → ❤️)
  - 点击动画 (scale 放大)
  - 圆角边框样式
  - hover 变色效果
- `CommentButton.vue`
  - 统一样式
  - Emoji 图标 (💬)

**6. Mock 后端服务**
- 用户 API
  - `POST /api/users/login` - 登录
  - `POST /api/users/register` - 注册
  - `GET /api/users/:id` - 获取用户信息
  - `PUT /api/users/:id/avatar` - 更新头像
- 帖子 API
  - `GET /api/posts` - 获取帖子列表
  - `GET /api/posts/:id` - 获取帖子详情
  - `POST /api/posts` - 创建帖子
  - `POST /api/posts/:id/like` - 点赞
  - `DELETE /api/posts/:id/like` - 取消点赞
- 评论 API
  - `GET /api/posts/:postId/comments` - 获取评论列表
  - `POST /api/posts/:postId/comments` - 发表评论
  - `DELETE /api/comments/:commentId` - 删除评论
- CORS 配置完善
- 测试数据准备 (3篇帖子 + 5条评论)

**7. 路由配置**
- `/` - 登录首页
- `/LoginPagePhoneNumber` - 手机号登录
- `/HomePage` - 帖子列表
- `/post/:id` - 帖子详情 (动态路由)
- `/create-post` - 发帖页面 (占位)

**8. 文档完善**
- `STYLE_GUIDE.md` - 样式使用指南
  - CSS 变量完整列表
  - 工具类使用示例
  - 最佳实践
- `TEST_GUIDE.md` - 测试指南
  - 详细测试清单 (30+ 测试点)
  - 测试流程
  - 调试工具
  - API 测试示例

#### 🐛 修复的问题

1. **CORS 错误** - 添加 `x-api-mode` 到 allowedHeaders
2. **路由参数不匹配** - 统一使用 `id` 而非 `postId`
3. **API 端点缺失** - 补充所有必需的端点
4. **点赞/取消点赞** - 统一使用 RESTful 设计 (POST/DELETE)
5. **CSS 兼容性** - 添加标准 `line-clamp` 属性
6. **登录 UX** - 优化表单验证和错误提示
7. **评论刷新** - 发表后自动重新加载列表

#### 📊 技术决策

- **设计系统**: 采用 CSS 变量 + 工具类模式，便于维护
- **主题色**: 紫色渐变 (#667eea → #764ba2)
- **状态管理**: 组件内 data，暂未使用 Vuex (简化开发)
- **数据存储**: Mock 阶段使用 JSON 文件
- **时间格式**: 相对时间显示 (提升用户体验)
- **API 设计**: RESTful 风格
- **错误处理**: 统一的错误提示 + 重试机制

#### 🎯 下一步计划

1. **发帖功能** (CreatePost.vue)
   - 文本输入框
   - 图片上传
   - 草稿保存
   - 字数限制

2. **个人中心** (UserProfile.vue)
   - 用户信息展示
   - 头像上传
   - 我的帖子列表
   - 我的点赞

3. **功能增强**
   - 搜索功能
   - 通知系统
   - 私信功能
   - 话题标签

---

## 🔌 API 文档

### 基础信息

- **Base URL**: `http://localhost:7878/api`
- **Content-Type**: `application/json`
- **自定义 Header**: `x-api-mode: mock` (可选)

### 用户相关

#### 登录
```http
POST /users/login
Content-Type: application/json

{
  "phone": "13800138000",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "user_id": 1,
    "username": "测试用户",
    "phone": "13800138000"
  }
}
```

#### 注册
```http
POST /users/register
Content-Type: application/json

{
  "phone": "13800138000",
  "password": "password123",
  "username": "测试用户"
}

Response:
{
  "success": true,
  "user_id": 1
}
```

### 帖子相关

#### 获取帖子列表
```http
GET /posts?page=1&pageSize=10

Response:
[
  {
    "post_id": 1,
    "user_id": 1,
    "author": "测试用户",
    "title": "欢迎来到 FawnFlock",
    "content": "这是第一篇帖子...",
    "like_count": 10,
    "comment_count": 5,
    "created_at": "2025-10-29T08:00:00.000Z"
  }
]
```

#### 获取帖子详情
```http
GET /posts/:id

Response:
{
  "post_id": 1,
  "user_id": 1,
  "author": "测试用户",
  "title": "欢迎来到 FawnFlock",
  "content": "这是第一篇帖子的完整内容...",
  "media_urls": [],
  "like_count": 10,
  "comment_count": 5,
  "created_at": "2025-10-29T08:00:00.000Z"
}
```

#### 点赞/取消点赞
```http
POST /posts/:id/like
DELETE /posts/:id/like

Response:
{
  "success": true,
  "like_count": 11
}
```

### 评论相关

#### 获取评论列表
```http
GET /posts/:postId/comments

Response:
[
  {
    "comment_id": 1,
    "post_id": 1,
    "user_id": 2,
    "author": "小明",
    "content": "很棒的帖子！",
    "created_at": "2025-10-29T10:30:00.000Z"
  }
]
```

#### 发表评论
```http
POST /posts/:postId/comments
Content-Type: application/json

{
  "user_id": 1,
  "author": "测试用户",
  "content": "这是一条评论"
}

Response:
{
  "success": true,
  "comment": {
    "comment_id": 6,
    "post_id": 1,
    "user_id": 1,
    "author": "测试用户",
    "content": "这是一条评论",
    "created_at": "2025-10-29T12:00:00.000Z"
  }
}
```

---

## 🧪 测试指南

详细的测试指南请查看 [TEST_GUIDE.md](./TEST_GUIDE.md)

### 快速测试流程

1. **启动服务**
```bash
./restart-services.sh
```

2. **访问应用**
- 前端: http://localhost:8080
- 后端: http://localhost:7878

3. **测试路径**
```
登录 (/) 
  → 手机号登录 (/LoginPagePhoneNumber)
  → 帖子列表 (/HomePage)
  → 帖子详情 (/post/1)
  → 发表评论
```

4. **验证功能**
- [ ] 登录表单验证
- [ ] 密码强度指示器
- [ ] 帖子列表加载
- [ ] 点赞/取消点赞
- [ ] 查看帖子详情
- [ ] 发表评论
- [ ] 评论实时更新

---

## 🎨 样式系统

详细的样式指南请查看 [STYLE_GUIDE.md](./STYLE_GUIDE.md)

### 设计令牌

```css
/* 主题色 */
--primary-color: #667eea
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%)

/* 状态色 */
--success-color: #52c41a
--error-color: #ff4d4f
--warning-color: #faad14
--info-color: #1890ff

/* 间距 */
--spacing-sm: 10px
--spacing-md: 15px
--spacing-lg: 20px
--spacing-xl: 30px

/* 圆角 */
--border-radius-md: 12px
--border-radius-lg: 20px
--border-radius-xl: 25px
```

### 工具类示例

```html
<!-- 按钮 -->
<button class="btn btn-primary">主要按钮</button>
<button class="btn btn-secondary">次要按钮</button>

<!-- 卡片 -->
<div class="card">内容</div>

<!-- 消息提示 -->
<div class="message message-success">成功</div>
<div class="message message-error">错误</div>

<!-- 布局 -->
<div class="flex-center">居中</div>
<div class="flex-between">两端对齐</div>
```

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 遵循 ESLint 配置
- 使用全局样式变量而非硬编码
- 组件命名使用 PascalCase
- 文件名使用 camelCase 或 PascalCase
- 添加适当的注释

---

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

---

## 👥 团队

- **开发者**: luuuYkl
- **项目**: FawnFlock
- **创建时间**: 2025-10

---

## 📞 联系方式

- **GitHub**: [@luuuYkl](https://github.com/luuuYkl)
- **项目地址**: https://github.com/luuuYkl/FawnFlock

---

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

**Happy Coding! 🎉**

