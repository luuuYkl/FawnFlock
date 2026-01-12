<template>
  <div class="voice-enrollment">
    <!-- 顶部说明区 -->
    <div class="explanation-section">
      <h1 class="title">声纹录入</h1>
      <p class="subtitle">请在安静环境下朗读，约 30 秒即可完成</p>
      <p class="privacy">系统仅用于身份识别，不会公开原音频</p>
    </div>

    <!-- 核心录音区 -->
    <div class="recording-section">
      <!-- 麦克风 / 状态图标 -->
      <div class="microphone-container">
        <div 
          class="mic-button" 
          :class="{ 
            'recording': isRecording, 
            'completed': currentStatus === 'completed',
            'error': currentStatus === 'error'
          }"
          @mousedown="handleMouseDown"
          @mouseup="handleMouseUp"
          @mouseleave="handleMouseLeave"
          @touchstart.prevent="handleMouseDown"
          @touchend.prevent="handleMouseUp"
        >
          <!-- 呼吸动画外圈 -->
          <div v-if="isRecording" class="breath-ring"></div>
          <div v-if="isRecording" class="breath-ring delay-1"></div>
          <div v-if="isRecording" class="breath-ring delay-2"></div>
          
          <!-- 图标 -->
          <div class="icon">
            <svg v-if="currentStatus === 'idle'" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
            <svg v-else-if="currentStatus === 'completed'" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <svg v-else-if="currentStatus === 'error'" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </div>

          <!-- 波形可视化 -->
          <div v-if="isRecording" class="waveform">
            <div 
              v-for="i in 12" 
              :key="i" 
              class="wave-bar"
              :style="{ animationDelay: (i * 0.08) + 's', height: waveHeights[i % waveHeights.length] }"
            ></div>
          </div>
        </div>
      </div>

      <!-- 时间显示 -->
      <div class="time-display">
        {{ formatTime(recordingTime) }} / 00:30
      </div>

      <!-- 操作提示 -->
      <div class="action-hint">
        <span v-if="!isRecording && !hasRecorded">长按开始录音</span>
        <span v-else-if="isRecording">松开停止录音</span>
        <span v-else-if="hasRecorded">录音完成</span>
      </div>
    </div>

    <!-- 文本提示区 -->
    <div class="text-prompt-section">
      <p class="prompt-title">请朗读下列文字：</p>
      <div class="prompt-text">
        {{ readingTexts[currentRound] }}
      </div>
    </div>

    <!-- 状态 & 操作区 -->
    <div class="action-section">
      <!-- 录入进度 -->
      <div class="progress-dots">
        <span>录入进度：</span>
        <span 
          v-for="i in totalRounds" 
          :key="i" 
          class="dot"
          :class="{ 'completed': i <= completedRounds }"
        >●</span>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button 
          class="btn-secondary" 
          @click="handleRetry"
          :disabled="!hasRecorded || isRecording"
        >
          重录
        </button>
        <button 
          class="btn-primary" 
          @click="handleSubmit"
          :disabled="!hasRecorded || isRecording || isProcessing"
        >
          {{ isLastRound ? '完成提交' : '下一步' }}
        </button>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-toast">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import { voiceAPI } from '@/services/api.service';

