<template>
  <BaseLayout>
    <template v-slot:header>
      <div class="header-content">
        <h1>🎤 声纹录入</h1>
        <div style="width: 60px"></div>
      </div>
    </template>

    <div class="voice-root">
      <!-- 录音指南 -->
      <div class="card guide">
        <h2>📋 录音指南</h2>
        <div class="guide-content">
          <p><strong>⏱️ 时长要求：</strong>30-60 秒（最少 10 秒）</p>
          <p><strong>📝 朗读内容：</strong>自由朗读或按引导文本朗读</p>
          <p><strong>🔇 环境要求：</strong></p>
          <ul>
            <li>安静的环境（无背景音乐、噪音）</li>
            <li>单人录音（只有你的声音）</li>
            <li>清晰自然的语调</li>
          </ul>
          <p><strong>ℹ️ 说明：</strong>你的声纹将用于生成你的专属声音，不会公开原始音频。</p>
        </div>
      </div>

      <!-- 实时录音 -->
      <div class="card">
        <h2>🎙️ 实时录音</h2>
        <div class="recording-container">
          <!-- 时长计数 -->
          <div class="time-display">
            <span class="time">{{ formatTime(recordingTime) }}</span>
            <span class="status" :class="recording ? 'recording' : ''">
              {{ recording ? '● 录音中...' : '准备好了' }}
            </span>
          </div>

          <!-- 音量指示器 -->
          <div v-if="recording" class="volume-meter">
            <div class="meter-label">音量:</div>
            <div class="meter-bar">
              <div class="meter-fill" :style="{ width: volumeLevel + '%' }"></div>
            </div>
          </div>

          <!-- 控制按钮 -->
          <div class="controls">
            <button class="btn btn-primary" @click="startRecording" :disabled="recording || processing">
              <span class="icon">▶</span> 开始录音
            </button>
            <button class="btn btn-warning" @click="stopRecording" :disabled="!recording">
              <span class="icon">⏹</span> 停止
            </button>
            <button class="btn btn-success" @click="submitRecording" :disabled="!recordedBlob || processing">
              <span v-if="processing" class="icon">⏳</span>
              <span v-else class="icon">✓</span>
              {{ processing ? '处理中...' : '上传并提取' }}
            </button>
            <button class="btn btn-secondary" @click="clearRecording" :disabled="!recordedBlob">
              <span class="icon">🗑</span> 清除
            </button>
          </div>

          <!-- 播放已录制的音频 -->
          <div v-if="recordedUrl" class="playback">
            <p class="label">已录制的音频：</p>
            <audio :src="recordedUrl" controls style="width: 100%; margin-top: 8px"></audio>
          </div>

          <!-- 录音时长提示 -->
          <div v-if="recordedBlob" class="info-box">
            <span>✓ 已录制 {{ recordedDuration.toFixed(1) }} 秒</span>
            <span v-if="recordedDuration < 10" class="warning">（建议至少 10 秒）</span>
          </div>
        </div>
      </div>

      <!-- 文件上传 -->
      <div class="card">
        <h2>📂 上传媒体文件</h2>
        <p class="muted">支持 WAV / MP3 / WebM 等音频格式</p>
        <div class="file-upload">
          <input 
            type="file" 
            accept="audio/*"
            @change="onFileChange"
            :disabled="processing"
            style="display: none"
            ref="fileInput"
          />
          <button class="btn btn-secondary" @click="$refs.fileInput.click()" :disabled="processing">
            <span class="icon">📁</span> 选择文件
          </button>
          <span v-if="selectedFile" class="file-name">{{ selectedFile.name }}</span>
        </div>

        <div class="controls" style="margin-top: 12px">
          <button class="btn btn-success" @click="uploadFile" :disabled="!selectedFile || processing">
            <span class="icon">⬆</span> {{ processing ? '处理中...' : '上传并提取' }}
          </button>
        </div>

        <div v-if="fileUrl" class="playback" style="margin-top: 12px">
          <p class="label">已上传的音频：</p>
          <audio :src="fileUrl" controls style="width: 100%; margin-top: 8px"></audio>
        </div>
      </div>

      <!-- 状态消息 -->
      <div v-if="message" :class="['message', message.type]">
        <span class="icon">{{ message.type === 'success' ? '✓' : message.type === 'error' ? '✗' : 'ℹ' }}</span>
        {{ message.text }}
      </div>

      <!-- 成功结果 -->
      <div v-if="successResult" class="card success-card">
        <h2>✓ 声纹提取成功</h2>
        <div class="result-content">
          <p><strong>用户 ID：</strong> {{ successResult.user_id }}</p>
          <p><strong>声纹维度：</strong> {{ successResult.embedding_dim }} 维</p>
          <p><strong>音频时长：</strong> {{ successResult.audio_duration }} 秒</p>
          <p><strong>状态：</strong> 已准备好用于语音克隆</p>
        </div>
        <button class="btn btn-primary" @click="successResult = null">
          继续录入
        </button>
      </div>
    </div>
  </BaseLayout>
