# 声纹功能技术规范文档

## 1. 整体架构

### 功能拆解
- **功能1：声纹提取** - 从已录入语音提取固定维度的特征向量（Speaker Embedding）
- **功能2：语音克隆** - 基于声纹向量，将文本转换为用户的声音（Voice Cloning TTS）

### 技术选型
| 模块 | 技术栈 | 说明 |
|------|--------|------|
| 声纹提取 | Resemblyzer | Python库，开箱即用，无需训练 |
| 语音克隆 | YourTTS / Coqui TTS | 多说话人TTS，支持零样本适应 |
| 前端录音 | Web Audio API + MediaRecorder | 浏览器原生，无需第三方库 |
| 数据存储 | MySQL (Diesel ORM) | 存储向量和元数据 |

---

## 2. 数据库设计

### 新增表：user_voice_profile

```sql
CREATE TABLE user_voice_profile (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    voice_embedding LONGBLOB NOT NULL,  -- 256维float向量（JSON或Binary）
    embedding_model VARCHAR(64) DEFAULT 'resemblyzer_v1',
    audio_sample_url VARCHAR(255),      -- 原始音频备份URL
    voice_enabled BOOLEAN DEFAULT TRUE, -- 是否允许生成语音
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

### 修改表：posts

```sql
ALTER TABLE posts ADD COLUMN voice_url VARCHAR(255) AFTER audio_url;
ALTER TABLE posts ADD COLUMN voice_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE posts ADD COLUMN original_speaker_id INT AFTER voice_enabled;
```

---

## 3. 前端规范

### 录音规范
- **时长**：30-60秒（最低10秒）
- **采样率**：16kHz
- **声道**：单声道（Mono）
- **格式**：WAV / WebM
- **环境**：安静，单人，无背景音乐

### 文件大小限制
- 单个音频：≤ 10MB
- 文本转语音：≤ 500字符

---

## 4. API 设计

### 4.1 声纹上传与提取

**POST /api/voices/enroll**
```json
Request:
{
  "user_id": 123,
  "audio_base64": "..."
}

Response:
{
  "success": true,
  "user_id": 123,
  "embedding": [0.123, -0.456, ...],  // 256维向量
  "embedding_dim": 256,
  "audio_url": "/api/voices/files/xxx.wav"
}
```

### 4.2 获取用户声纹信息

**GET /api/users/:id/voice-profile**
```json
Response:
{
  "user_id": 123,
  "has_voice_profile": true,
  "voice_enabled": true,
  "embedding_dim": 256
}
```

### 4.3 语音克隆 TTS

**POST /api/voices/tts-clone**
```json
Request:
{
  "user_id": 123,
  "text": "你好，这是我发布的帖子",
  "lang": "zh-CN"
}

Response:
{
  "success": true,
  "voice_url": "/api/voices/generated/post_123_tts.mp3",
  "duration": 3.2,
  "created_at": "2026-01-12T10:00:00Z"
}
```

### 4.4 删除声纹信息

**DELETE /api/voices/profile**
```json
Request:
{
  "user_id": 123
}

Response:
{
  "success": true,
  "message": "声纹信息已删除"
}
```

---

## 5. 后端实现（Python 微服务）

### 为什么需要 Python 微服务？
- Resemblyzer 和 YourTTS 是 Python 库
- 与 Rust 主服务通过 HTTP 或 gRPC 通信
- 可独立扩展，专注于 AI/ML 任务

### 服务架构

```
┌─────────────────┐
│  Rust 后端      │
│  (Salvo)        │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│ Python AI服务   │
│ - Resemblyzer   │
│ - YourTTS       │
└─────────────────┘
```

---

## 6. 产品化功能

### 用户引导
- 首次进入录音页面时显示说明
- 录音过程中显示实时反馈
- 建议录音内容和环境

### 权限控制
- 用户可在"我的声音"页面关闭语音克隆功能
- 关闭后，他人无法生成该用户的语音
- 已生成的语音文件保留，但不再生成新的

### 文本限制
- 发帖时文本限制 ≤ 500 字符
- 超出限制时提示用户

---

## 7. 隐私与安全

- ✅ 不公开存储原始音频（仅存备份URL）
- ✅ 声纹向量是用户隐私数据，需加密存储
- ✅ 用户可随时删除声纹信息
- ✅ 生成的语音文件需版权声明

---

## 8. 开发时间表

| 阶段 | 任务 | 预计时间 |
|------|------|---------|
| 1 | 数据库 Schema + API 设计 | 1-2小时 |
| 2 | Python 微服务基础 | 2-3小时 |
| 3 | 前端录音优化 | 1-2小时 |
| 4 | 前端发帖集成 | 1-2小时 |
| 5 | 播放与测试 | 1-2小时 |

---

## 9. 参考资源

- Resemblyzer: https://github.com/resemble-ai/Resemblyzer
- Coqui TTS: https://github.com/coqui-ai/TTS
- YourTTS: https://github.com/Edresson/YourTTS
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