export default {
  name: 'VoiceEnrollmentOptimized',
  
  data() {
    return {
      // 录音状态
      isRecording: false,
      hasRecorded: false,
      recordingTime: 0,
      recordingTimer: null,
      
      // 录音相关
      mediaRecorder: null,
      recordedChunks: [],
      recordedBlob: null,
      audioContext: null,
      analyser: null,
      
      // 波形数据
      waveHeights: ['20%', '40%', '60%', '80%', '100%', '80%', '60%', '40%'],
      
      // 状态
      currentStatus: 'idle', // idle, recording, completed, error
      
      // 进度
      currentRound: 0,
      completedRounds: 0,
      totalRounds: 4,
      
      // 朗读文本
      readingTexts: [
        '今天天气不错，我正在使用 FawnFlock。',
        '技术不是冰冷的，它应该理解每一个人。',
        '我喜欢在这里分享我的想法和创意。',
        '声音是我们独特的标识，让交流更真实。'
      ],
      
      // 所有录音
      recordings: [],
      
      // 处理状态
      isProcessing: false,
      errorMessage: ''
    };
  },
  
  computed: {
    isLastRound() {
      return this.currentRound === this.totalRounds - 1;
    }
  },
  
  beforeUnmount() {
    this.cleanup();
  },
  
  methods: {
    handleMouseDown() {
      if (!this.isRecording && !this.isProcessing) {
        this.startRecording();
      }
    },
    
    handleMouseUp() {
      if (this.isRecording) {
        this.stopRecording();
      }
    },
    
    handleMouseLeave() {
      // 鼠标离开时，如果正在录音，继续录音（避免误操作）
      // 只有主动松开才停止
    },
    
    async startRecording() {
      try {
        this.recordedChunks = [];
        this.recordingTime = 0;
        this.errorMessage = '';
        
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        
        // 创建音频分析器
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        const source = this.audioContext.createMediaStreamSource(stream);
        source.connect(this.analyser);
        
        // 开始波形动画
        this.animateWaveform();
        
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
          this.hasRecorded = true;
          this.currentStatus = 'completed';
          
          // 清理
          if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
          }
          stream.getTracks().forEach(track => track.stop());
          
          // 检查时长
          if (this.recordingTime < 3) {
            this.errorMessage = '录音时长太短，请至少录制 3 秒';
            this.currentStatus = 'error';
            setTimeout(() => {
              this.errorMessage = '';
              this.currentStatus = 'idle';
            }, 3000);
          }
        };
        
        this.mediaRecorder.start();
        this.isRecording = true;
        this.currentStatus = 'recording';
        
        // 计时器
        this.recordingTimer = setInterval(() => {
          this.recordingTime++;
          
          // 30秒自动停止
          if (this.recordingTime >= 30) {
            this.stopRecording();
          }
        }, 1000);
        
      } catch (error) {
        console.error('录音失败:', error);
        this.errorMessage = '无法访问麦克风，请检查权限设置';
        this.currentStatus = 'error';
        setTimeout(() => {
          this.errorMessage = '';
          this.currentStatus = 'idle';
        }, 3000);
      }
    },
    
    stopRecording() {
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop();
        this.isRecording = false;
        
        if (this.recordingTimer) {
          clearInterval(this.recordingTimer);
          this.recordingTimer = null;
        }
      }
    },
    
    animateWaveform() {
      if (!this.isRecording || !this.analyser) return;
      
      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(dataArray);
      
      // 计算平均音量
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      
      // 更新波形高度
      this.waveHeights = this.waveHeights.map(() => {
        const randomHeight = Math.random() * 40 + (average / 255 * 60);
        return Math.min(100, randomHeight) + '%';
      });
      
      if (this.isRecording) {
        requestAnimationFrame(() => this.animateWaveform());
      }
    },
    
    handleRetry() {
      this.recordedBlob = null;
      this.hasRecorded = false;
      this.recordingTime = 0;
      this.currentStatus = 'idle';
      this.errorMessage = '';
    },
    
    async handleSubmit() {
      if (!this.recordedBlob) return;
      
      this.isProcessing = true;
      this.errorMessage = '';
      
      try {
        // 保存当前录音
        this.recordings.push({
          round: this.currentRound,
          blob: this.recordedBlob,
          duration: this.recordingTime
        });
        
        // 如果不是最后一轮，进入下一轮
        if (!this.isLastRound) {
          this.completedRounds++;
          this.currentRound++;
          this.recordedBlob = null;
          this.hasRecorded = false;
          this.recordingTime = 0;
          this.currentStatus = 'idle';
        } else {
          // 最后一轮，提交所有录音
          await this.submitAllRecordings();
        }
        
      } catch (error) {
        console.error('提交失败:', error);
        this.errorMessage = '提交失败，请重试';
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      } finally {
        this.isProcessing = false;
      }
    },
    
    async submitAllRecordings() {
      const userId = Number(localStorage.getItem('userId')) || 1;
      
      try {
        // 提交所有录音
        for (let i = 0; i < this.recordings.length; i++) {
          const recording = this.recordings[i];
          const reader = new FileReader();
          
          await new Promise((resolve, reject) => {
            reader.onload = async (ev) => {
              try {
                const base64 = ev.target.result.split(',')[1];
                await voiceAPI.enrollVoice(userId, base64, `recording_${i + 1}.webm`);
                resolve();
              } catch (error) {
                reject(error);
              }
            };
            reader.onerror = reject;
            reader.readAsDataURL(recording.blob);
          });
        }
        
        // 成功后返回个人页面
        this.$router.push('/UserProfile');
        
        // 触发声纹更新事件
        try {
          window.dispatchEvent(new CustomEvent('voices-updated'));
        } catch (err) {
          console.warn('dispatch voices-updated failed', err);
        }
        
      } catch (error) {
        console.error('提交录音失败:', error);
        throw error;
      }
    },
    
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    cleanup() {
      if (this.recordingTimer) {
        clearInterval(this.recordingTimer);
      }
      if (this.audioContext) {
        this.audioContext.close();
      }
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop();
      }
    }
  }
};
</script>

