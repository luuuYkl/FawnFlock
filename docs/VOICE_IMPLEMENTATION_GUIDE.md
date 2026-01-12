# 声纹功能实现集成指南

## 📦 已完成的组件

### 1. **技术规范文档** ✓
- 文件：[docs/VOICE_EMBEDDING_SPEC.md](../docs/VOICE_EMBEDDING_SPEC.md)
- 内容：完整的架构设计、API 规范、数据库设计

### 2. **Python AI 微服务** ✓
- 目录：`voice-ai-service/`
- 核心功能：
  - 声纹提取（Resemblyzer）
  - 语音克隆 TTS（YourTTS）
  - Base64 音频处理

### 3. **Mock 后端增强** ✓
- 文件：[mock-backend-service/src/controllers/voiceController.ts](../mock-backend-service/src/controllers/voiceController.ts)
- 新增函数：
  - `enrollWithEmbedding()` - 声纹提取并注册
  - `generateTTS()` - 生成语音克隆
  - `getUserVoiceProfile()` - 获取声纹信息
  - `deleteVoiceProfile()` - 删除声纹
  - `updateVoiceProfile()` - 更新权限

### 4. **前端 API 服务** ✓
- 文件：[src/services/api.service.js](../src/services/api.service.js)
- 新增 API：
  - `voiceAPI.enrollWithEmbedding()` - 声纹提取
  - `voiceAPI.getVoiceProfile()` - 获取信息
  - `voiceAPI.generateTTS()` - 生成语音
  - `voiceAPI.updateVoiceProfile()` - 更新权限

### 5. **改进的录音组件** ✓
- 文件：[src/views/VoiceEnrollmentV2.vue](../src/views/VoiceEnrollmentV2.vue)
- 特性：
  - 实时时长计数
  - 音量指示器
  - 录音质量建议
  - 成功反馈
  - 支持文件上传

---

## 🚀 部署与集成步骤

### 步骤 1：启动 Python AI 微服务

```bash
# 进入服务目录
cd voice-ai-service

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境（可选）
cp .env.example .env

# 启动服务
python app.py
# 或使用 Gunicorn（生产）
# gunicorn --workers 2 --bind 0.0.0.0:5000 app:app
```

**服务将运行在** `http://localhost:5000`

### 步骤 2：配置 Mock 后端

```bash
cd mock-backend-service

# 设置环境变量
export VOICE_AI_SERVICE_URL=http://localhost:5000

# 安装依赖（如果需要）
npm install

# 启动 Mock 后端
npm run dev
```

**Mock 后端将运行在** `http://localhost:3000`

### 步骤 3：配置前端

更新 [src/config/api.config.js](../src/config/api.config.js)：

```javascript
// 确保 MOCK_BACKEND_URL 指向 Mock 后端
export const MOCK_BACKEND_URL = 'http://localhost:3000/api';

// 或动态获取
export const MOCK_BACKEND_URL = process.env.VUE_APP_MOCK_BACKEND_URL || 'http://localhost:3000/api';
```

### 步骤 4：启动前端开发服务器

```bash
npm run serve
# 访问 http://localhost:8080/
```

---

## 🎯 核心工作流

### 工作流 1：声纹提取

```
用户录音（30-60秒）
     ↓
前端：录音 → 转 Base64
     ↓
API: POST /api/voices/enroll-with-embedding
     ↓
Mock 后端调用 Python 服务
     ↓
Resemblyzer 提取 256 维向量
     ↓
保存到 voice_profiles.json
     ↓
返回成功消息 + embedding_dim
```

### 工作流 2：语音克隆（TTS）

```
用户发布帖子 + 启用语音克隆
     ↓
前端获取帖子文本
     ↓
API: POST /api/voices/generate-tts
  {
    "user_id": 123,
    "text": "帖子内容",
    "post_id": 456
  }
     ↓
Mock 后端查询用户声纹
     ↓
调用 Python 服务 YourTTS
  - 输入：文本 + embedding 向量
  - 输出：WAV 音频
     ↓
保存音频文件
     ↓
更新 posts.json 的 voice_url
     ↓
返回 voice_url + duration
     ↓
前端显示播放按钮
```

---

## 📱 前端集成示例

### 示例 1：在 VoiceEnrollment 页面使用

```vue
<script>
import { voiceAPI } from '@/services/api.service';

export default {
  methods: {
    async enrollVoice() {
      try {
        const response = await voiceAPI.enrollWithEmbedding(
          userId,
          audioBase64,
          'voice.wav'
        );

        if (response.success) {
          console.log('声纹提取成功:', response);
          // embedding_dim: 256
          // audio_duration: 35.2 秒
        }
      } catch (error) {
        console.error('失败:', error);
      }
    }
  }
}
</script>
```

### 示例 2：在发帖页面启用语音克隆

```vue
<template>
  <div class="create-post">
    <input v-model="postText" placeholder="说出你的想法...">
    
    <!-- 声纹状态检查 -->
    <div v-if="userHasVoiceProfile">
      <label>
        <input v-model="enableVoiceClone" type="checkbox">
        启用语音克隆
      </label>
    </div>

    <button @click="publishPost">发布</button>
  </div>
</template>

<script>
import { voiceAPI, postAPI } from '@/services/api.service';

export default {
  data() {
    return {
      postText: '',
      enableVoiceClone: false,
      userHasVoiceProfile: false
    };
  },

  async mounted() {
    // 检查用户是否有声纹
    try {
      const profile = await voiceAPI.getVoiceProfile(userId);
      this.userHasVoiceProfile = profile.has_voice_profile;
    } catch (error) {
      console.log('用户没有声纹');
    }
  },

  methods: {
    async publishPost() {
      // 1. 创建帖子
      const post = await postAPI.createPost(
        userId,
        '帖子标题',
        this.postText
      );

      // 2. 如果启用了语音克隆，生成 TTS
      if (this.enableVoiceClone) {
        const ttsResult = await voiceAPI.generateTTS(
          userId,
          this.postText,
          post.post_id,
          'zh-CN'
        );

        post.voice_url = ttsResult.voice_url;
      }

      return post;
    }
  }
}
</script>
```

