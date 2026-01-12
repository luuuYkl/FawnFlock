# FawnFlock 声纹功能 - 快速开始指南

## 🚀 5 分钟快速开始

### 方式 1：使用 Docker Compose（推荐）

```bash
# 1. 构建镜像
docker-compose build

# 2. 启动所有服务
docker-compose up -d

# 3. 查看日志
docker-compose logs -f

# 4. 访问应用
# 前端：http://localhost:8080
# Mock 后端：http://localhost:3000
# Python AI：http://localhost:5000
```

### 方式 2：本地开发环境

#### 前置要求
- Node.js 18+
- Python 3.10+
- Git

#### 启动步骤

**第一步：启动 Python AI 服务**

```bash
cd voice-ai-service

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境
cp .env.example .env

# 启动服务
python app.py
# 服务运行在 http://localhost:5000
```

**第二步：启动 Mock 后端**

```bash
cd mock-backend-service

# 安装依赖
npm install

# 配置环境
export VOICE_AI_SERVICE_URL=http://localhost:5000

# 启动
npm run dev
# 服务运行在 http://localhost:3000
```

**第三步：启动前端**

在新的终端中：

```bash
# 根目录
npm install

npm run serve
# 前端运行在 http://localhost:8080
```

---

## 🧪 测试声纹功能

### 1. 录制声纹

1. 打开浏览器访问 http://localhost:8080
2. 导航到 **"声纹录入"** 页面
3. 点击 **"开始录音"**，录制 30-60 秒的语音
4. 点击 **"上传并提取"** 
5. 看到 **"✓ 声纹提取成功"** 提示

### 2. 测试 TTS 生成

```bash
# 使用 curl 调用 API
curl -X POST http://localhost:3000/api/voices/generate-tts \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "post_id": 1,
    "text": "你好，这是我发布的帖子，用我的声音",
    "lang": "zh-CN"
  }'
```

### 3. 检查健康状态

```bash
# Python AI 服务
curl http://localhost:5000/health

# Mock 后端
curl http://localhost:3000/api/posts
```

---

## 📁 项目结构

```
FawnFlock/
├── voice-ai-service/          # Python AI 微服务
│   ├── app.py                # 主应用
│   ├── config.py             # 配置
│   ├── requirements.txt       # Python 依赖
│   ├── Dockerfile            # Docker 镜像
│   └── README.md             # 详细文档
│
├── mock-backend-service/      # Mock 后端 (Node.js)
│   ├── src/
│   │   ├── controllers/voiceController.ts   # 声纹控制器
│   │   ├── routes/index.ts    # API 路由
│   │   └── data/              # JSON 数据
│   ├── Dockerfile            # Docker 镜像
│   └── package.json
│
├── src/                        # 前端代码 (Vue 3)
│   ├── services/api.service.js  # API 客户端
│   ├── views/VoiceEnrollmentV2.vue  # 新版录音页面
│   └── components/            # 组件
│
├── docs/
│   ├── VOICE_EMBEDDING_SPEC.md        # 技术规范
│   ├── VOICE_IMPLEMENTATION_GUIDE.md   # 实现指南
│   └── QUICK_START.md                  # 本文件
│
├── docker-compose.yml         # Docker Compose 配置
└── start-voice-services.sh    # 快速启动脚本
```

---

## 🎯 核心工作流

### 工作流 1：声纹提取

```
前端录音 (30-60秒)
   ↓
转 Base64
   ↓
POST /api/voices/enroll-with-embedding
   ↓
Mock 后端 → Python AI 服务
   ↓
Resemblyzer 提取 256 维向量
   ↓
保存到 voice_profiles.json
   ↓
✓ 成功
```

### 工作流 2：语音克隆 TTS

```
用户发帖 + "启用语音克隆"
   ↓
POST /api/voices/generate-tts
   {
     "user_id": 123,
     "text": "帖子内容",
     "post_id": 456
   }
   ↓
查询用户声纹 embedding
   ↓
YourTTS 生成语音
   ↓
保存 WAV 文件
   ↓
返回 voice_url
   ↓
前端显示 🔊 播放按钮
```

---

## 🛠️ 常见问题

### Q1: Python 服务启动很慢？
**A:** 首次启动需要下载模型（~500MB），通常需要 2-5 分钟。之后启动会很快。

### Q2: 出现 "连接拒绝" 错误？
**A:** 检查服务是否都启动了：
```bash
curl http://localhost:5000/health      # Python AI
curl http://localhost:3000/api/posts   # Mock 后端
```

### Q3: 内存不足？
**A:** 使用 CPU 模式（默认）或增加系统内存。编辑 `.env`：
```env
USE_GPU=False
```

### Q4: 生成的语音质量不好？
**A:** 
- 重新录制一段更清晰的声音
- 确保录音环境安静
- 录音时长至少 30 秒

### Q5: 如何重置所有数据？
**A:**
```bash
# 删除 JSON 数据
rm mock-backend-service/src/data/voice_profiles.json
rm mock-backend-service/src/data/voices.json

# 重启服务
npm run dev
```

---

## 📊 API 快速参考

### 声纹提取

```bash
POST /api/voices/enroll-with-embedding
Content-Type: application/json

{
  "user_id": 1,
  "audio_base64": "...",
  "filename": "voice.wav"
}
```

Response:
```json
{
  "success": true,
  "user_id": 1,
  "embedding_dim": 256,
  "audio_duration": 35.2,
  "audio_url": "/api/voices/files/..."
}
```

### 获取声纹信息

```bash
GET /api/users/1/voice-profile
```

### 生成 TTS

```bash
POST /api/voices/generate-tts
{
  "user_id": 1,
  "post_id": 1,
  "text": "你好",
  "lang": "zh-CN"
}
```

### 删除声纹

```bash
DELETE /api/users/1/voice-profile
```

---

## 🔗 相关链接

- [技术规范](../docs/VOICE_EMBEDDING_SPEC.md)
- [实现指南](../docs/VOICE_IMPLEMENTATION_GUIDE.md)
- [Python 服务文档](../voice-ai-service/README.md)
- [Resemblyzer](https://github.com/resemble-ai/Resemblyzer)
- [Coqui TTS](https://github.com/coqui-ai/TTS)

---

## 📞 需要帮助？

遇到问题时，检查以下日志：

```bash
# Python 服务日志
tail -f /tmp/voice-ai.log

# Mock 后端日志
tail -f /tmp/mock-backend.log

# 前端日志
# 在浏览器控制台 (F12) 查看
```

---

**祝你开发愉快！🎉**

最后更新：2026-01-12
