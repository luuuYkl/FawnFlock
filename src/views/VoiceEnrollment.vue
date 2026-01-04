<template>
  <BaseLayout>
    <template v-slot:header>
      <div class="header-content">
        <h1>声纹录入</h1>
        <div style="width:60px"></div>
      </div>
    </template>

    <div class="voice-root">
      <div class="card">
        <h2>实时录音录入</h2>
        <p class="muted">请说出一段不少于 3 秒的语音用于声纹录入。</p>
        <div class="controls">
          <button class="btn" @click="startRecording" :disabled="recording">开始录音</button>
          <button class="btn ghost" @click="stopRecording" :disabled="!recording">停止</button>
          <button class="btn" @click="sendRecording" :disabled="!recordedBlob">上传并录入</button>
        </div>
        <audio v-if="recordedUrl" :src="recordedUrl" controls></audio>
      </div>

      <div class="card" style="margin-top:16px;">
        <h2>上传媒体文件</h2>
        <p class="muted">支持 wav/mp3/webm 等音频文件。</p>
        <input type="file" accept="audio/*,video/*" @change="onFileChange" />
        <div class="controls" style="margin-top:8px;">
          <button class="btn" @click="uploadFile" :disabled="!selectedFile">上传并录入</button>
        </div>
        <audio v-if="fileUrl" :src="fileUrl" controls></audio>
      </div>

      <div v-if="message" class="message">{{ message }}</div>
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
      recording: false,
      mediaRecorder: null,
      recordedChunks: [],
      recordedBlob: null,
      recordedUrl: null,
      selectedFile: null,
      fileUrl: null,
      message: ''
    };
  },
  methods: {
    async startRecording() {
      this.message = '';
      this.recordedChunks = [];
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) this.recordedChunks.push(e.data);
        };
        this.mediaRecorder.onstop = () => {
          this.recordedBlob = new Blob(this.recordedChunks, { type: 'audio/webm' });
          this.recordedUrl = URL.createObjectURL(this.recordedBlob);
        };
        this.mediaRecorder.start();
        this.recording = true;
      } catch (e) {
        this.message = '无法获取麦克风权限';
        console.error(e);
      }
    },
    stopRecording() {
      if (this.mediaRecorder && this.recording) {
        this.mediaRecorder.stop();
        this.recording = false;
      }
    },
    async sendRecording() {
      if (!this.recordedBlob) return;
      this.message = '上传中...';
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target.result.split(',')[1];
        const userId = Number(localStorage.getItem('userId')) || 0;
        try {
          await voiceAPI.enrollVoice(userId, base64, 'recording.webm');
          this.message = '录入请求已发送（mock）。';
            try { window.dispatchEvent(new CustomEvent('voices-updated')); } catch (err) { console.warn('dispatch voices-updated failed', err); }
        } catch (e) {
          this.message = '上传失败';
          console.error(e);
        }
      };
      reader.readAsDataURL(this.recordedBlob);
    },
    onFileChange(e) {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      this.selectedFile = f;
      this.fileUrl = URL.createObjectURL(f);
    },
    async uploadFile() {
      if (!this.selectedFile) return;
      this.message = '上传中...';
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target.result.split(',')[1];
        const userId = Number(localStorage.getItem('userId')) || 0;
        try {
          await voiceAPI.uploadMedia(userId, base64, this.selectedFile.name || 'upload');
          this.message = '媒体上传并录入（mock）。';
          try { window.dispatchEvent(new CustomEvent('voices-updated')); } catch (err) { console.warn('dispatch voices-updated failed', err); }
        } catch (e) {
          this.message = '上传失败';
          console.error(e);
        }
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
};
</script>

<style scoped>
.voice-root { max-width:720px; margin:20px auto; padding:12px; }
.card { padding:16px; background:#fff; border-radius:12px; box-shadow:0 6px 20px rgba(0,0,0,0.04); }
.controls { display:flex; gap:8px; margin-top:12px; }
.muted { color:#666; }
.message { margin-top:12px; padding:8px; background:#f6ffed; border:1px solid #b7eb8f; border-radius:8px; }
</style>
