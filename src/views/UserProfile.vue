<template>
  <BaseLayout>
    <template v-slot:header>
      <div class="header-content">
        <button @click="$router.back()" class="back-button btn ghost" aria-label="返回">
          <span class="chev">←</span>
          <span class="label">返回</span>
        </button>
        <h1>个人中心</h1>
        <div style="width:60px"></div>
      </div>
    </template>

    <div class="profile-root">
      <div class="profile-card">
        <div class="avatar-section">
          <img :src="user.avatar_url || defaultAvatar" alt="avatar" class="avatar" />

          <input ref="avatarInput" class="avatar-input" type="file" accept="image/*" @change="onAvatarChange" />
          <div class="avatar-actions">
            <button class="btn ghost" @click="$refs.avatarInput.click()">选择图片</button>
            <button class="btn" @click="uploadAvatar" :disabled="!newAvatarData">上传头像</button>
          </div>
        </div>

        <div class="info-section">
          <h2>{{ user.username || '匿名用户' }}</h2>
          <p class="muted">手机号：{{ user.phone_number || '-' }}</p>
          <p class="muted">加入时间：{{ formattedDate(user.created_at) }}</p>

          <ul class="stats">
            <li class="stat">
              <span class="stat-icon">📝</span>
              <span class="stat-label">帖子</span>
              <span class="stat-value">{{ myPosts.length }}</span>
            </li>
            <li class="stat">
              <span class="stat-icon">❤️</span>
              <span class="stat-label">点赞</span>
              <span class="stat-value">{{ likedPosts.length }}</span>
            </li>
            <li class="stat">
              <span class="stat-icon">👥</span>
              <span class="stat-label">关注</span>
              <span class="stat-value">—</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="lists">
        <div class="tabs">
          <button :class="{active:activeTab==='posts'}" @click="activeTab='posts'">我的帖子</button>
          <button :class="{active:activeTab==='likes'}" @click="activeTab='likes'">我的点赞</button>
          <button :class="{active:activeTab==='voices'}" @click="activeTab='voices'">我的声音</button>
        </div>

        <div v-if="activeTab==='posts'" class="list">
          <div v-if="loadingPosts">加载中...</div>
          <div v-else-if="myPosts.length===0">还没有帖子</div>
          <ul>
            <li v-for="p in myPosts" :key="p.post_id" class="post-item">
              <h3 @click="$router.push(`/post/${p.post_id}`)">{{ p.title }}</h3>
              <p class="excerpt">{{ excerpt(p.content) }}</p>
              <div class="meta">{{ p.author }} · {{ relativeTime(p.created_at) }} · ❤️ {{ p.like_count }}</div>
            </li>
          </ul>
        </div>

        <div v-if="activeTab==='likes'" class="list">
          <div v-if="loadingLikes">加载中...</div>
          <div v-else-if="likedPosts.length===0">还没有点赞</div>
          <ul>
            <li v-for="p in likedPosts" :key="p.post_id" class="post-item">
              <h3 @click="$router.push(`/post/${p.post_id}`)">{{ p.title }}</h3>
              <p class="excerpt">{{ excerpt(p.content) }}</p>
              <div class="meta">{{ p.author }} · {{ relativeTime(p.created_at) }} · ❤️ {{ p.like_count }}</div>
            </li>
          </ul>
        </div>
        <div v-if="activeTab==='voices'" class="list">
            <div class="voice-actions" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <button class="btn" @click="showEnrollModal = true">录入声纹</button>
              <button class="btn ghost" @click="fetchVoices">刷新</button>
            </div>
          <div v-if="loadingVoices">加载中...</div>
          <div v-else-if="myVoices.length===0">还没有录入的声音</div>
          <ul>
            <li v-for="v in myVoices" :key="v.id" class="post-item">
              <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
                <div style="flex:1">
                  <div style="font-weight:600">{{ v.filename }}</div>
                  <div class="meta">类型：{{ v.type }} · {{ relativeTime(v.created_at) }}</div>
                </div>
                <div style="display:flex; gap:8px; align-items:center;">
                  <audio :src="v.file_url" controls preload="none"></audio>
                  <button class="btn ghost" @click="deleteVoiceEntry(v.id)">删除</button>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <!-- Enroll Modal -->
        <div v-if="showEnrollModal" class="modal-overlay">
          <div class="modal">
            <h3>声纹录入</h3>
            <div class="modal-section">
              <h4>实时录音</h4>
              <div class="controls">
                <button class="btn" @click="startRecordingModal" :disabled="modalRecording">开始录音</button>
                <button class="btn ghost" @click="stopRecordingModal" :disabled="!modalRecording">停止</button>
                <button class="btn" @click="sendRecordingModal" :disabled="!modalRecordedBlob">上传并录入</button>
              </div>
              <audio v-if="modalRecordedUrl" :src="modalRecordedUrl" controls></audio>
            </div>

            <div class="modal-section" style="margin-top:12px;">
              <h4>上传文件</h4>
              <input type="file" accept="audio/*,video/*" @change="onModalFileChange" />
              <div class="controls" style="margin-top:8px;">
                <button class="btn" @click="uploadModalFile" :disabled="!modalSelectedFile">上传并录入</button>
              </div>
              <audio v-if="modalFileUrl" :src="modalFileUrl" controls></audio>
            </div>

            <div v-if="modalMessage" class="message" style="margin-top:12px">{{ modalMessage }}</div>
            <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:12px;">
              <button class="btn ghost" @click="showEnrollModal = false">取消</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>