</template>

<script>
import BaseLayout from '@/components/BaseLayout.vue';
import { voiceAPI } from '@/services/api.service';

export default {
  name: 'VoiceEnrollment',
  components: { BaseLayout },

  data() {
    return {
      // 录音状态
      recording: false,
      mediaRecorder: null,
      recordedChunks: [],
      recordedBlob: null,
      recordedUrl: null,
      recordingTime: 0, // 秒
      recordingTimer: null,
      audioContext: null,
      analyser: null,
      volumeLevel: 0, // 0-100

      // 文件上传
      selectedFile: null,
      fileUrl: null,

      // 处理状态
      processing: false,

      // 消息
      message: null,
      messageTimeout: null,

      // 成功结果
      successResult: null,

      // 用户 ID（从 store 或 localStorage 获取）
      userId: null,

      // 录制音频时长
      recordedDuration: 0
    };
  },

  computed: {
    recordedDurationFromBlob() {
      if (!this.recordedBlob) return 0;
      // 通过 blob 大小估算（不准确，需要通过音频 context 获取准确值）
      // eslint-disable-next-line no-unused-vars
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      // 这里需要等待音频加载，所以返回简单计算
      return this.recordingTime;
    }
  },

  mounted() {
    this.userId = this.$store?.state?.userId || localStorage.getItem('userId') || 1;

    // 请求麦克风权限
    this.requestMicrophonePermission();
  },

  beforeUnmount() {
    this.stopRecording();
    if (this.recordingTimer) clearInterval(this.recordingTimer);
    if (this.messageTimeout) clearTimeout(this.messageTimeout);
  },

  methods: {
    /**
     * 请求麦克风权限
     */
    async requestMicrophonePermission() {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        this.showMessage('✓ 已获得麦克风权限', 'info');
      } catch (error) {
        console.error('麦克风权限失败:', error);
        this.showMessage('需要允许访问麦克风才能录音', 'error');
      }
    },

    /**
     * 开始录音
     */
    async startRecording() {
      try {
        this.recordingTime = 0;
        this.recordedChunks = [];

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true
          }
        });

        // 创建音量分析器
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        const source = this.audioContext.createMediaStreamSource(stream);
        source.connect(this.analyser);

        // 开始音量检测
        this.updateVolumeMeter();

        this.mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        });

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.recordedChunks.push(event.data);
          }
        };

        this.mediaRecorder.onstop = () => {
          this.recordedBlob = new Blob(this.recordedChunks, { type: 'audio/webm' });
          this.recordedUrl = URL.createObjectURL(this.recordedBlob);
          this.recordedDuration = this.recordingTime;

          // 停止音量检测
          if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
          }

          // 停止音频流
          stream.getTracks().forEach(track => track.stop());
        };

        this.mediaRecorder.start();
        this.recording = true;

        // 启动计时器
        this.recordingTimer = setInterval(() => {
          this.recordingTime++;

          // 60秒后自动停止
          if (this.recordingTime >= 60) {
            this.stopRecording();
            this.showMessage('已达到最长录音时间（60秒）', 'warning');
          }
        }, 1000);
      } catch (error) {
        console.error('启动录音失败:', error);
        this.showMessage('启动录音失败，请检查麦克风权限', 'error');
      }
    },

    /**
     * 停止录音
     */
    stopRecording() {
      if (this.mediaRecorder && this.recording) {
        this.mediaRecorder.stop();
        this.recording = false;

        if (this.recordingTimer) {
          clearInterval(this.recordingTimer);
          this.recordingTimer = null;
        }

        this.volumeLevel = 0;
      }
    },

    /**
     * 清除录制的音频
     */
    clearRecording() {
      this.recordedBlob = null;
      this.recordedUrl = null;
      this.recordingTime = 0;
      this.recordedDuration = 0;
      this.recordedChunks = [];
    },

    /**
     * 更新音量指示器
     */
    updateVolumeMeter() {
      if (!this.recording || !this.analyser) return;

      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(dataArray);

      // 计算平均音量
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      this.volumeLevel = Math.min(100, Math.floor(average * 1.5));

      requestAnimationFrame(() => this.updateVolumeMeter());
    },

    /**
     * 提交录制的音频
     */
    async submitRecording() {
      if (!this.recordedBlob) {
        this.showMessage('请先录音', 'error');
        return;
      }

      if (this.recordingTime < 10) {
        this.showMessage('录音时长过短，至少需要 10 秒', 'error');
        return;
      }

      this.processing = true;

      try {
        const audioBase64 = await this.blobToBase64(this.recordedBlob);

        const response = await voiceAPI.enrollWithEmbedding(
          this.userId,
          audioBase64,
          `voice_${Date.now()}.webm`
        );

        if (response.success) {
          this.successResult = response;
          this.showMessage('✓ 声纹提取成功！', 'success');
          this.clearRecording();
        } else {
          this.showMessage(`错误: ${response.error}`, 'error');
        }
      } catch (error) {
        console.error('提交失败:', error);
        this.showMessage(`提交失败: ${error.message}`, 'error');
      } finally {
        this.processing = false;
      }
    },

    /**
     * 文件选择
     */
    onFileChange(event) {
      const file = event.target.files?.[0];
      if (file) {
        this.selectedFile = file;
        this.fileUrl = URL.createObjectURL(file);
      }
    },

    /**
     * 上传文件
     */
    async uploadFile() {
      if (!this.selectedFile) {
        this.showMessage('请先选择文件', 'error');
        return;
      }

      this.processing = true;

      try {
        const audioBase64 = await this.fileToBase64(this.selectedFile);

        const response = await voiceAPI.enrollWithEmbedding(
          this.userId,
          audioBase64,
          this.selectedFile.name
        );

        if (response.success) {
          this.successResult = response;
          this.showMessage('✓ 声纹提取成功！', 'success');
          this.selectedFile = null;
          this.fileUrl = null;
        } else {
          this.showMessage(`错误: ${response.error}`, 'error');
        }
      } catch (error) {
        console.error('上传失败:', error);
        this.showMessage(`上传失败: ${error.message}`, 'error');
      } finally {
        this.processing = false;
      }
    },

    /**
     * Blob 转 Base64
     */
    blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    },

    /**
     * File 转 Base64
     */
    fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },

    /**
     * 显示消息
     */
    showMessage(text, type = 'info') {
      this.message = { text, type };

      if (this.messageTimeout) clearTimeout(this.messageTimeout);
      this.messageTimeout = setTimeout(() => {
        this.message = null;
      }, 5000);
    },

    /**
     * 格式化时间
     */
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  }
};
</script>

