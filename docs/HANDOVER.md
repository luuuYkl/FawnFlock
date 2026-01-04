# FawnFlock — 项目接手文档

## 概述
- 项目目标：社区/帖子类单页应用（SPA），包含前端展示、开发用 mock 后端，及生产后端骨架（Rust）。
- 关键功能：帖子流（列表、详情、发布）、用户资料页（包含“我的声音”）、语音/声纹录入与播放、搜索/通知/私信/话题等辅助模块。

## 技术栈
- 前端：Vue 3、Vue Router 4、Vuex、Axios、Vue CLI、Storybook、Sass、Babel、ESLint。
- 开发后端（mock）：Node.js + Express + TypeScript（ts-node-dev），数据目录使用 JSON 文件与本地文件存储媒体。
- 生产后端（骨架/规划）：Rust（Salvo）、Diesel（MySQL）、Tokio、JWT、以及音频相关库（rodio、cpal、spectrum-analyzer）。

## 快速上手（开发环境）
1. 安装依赖（根目录）：
```bash
npm install
```
2. 启动前端开发服务器：
```bash
npm run serve
# 访问 http://localhost:8080/ （在 Codespace/VSCode 中请确保端口转发）
```
3. 启动 mock 后端（在 `mock-backend-service` 目录）：
```bash
cd mock-backend-service
npm install
npm run dev # 或使用 ts-node-dev src/server.ts
```
4. 生产打包：`npm run build`；Storybook：`npm run storybook`。

## 代码布局（重要位置）
- 前端：`src/`
  - 视图/页面：`src/views/`，组件：`src/components/`
  - 路由：`src/router/index.js`（首页 `/HomePage` 对应 `src/components/PostHomePage.vue`）
  - API 封装：`src/services/api.service.js`（包含 `voiceAPI` 等）
  - 配置：`src/config/api.config.js`
  - 布局/公共组件：`src/components/BaseLayout.vue`、`src/components/Footer.vue`
  - 关键页面：`src/components/PostHomePage.vue`（首页帖子流）、`src/views/UserProfile.vue`（用户页/我的声音）、`src/views/VoiceEnrollment.vue`（录音/上传）
- Mock 后端: `mock-backend-service/src/`
  - 路由：`mock-backend-service/src/routes/index.ts`
  - 控制器示例：`mock-backend-service/src/controllers/voiceController.ts`
  - 数据目录：`mock-backend-service/src/data/`（例如 `voices.json`, `voices_files/`）
- 后端骨架（Rust）：`back side/code/`（包含 `Cargo.toml` 与源码）

## 核心业务逻辑
- 帖子流：分页加载、上拉加载更多、帖子卡片渲染（`PostCard`）。
- 用户资料：展示用户信息、统计、编辑入口、`我的声音` 列表（播放/删除）。
- 语音录入：前端录音（MediaRecorder）或文件上传 → 转 base64 → POST 到 mock 后端 → 后端写文件并记录 metadata → 前端拉取并展示。
- 搜索/通知/消息/话题：已经 scaffold，并有 mock 接口与前端路由支撑基本交互。

## 主执行流程（高层）
1. 开发者启动 mock 后端与前端 dev server。前端通过 Axios 请求 `/api/*`。 
2. 用户操作触发请求，mock 后端读取/更新 JSON 与文件系统，返回 JSON。 
3. 前端接收响应并更新视图（列表、播放、删除）；事件 `voices-updated` 用于刷新语音列表。 
4. 生产化需要替换 mock 存储为数据库（MySQL）和真实文件存储，并完成鉴权、日志与监控。

## 主要 API（mock 示例）
- GET `/api/posts` — 帖子列表（分页）
- POST `/api/posts` — 创建帖子（mock）
- POST `/api/voices/enroll` — 提交 base64 音频并保存（返回 metadata 包含 `file_url`）
- POST `/api/voices/upload` — 上传媒体
- GET `/api/voices` — 列表（可选 `?user_id=`）
- DELETE `/api/voices/:id` — 删除录入（包含删除文件）

（具体路由与处理逻辑见 `mock-backend-service/src/routes/index.ts` 与控制器实现）

## 高风险 / 高复杂度模块
- 生产后端迁移：从 JSON 文件迁移到 MySQL（设计表结构、数据迁移、并发写入与事务保证）。
- 鉴权与安全：JWT 配置、接口权限校验、上传/删除权限、输入校验、防止未授权文件访问。 
- 音频处理：编码/采样率兼容、转码、存储与 CDN 分发、声纹模型（如需）与隐私合规。 
- 并发与性能：长列表虚拟化、媒体并发访问、后端异步处理/队列（转码/清理）。
- 实时功能（私信/通知）：websocket/消息中间件设计与可扩展性。 

## 已知问题与注意事项
- Mock 存储使用 JSON 文件，存在并发写入风险，开发时注意数据覆盖。 
- 路由命名（如 `/HomePage`）对体验有影响，建议统一并在 `BaseLayout` 中管理共享 UI（例如搜索栏）。
- 在 Codespace/远程容器中运行时请确保端口转发正确（例如 `8080`、`7878`）。

## 推荐优先改进（短期到中期）
1. 将 mock 存储替换为轻量数据库（SQLite/MySQL）并实现迁移脚本。 
2. 把搜索栏统一放入 `BaseLayout.vue`，消除每页重复实现。 
3. 将音频文件上传改为对象存储（S3）并通过 CDN 分发。 
4. 添加鉴权中间件与权限校验。 
5. 引入 E2E 测试（覆盖录音、上传、播放与删除流程）。

## 新成员上手 checklist
1. 准备：Node 16+、Rust toolchain（如需跑后端骨架）、MySQL（如需本地测试迁移）。
2. 运行项目：`npm install` → `npm run serve`；在另一个终端运行 mock 后端。 
3. 打开 `http://localhost:8080/HomePage` 检查首页行为（搜索栏、帖子列表、播放语音）。
4. 阅读关键文件：`src/components/PostHomePage.vue`、`src/views/UserProfile.vue`、`src/services/api.service.js`、`mock-backend-service/src/controllers/voiceController.ts`。 
5. 运行 lint 与 build：`npm run lint`、`npm run build`。

---
如需我把文档扩展为更详细的交接（包含 ER 图、数据库迁移脚本草案、生产部署步骤或 CI/CD 流程），请告知优先级与侧重点。