<script>
import BaseLayout from '../components/BaseLayout.vue';
import { userAPI, postAPI, voiceAPI } from '@/services/api.service';

export default {
  name: 'UserProfile',
  components: { BaseLayout },
  data() {
    return {
      user: {},
      userId: Number(localStorage.getItem('userId')) || null,
      defaultAvatar: '/default-avatar.png',
      newAvatarFile: null,
      newAvatarData: null,
      myPosts: [],
      likedPosts: [],
      myVoices: [],
      loadingPosts: false,
      loadingLikes: false,
      loadingVoices: false,
      activeTab: 'posts',
      // modal state
      showEnrollModal: false,
      modalRecording: false,
      modalMediaRecorder: null,
      modalRecordedChunks: [],
      modalRecordedBlob: null,
      modalRecordedUrl: null,
      modalSelectedFile: null,
      modalFileUrl: null,
      modalMessage: ''
    };
  },
  created() {
    if (this.userId) {
      this.fetchUser();
      this.fetchPosts();
      this.fetchLikedPosts();
      this.fetchVoices();
    }
  },
  mounted() {
    // 监听全局事件，其他页面在上传成功后会触发该事件以刷新列表
    try { window.addEventListener('voices-updated', this.fetchVoices); } catch (e) { console.warn('注册 voices-updated 事件失败', e); }
  },
  beforeUnmount() {
    try { window.removeEventListener('voices-updated', this.fetchVoices); } catch (e) { console.warn('移除 voices-updated 事件失败', e); }
  },
  methods: {
    async fetchVoices() {
      this.loadingVoices = true;
      try {
        const voices = await voiceAPI.getVoices(this.userId);
        this.myVoices = voices || [];
      } catch (e) {
        console.error('获取声音列表失败', e);
        this.myVoices = [];
      } finally {
        this.loadingVoices = false;
      }
    },
    async deleteVoiceEntry(id) {
      if (!confirm('确认删除该声纹记录？')) return;
      try {
        await voiceAPI.deleteVoice(id);
        this.myVoices = this.myVoices.filter(v => v.id !== id);
      } catch (e) {
        console.error('删除失败', e);
      }
    },
    // Modal based recording/upload
    async startRecordingModal() {
      this.modalMessage = '';
      this.modalRecordedChunks = [];
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.modalMediaRecorder = new MediaRecorder(stream);
        this.modalMediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) this.modalRecordedChunks.push(e.data);
        };
        this.modalMediaRecorder.onstop = () => {
          this.modalRecordedBlob = new Blob(this.modalRecordedChunks, { type: 'audio/webm' });
          this.modalRecordedUrl = URL.createObjectURL(this.modalRecordedBlob);
        };
        this.modalMediaRecorder.start();
        this.modalRecording = true;
      } catch (e) {
        this.modalMessage = '无法获取麦克风权限';
        console.error(e);
      }
    },
    stopRecordingModal() {
      if (this.modalMediaRecorder && this.modalRecording) {
        this.modalMediaRecorder.stop();
        this.modalRecording = false;
      }
    },
    async sendRecordingModal() {
      if (!this.modalRecordedBlob) return;
      this.modalMessage = '上传中...';
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target.result.split(',')[1];
        const userId = Number(localStorage.getItem('userId')) || 0;
        try {
          await voiceAPI.enrollVoice(userId, base64, 'recording.webm');
          this.modalMessage = '录入成功';
          this.showEnrollModal = false;
          this.fetchVoices();
        } catch (e) {
          this.modalMessage = '上传失败';
          console.error(e);
        }
      };
      reader.readAsDataURL(this.modalRecordedBlob);
    },
    onModalFileChange(e) {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      this.modalSelectedFile = f;
      this.modalFileUrl = URL.createObjectURL(f);
    },
    async uploadModalFile() {
      if (!this.modalSelectedFile) return;
      this.modalMessage = '上传中...';
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target.result.split(',')[1];
        const userId = Number(localStorage.getItem('userId')) || 0;
        try {
          await voiceAPI.uploadMedia(userId, base64, this.modalSelectedFile.name || 'upload');
          this.modalMessage = '上传成功';
          this.showEnrollModal = false;
          this.fetchVoices();
        } catch (e) {
          this.modalMessage = '上传失败';
          console.error(e);
        }
      };
      reader.readAsDataURL(this.modalSelectedFile);
    },
    async fetchUser() {
      try {
        const res = await userAPI.getUserInfo(this.userId);
        this.user = res;
      } catch (e) {
        console.error('获取用户信息失败', e);
      }
    },
    onAvatarChange(e) {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      this.newAvatarFile = f;
      const reader = new FileReader();
      reader.onload = (ev) => {
        this.newAvatarData = ev.target.result;
      };
      reader.readAsDataURL(f);
    },
    async uploadAvatar() {
      if (!this.newAvatarData) return;
      try {
        await userAPI.updateAvatar(this.userId, this.newAvatarData);
        this.user.avatar_url = this.newAvatarData;
        this.newAvatarFile = null;
        this.newAvatarData = null;
      } catch (e) {
        console.error('上传头像失败', e);
      }
    },
    async fetchPosts() {
      this.loadingPosts = true;
      try {
        const posts = await postAPI.getPosts();
        this.myPosts = (posts || []).filter(p => Number(p.user_id) === Number(this.userId));
      } catch (e) {
        console.error('获取帖子失败', e);
      } finally {
        this.loadingPosts = false;
      }
    },
    async fetchLikedPosts() {
      this.loadingLikes = true;
      try {
        // 客户端从 localStorage 读取 liked post ids（若存在）
        const key = `liked_posts_user_${this.userId}`;
        const raw = localStorage.getItem(key) || localStorage.getItem('liked_posts');
        const ids = raw ? JSON.parse(raw) : [];
        if (!ids || ids.length === 0) {
          this.likedPosts = [];
          return;
        }
        const posts = await postAPI.getPosts();
        this.likedPosts = (posts || []).filter(p => ids.includes(p.post_id));
      } catch (e) {
        console.error('获取点赞列表失败', e);
        this.likedPosts = [];
      } finally {
        this.loadingLikes = false;
      }
    },
    excerpt(text = '') {
      return text.length > 120 ? text.slice(0, 120) + '...' : text;
    },
    relativeTime(ts) {
      if (!ts) return '';
      const d = new Date(ts);
      const diff = Date.now() - d.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return '刚刚';
      if (mins < 60) return `${mins}分钟前`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}小时前`;
      const days = Math.floor(hours / 24);
      return `${days}天前`;
    },
    formattedDate(ts) {
      if (!ts) return '-';
      return new Date(ts).toLocaleString();
    }
  }
};
</script>

<style scoped>
.profile-root { max-width: 900px; margin: 20px auto; padding: 12px; }
.profile-card { display:flex; gap:20px; align-items:center; padding:16px; background:#fff; border-radius:12px; box-shadow:0 6px 24px rgba(0,0,0,0.06); }
.avatar-section { display:flex; flex-direction:column; align-items:center; gap:12px; width:180px; }
.avatar { width:140px; height:140px; border-radius:18px; object-fit:cover; border:2px solid rgba(0,0,0,0.06); box-shadow:0 8px 20px rgba(102,126,234,0.12); }
.avatar-input { display:none; }
.avatar-actions { display:flex; gap:8px; }
.btn { background: linear-gradient(135deg,#667eea,#764ba2); color:#fff; border:none; padding:8px 12px; border-radius:10px; cursor:pointer; }
.btn.ghost { background: transparent; color:#667eea; border:1px solid rgba(102,126,234,0.15); }
.btn:disabled { opacity:0.5; cursor:not-allowed; }
.info-section h2 { margin:0; font-size:20px; }
.muted { color:#666; margin:4px 0; }

.stats { display:flex; gap:12px; list-style:none; padding:12px 0 0 0; margin:0; }
.stat { display:flex; flex-direction:column; align-items:center; width:80px; background:linear-gradient(180deg, rgba(102,126,234,0.06), transparent); border-radius:10px; padding:8px; }
.stat-icon { width:42px; height:42px; display:flex; align-items:center; justify-content:center; font-size:18px; border-radius:8px; background:linear-gradient(135deg,#fff,#f7f9ff); box-shadow:0 4px 12px rgba(0,0,0,0.04); }
.stat-label { font-size:12px; color:#888; margin-top:6px; }
.stat-value { font-weight:600; margin-top:4px; }

/* Header / back button */
.header-content { display:flex; align-items:center; justify-content:space-between; padding:8px 0; }
.header-content h1 { margin:0; font-size:18px; font-weight:600; text-align:center; flex:1; }
.back-button { display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:10px; font-size:14px; }
.back-button .chev { font-size:16px; }
.back-button .label { display:inline-block; }
.tabs { display:flex; gap:8px; margin-top:16px; }
.tabs button { padding:8px 12px; border-radius:8px; border:none; cursor:pointer; }
.tabs button.active { background: linear-gradient(135deg,#667eea,#764ba2); color:#fff; }
.list { margin-top:12px; }
.post-item { padding:12px 0; border-bottom:1px solid #f0f0f0; }
.post-item h3 { margin:0; cursor:pointer; color:#333; }
.excerpt { margin:6px 0; color:#666; }
.meta { font-size:12px; color:#999; }

/* Modal styles */
.modal-overlay { position:fixed; left:0; top:0; right:0; bottom:0; background:rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; z-index:2000; }
.modal { width:720px; max-width:95%; background:#fff; border-radius:12px; padding:16px; box-shadow:0 12px 40px rgba(0,0,0,0.25); }
.modal h3 { margin:0 0 8px 0; }
.modal-section h4 { margin:0 0 6px 0; font-size:14px; }
</style>
