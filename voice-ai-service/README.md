# FawnFlock 声纹 AI 微服务

Python Flask 微服务，专门处理声纹提取和语音克隆任务。

## 功能

- 🎤 **声纹提取**：使用 Resemblyzer 从音频中提取 256 维的 Speaker Embedding
- 🎵 **语音克隆 TTS**：使用 YourTTS 基于声纹向量生成自然语音
- 📤 **音频处理**：支持 Base64 编码/解码，自动音频格式转换
- 🔒 **文件管理**：安全的文件存储和访问

## 快速开始

### 1. 安装依赖

```bash
cd voice-ai-service
pip install -r requirements.txt
```

### 2. 配置环境

创建 `.env` 文件：

```env
DEBUG=True
PORT=5000
HOST=0.0.0.0
UPLOAD_DIR=./uploads
GENERATED_DIR=./generated
USE_GPU=False  # 如果有 GPU，改为 True
BACKEND_URL=http://localhost:8000
```

### 3. 启动服务

```bash
python app.py
```

或使用 Gunicorn（生产环境）：

```bash
gunicorn --workers 4 --bind 0.0.0.0:5000 app:app
```

## API 端点

### 1. 健康检查

```
GET /health

Response:
{
  "status": "ok",
  "service": "fawnflock-voice-ai"
}
```

### 2. 提取声纹

```
POST /api/voices/extract-embedding

Request:
{
  "audio_base64": "...",
  "user_id": 123
}

Response:
{
  "success": true,
  "user_id": 123,
  "embedding": [0.123, -0.456, ...],
  "embedding_dim": 256,
  "audio_duration": 3.5,
  "audio_url": "/api/voices/audio/user_123_20260112_100000.wav",
  "timestamp": "2026-01-12T10:00:00Z"
}
```

### 3. 语音克隆 TTS

```
POST /api/voices/clone-tts

Request:
{
  "user_id": 123,
  "embedding": [0.123, -0.456, ...],
  "text": "你好，这是我发布的帖子",
  "lang": "zh-CN",
  "speed": 1.0
}

Response:
{
  "success": true,
  "user_id": 123,
  "audio_base64": "...",
  "duration": 3.2,
  "sample_rate": 22050,
  "audio_url": "/api/voices/generated/tts_user_123_20260112_100000.wav",
  "timestamp": "2026-01-12T10:00:00Z"
}
```

### 4. 下载音频

```
GET /api/voices/audio/<filename>
GET /api/voices/generated/<filename>
```

## 配置选项

参见 `config.py` 文件。

## 与 Mock 后端集成

Mock 后端（Node.js）应该调用此服务来处理声纹和 TTS 请求。

示例（`mock-backend-service/src/controllers/voiceController.ts`）：

```typescript
import axios from 'axios';

const VOICE_AI_SERVICE = process.env.VOICE_AI_SERVICE || 'http://localhost:5000';

export const extractEmbedding = async (userId: number, audioBase64: string) => {
  const response = await axios.post(`${VOICE_AI_SERVICE}/api/voices/extract-embedding`, {
    user_id: userId,
    audio_base64: audioBase64
  });
  return response.data;
};

export const cloneTTS = async (userId: number, embedding: number[], text: string) => {
  const response = await axios.post(`${VOICE_AI_SERVICE}/api/voices/clone-tts`, {
    user_id: userId,
    embedding,
    text,
    lang: 'zh-CN'
  });
  return response.data;
};
```

## 部署建议

### Docker 部署

创建 `Dockerfile`：

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "--workers", "2", "--bind", "0.0.0.0:5000", "app:app"]
```

构建和运行：

```bash
docker build -t fawnflock-voice-ai .
docker run -p 5000:5000 \
  -e UPLOAD_DIR=/app/uploads \
  -e GENERATED_DIR=/app/generated \
  -e USE_GPU=false \
  fawnflock-voice-ai
```

### GPU 支持

如果使用 GPU（CUDA）：

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
docker run --gpus all -p 5000:5000 -e USE_GPU=true fawnflock-voice-ai
```

## 故障排除

### 模型下载缓慢

首次运行时，模型会自动下载。这可能需要几分钟。

```bash
# 预先下载模型
python -c "from TTS.api import TTS; TTS(model_name='tts_models/multilingual/multi-dataset/your_tts', gpu=False)"
```

### 内存不足

如果内存不足：

1. 减少工作进程数
2. 使用 CPU 模式（`USE_GPU=False`）
3. 增加服务器内存

## 开发

### 测试

```bash
python -m pytest tests/
```

### 代码风格

使用 Black 和 Flake8：

```bash
black app.py config.py
flake8 app.py config.py
```

## 许可证

MIT License