<style scoped lang="scss">
.voice-root {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  h2 {
    margin: 0 0 16px 0;
    font-size: 18px;
    color: #333;
  }

  p {
    margin: 8px 0;
    color: #666;
    font-size: 14px;
  }

  ul {
    margin: 8px 0 8px 20px;
    padding: 0;

    li {
      color: #666;
      font-size: 14px;
      margin: 4px 0;
    }
  }

  &.guide {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;

    h2 {
      color: #fff;
    }

    p {
      color: rgba(255, 255, 255, 0.95);
    }

    ul li {
      color: rgba(255, 255, 255, 0.95);
    }

    strong {
      color: #fff;
    }
  }

  &.success-card {
    background: #f0f9ff;
    border: 2px solid #10b981;

    .result-content {
      background: #fff;
      padding: 12px;
      border-radius: 8px;
      margin: 12px 0;
      font-size: 14px;

      p {
        margin: 8px 0;
      }
    }
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  h1 {
    margin: 0;
    font-size: 24px;
    color: #333;
  }
}

.guide-content {
  p, ul li {
    margin: 12px 0;
  }
}

.recording-container {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 2px dashed #ddd;
}

.time-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  font-size: 24px;
  font-weight: bold;

  .time {
    color: #667eea;
    font-family: 'Courier New', monospace;
  }

  .status {
    font-size: 14px;
    color: #999;

    &.recording {
      color: #ef4444;
      animation: pulse 1s infinite;
    }
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.volume-meter {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;

  .meter-label {
    font-size: 12px;
    color: #666;
    min-width: 40px;
  }

  .meter-bar {
    flex: 1;
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;

    .meter-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #3b82f6, #f59e0b);
      transition: width 50ms ease-out;
    }
  }
}

.controls {
  display: flex;
  gap: 12px;
  margin: 16px 0;
  flex-wrap: wrap;

  .btn {
    flex: 1;
    min-width: 100px;
    padding: 12px 16px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;

    .icon {
      font-size: 16px;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &.btn-primary {
      background: #667eea;
      color: #fff;

      &:hover:not(:disabled) {
        background: #5568d3;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }
    }

    &.btn-success {
      background: #10b981;
      color: #fff;

      &:hover:not(:disabled) {
        background: #059669;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
      }
    }

    &.btn-warning {
      background: #f59e0b;
      color: #fff;

      &:hover:not(:disabled) {
        background: #d97706;
      }
    }

    &.btn-secondary {
      background: #e5e7eb;
      color: #333;

      &:hover:not(:disabled) {
        background: #d1d5db;
      }
    }
  }
}

.playback {
  margin-top: 16px;
  padding: 12px;
  background: #f3f4f6;
  border-radius: 8px;

  .label {
    margin: 0 0 8px 0;
    font-size: 12px;
    color: #666;
    text-transform: uppercase;
    font-weight: 600;
  }

  audio {
    width: 100%;
    border-radius: 4px;
  }
}

.info-box {
  margin-top: 12px;
  padding: 12px;
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  border-radius: 4px;
  font-size: 14px;
  color: #b45309;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .warning {
    color: #dc2626;
    font-weight: 600;
  }
}

.file-upload {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #ddd;

  .file-name {
    flex: 1;
    font-size: 14px;
    color: #666;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .btn {
    flex-shrink: 0;
  }
}

.message {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;

  .icon {
    font-size: 16px;
  }

  &.success {
    background: #d1fae5;
    color: #065f46;
    border-left: 4px solid #10b981;
  }

  &.error {
    background: #fee2e2;
    color: #7f1d1d;
    border-left: 4px solid #ef4444;
  }

  &.warning {
    background: #fef3c7;
    color: #b45309;
    border-left: 4px solid #f59e0b;
  }

  &.info {
    background: #dbeafe;
    color: #1e3a8a;
    border-left: 4px solid #3b82f6;
  }
}

.muted {
  color: #999;
  font-size: 13px;
}
</style>