<style scoped>
.voice-enrollment {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
}

/* 顶部说明区 */
.explanation-section {
  text-align: center;
  margin-bottom: 48px;
  max-width: 400px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 12px 0;
}

.subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 8px 0;
  line-height: 1.6;
}

.privacy {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
  line-height: 1.5;
}

/* 核心录音区 */
.recording-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
}

.microphone-container {
  position: relative;
  margin-bottom: 24px;
}

.mic-button {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.25);
}

.mic-button:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 32px rgba(99, 102, 241, 0.35);
}

.mic-button:active {
  transform: scale(0.98);
}

.mic-button.recording {
  animation: pulse 2s ease-in-out infinite;
}

.mic-button.completed {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.25);
}

.mic-button.error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.25);
  animation: shake 0.5s ease-in-out;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

/* 呼吸动画圈 */
.breath-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 2px solid rgba(99, 102, 241, 0.6);
  animation: breathe 1.5s ease-out infinite;
  pointer-events: none;
}

.breath-ring.delay-1 {
  animation-delay: 0.5s;
}

.breath-ring.delay-2 {
  animation-delay: 1s;
}

@keyframes breathe {
  0% {
    width: 120px;
    height: 120px;
    opacity: 0.8;
  }
  100% {
    width: 180px;
    height: 180px;
    opacity: 0;
  }
}

/* 图标 */
.icon {
  width: 48px;
  height: 48px;
  color: #ffffff;
  z-index: 2;
  position: relative;
}

.icon svg {
  width: 100%;
  height: 100%;
  display: block;
}

/* 波形 */
.waveform {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 24px;
  z-index: 1;
}

.wave-bar {
  width: 3px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 2px;
  animation: wave 0.8s ease-in-out infinite;
}

@keyframes wave {
  0%, 100% {
    transform: scaleY(0.3);
  }
  50% {
    transform: scaleY(1);
  }
}

/* 时间显示 */
.time-display {
  font-size: 24px;
  font-weight: 600;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
  margin-bottom: 12px;
}

/* 操作提示 */
.action-hint {
  font-size: 14px;
  color: #64748b;
  height: 20px;
}

/* 文本提示区 */
.text-prompt-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 32px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.prompt-title {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 12px 0;
}

.prompt-text {
  font-size: 15px;
  color: #0f172a;
  line-height: 1.6;
  text-align: left;
}

/* 状态 & 操作区 */
.action-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 400px;
  width: 100%;
}

.progress-dots {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #64748b;
}

.dot {
  font-size: 12px;
  color: #cbd5e1;
  transition: color 0.3s ease;
}

.dot.completed {
  color: #6366f1;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 12px;
  width: 100%;
}

.btn-secondary,
.btn-primary {
  flex: 1;
  height: 44px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.btn-secondary {
  background: #ffffff;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
  transform: translateY(-1px);
}

.btn-secondary:disabled,
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 错误提示 */
.error-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  background: #fee2e2;
  color: #dc2626;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.3s ease;
  z-index: 1000;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

/* 移动端适配 */
@media (max-width: 480px) {
  .voice-enrollment {
    padding: 20px 16px;
  }
  
  .mic-button {
    width: 96px;
    height: 96px;
  }
  
  .icon {
    width: 40px;
    height: 40px;
  }
  
  .breath-ring {
    width: 96px;
    height: 96px;
  }
  
  @keyframes breathe {
    0% {
      width: 96px;
      height: 96px;
      opacity: 0.8;
    }
    100% {
      width: 144px;
      height: 144px;
      opacity: 0;
    }
  }
  
  .time-display {
    font-size: 20px;
  }
  
  .explanation-section {
    margin-bottom: 32px;
  }
  
  .recording-section {
    margin-bottom: 32px;
  }
  
  .text-prompt-section {
    margin-bottom: 24px;
  }
}
</style>