### 示例 3：播放语音

```vue
<template>
  <div class="post-card">
    <p>{{ post.content }}</p>

    <!-- 语音播放按钮 -->
    <div v-if="post.voice_url" class="voice-player">
      <button @click="togglePlay">
        {{ isPlaying ? '⏸' : '▶' }} 听我的声音
      </button>
      <audio
        ref="audioPlayer"
        :src="post.voice_url"
        @play="isPlaying = true"
        @pause="isPlaying = false"
      ></audio>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    post: Object
  },

  data() {
    return {
      isPlaying: false
    };
  },

  methods: {
    togglePlay() {
      const audio = this.$refs.audioPlayer;
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    }
  }
}
</script>
```

---

## 🗄️ 数据库增强（Rust 后端）

### 需要添加的 Diesel 迁移

```bash
cd "back side/code"

# 创建迁移
diesel migration generate add_voice_profile
```

编辑 `migrations/[timestamp]_add_voice_profile/up.sql`：

```sql
CREATE TABLE user_voice_profile (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    voice_embedding LONGBLOB NOT NULL,
    embedding_model VARCHAR(64) DEFAULT 'resemblyzer_v1',
    audio_sample_url VARCHAR(255),
    voice_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

ALTER TABLE posts ADD COLUMN voice_url VARCHAR(255) AFTER audio_url;
ALTER TABLE posts ADD COLUMN voice_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE posts ADD COLUMN original_speaker_id INT AFTER voice_enabled;
```

运行迁移：

```bash
diesel migration run
```

### Rust 模型定义

在 `back side/code/src/model/voice_profile_model.rs`：

```rust
use diesel::prelude::*;
use serde::{Serialize, Deserialize};

#[derive(Queryable, Serialize, Deserialize)]
pub struct VoiceProfile {
    pub id: i32,
    pub user_id: i32,
    pub voice_embedding: Vec<u8>,  // 存储 float 向量的二进制表示
    pub embedding_model: String,
    pub audio_sample_url: Option<String>,
    pub voice_enabled: bool,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub updated_at: Option<chrono::NaiveDateTime>,
}

#[derive(Insertable, Serialize, Deserialize)]
#[table_name = "user_voice_profile"]
pub struct NewVoiceProfile {
    pub user_id: i32,
    pub voice_embedding: Vec<u8>,
    pub embedding_model: String,
    pub audio_sample_url: Option<String>,
}
```

---

## 🧪 测试 API

### 使用 cURL 测试声纹提取

```bash
# 1. 准备一个音频文件并转 Base64
BASE64=$(base64 < voice.wav | tr -d '\n')

# 2. 调用 Mock 后端 API
curl -X POST http://localhost:3000/api/voices/enroll-with-embedding \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": 1,
    \"audio_base64\": \"$BASE64\",
    \"filename\": \"voice.wav\"
  }"
```

### 使用 cURL 测试 TTS

```bash
curl -X POST http://localhost:3000/api/voices/generate-tts \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "post_id": 1,
    "text": "你好，这是我发布的帖子",
    "lang": "zh-CN"
  }'
```

---

## 🔒 安全与隐私建议

1. **加密存储声纹向量**
   - 使用 AES-256 加密存储 embedding
   - 密钥存储在环境变量中

2. **访问控制**
   - 声纹向量不返回给前端（仅返回元数据）
   - 只有用户本人可以查看/删除自己的声纹

3. **音频备份**
   - 原始音频文件可以删除，保留 embedding
   - 提供用户手动删除选项

4. **生成的语音**
   - 添加版权声明：「本语音由 AI 基于用户声纹生成」
   - 记录 TTS 生成日志

---

## 📊 监控与调试

### Python 服务日志

```python
# 在 app.py 中启用详细日志
logging.basicConfig(level=logging.DEBUG)
```

### Mock 后端日志

```bash
# 启用详细日志
DEBUG=true npm run dev
```

### 常见问题排查

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| 连接 Python 服务超时 | 服务未启动 | 检查 `http://localhost:5000/health` |
| 模型加载缓慢 | 首次加载模型 | 预先下载模型或增加超时时间 |
| 内存溢出 | 音频太长或模型太大 | 限制音频长度或使用 CPU 模式 |
| 生成语音质量差 | embedding 质量不好 | 建议用户重新录音 |

---

## 📈 后续优化方向

1. **性能优化**
   - 使用模型量化减小体积
   - 缓存预加载的模型
   - 实现异步任务队列

2. **功能增强**
   - 支持多语言
   - 实现声音相似度匹配
   - 添加语音克隆质量评分

3. **用户体验**
   - 实时反馈（录音质量评分）
   - 离线录音支持
   - 语音换肤（多种声音选择）

4. **商业化**
   - 限制每日 TTS 生成次数
   - 付费优先级队列
   - 语音素材库

---

## 📚 参考资源

- [Resemblyzer GitHub](https://github.com/resemble-ai/Resemblyzer)
- [Coqui TTS 文档](https://github.com/coqui-ai/TTS)
- [YourTTS 论文](https://github.com/Edresson/YourTTS)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)

---

**最后更新**：2026-01-12
**开发状态**：✓ 完成核心功能框架
