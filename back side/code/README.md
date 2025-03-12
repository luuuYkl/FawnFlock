# Fawn-Salvo

一个基于Rust和Salvo框架开发的现代化Web后端服务，提供用户认证、社交媒体功能等特性。

## 技术栈

- **框架**: Salvo (Rust Web框架)
- **数据库**: MySQL (使用Diesel ORM)
- **认证**: JWT (JSON Web Token)
- **API**: RESTful API
- **WebSocket**: 支持实时通信

## 主要功能

- 用户系统
  - 注册/登录
  - JWT认证
  - 用户信息管理
  - 头像更新
  - 声纹识别支持

- 社交功能
  - 发布帖子（支持文本、图片、视频、音频）
  - 评论系统
  - 点赞功能
  - 实时通信

## 环境要求

- Rust (最新稳定版)
- MySQL/MariaDB
- libmariadb (已包含在项目中)

## 快速开始

1. 克隆项目
```bash
git clone [项目地址]
cd fawn-salvo
```

2. 配置环境变量
创建`.env`文件，添加以下配置：
```env
DATABASE_URL=mysql://username:password@localhost/database_name
JWT_SECRET=your_jwt_secret
```

3. 安装依赖并运行
```bash
cargo build
cargo run
```

## API文档

### 用户相关

- `POST /user/register` - 用户注册
- `POST /user/auth` - 用户登录
- `GET /user/auth` - 验证登录状态
- `POST /user/head` - 更新用户头像
- `POST /user/get` - 获取用户信息

### 帖子相关

- `POST /post/create` - 创建帖子
- `GET /post/list` - 获取帖子列表
- `POST /post/like` - 点赞帖子
- `POST /post/comment` - 评论帖子

## 项目结构

```
src/
├── config.rs     # 配置管理
├── db/           # 数据库相关
├── handler/      # 请求处理器
├── model/        # 数据模型
├── router.rs     # 路由配置
└── main.rs       # 程序入口
```

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！