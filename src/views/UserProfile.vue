<template>
  <div class="profile-page">
    <!-- 顶部个人信息区 -->
    <div class="profile-header">
      <div class="profile-info">
        <div class="avatar-wrapper">
          <img
            :src="user.avatar_url || defaultAvatar"
            :alt="user.username"
            class="profile-avatar"
            @error="handleImageError"
          />
          <button class="edit-avatar-btn" @click="$refs.avatarInput.click()">
            <span class="icon">📷</span>
          </button>
          <input
            ref="avatarInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="onAvatarChange"
          />
        </div>
        
        <div class="user-details">
          <h2 class="username">{{ user.username || '未设置昵称' }}</h2>
          <p class="user-handle">@{{ user.phone_number || 'user' }}</p>
          <p class="user-bio">{{ user.bio || '这个人很懒，什么都没留下' }}</p>
        </div>
      </div>
      
      <!-- 统计数据 -->
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-value">{{ myPosts.length }}</span>
          <span class="stat-label">帖子</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ likedPosts.length }}</span>
          <span class="stat-label">收藏</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">—</span>
          <span class="stat-label">关注</span>
        </div>
      </div>
    </div>

    <!-- 功能入口区 -->
    <div class="function-cards">
      <button class="function-card" @click="showMyPosts">
        <span class="card-icon">📝</span>
        <span class="card-label">我的帖子</span>
        <span class="card-count">{{ myPosts.length }}</span>
      </button>
      <button class="function-card" @click="showMyLikes">
        <span class="card-icon">⭐</span>
        <span class="card-label">我的收藏</span>
        <span class="card-count">{{ likedPosts.length }}</span>
      </button>
      <button class="function-card" @click="goToSettings">
        <span class="card-icon">⚙️</span>
        <span class="card-label">设置</span>
        <span class="card-arrow">›</span>
      </button>
    </div>

    <!-- 声纹管理模块 -->
    <div class="voice-section">
      <div class="section-header">
        <h3 class="section-title">🎙 我的声音</h3>
        <p class="section-subtitle">用于朗读、播放、身份识别</p>
      </div>
      
      <!-- 声音卡片列表 -->
      <div class="voice-cards">
        <div
          v-for="voice in myVoices"
          :key="voice.id"
          class="voice-card"
          :class="{ 'voice-training': voice.status === 'training' }"
        >
          <div class="voice-header">
            <span class="voice-icon">🎤</span>
            <span class="voice-name">{{ voice.name }}</span>
            <span class="voice-status" :class="`status-${voice.status}`">
              {{ getStatusText(voice.status) }}
            </span>
          </div>
          
          <div class="voice-waveform">
            <div class="waveform-bars">
              <span v-for="i in 12" :key="i" class="bar" :style="{ height: getBarHeight(i) }"></span>
            </div>
          </div>
          
          <div class="voice-actions">
            <button class="action-btn" @click="playVoice(voice)">
              <span class="icon">▶️</span>
              <span class="label">播放</span>
            </button>
            <button class="action-btn" @click="renameVoice(voice)">
              <span class="icon">✏️</span>
              <span class="label">重命名</span>
            </button>
            <button class="action-btn danger" @click="deleteVoice(voice)">
              <span class="icon">🗑️</span>
              <span class="label">删除</span>
            </button>
          </div>
        </div>
        
        <!-- 添加新声音 -->
        <button class="voice-card add-voice-card" @click="addNewVoice">
          <span class="add-icon">+</span>
          <span class="add-label">添加新的声音</span>
        </button>
      </div>
    </div>

    <!-- 其他设置区 -->
    <div class="settings-section">
      <div class="setting-item" @click="goToSecurity">
        <span class="setting-icon">🔒</span>
        <span class="setting-label">账号与安全</span>
        <span class="setting-arrow">›</span>
      </div>
      <div class="setting-item" @click="goToPrivacy">
        <span class="setting-icon">🛡️</span>
        <span class="setting-label">隐私设置</span>
        <span class="setting-arrow">›</span>
      </div>
      <div class="setting-item" @click="goToAbout">
        <span class="setting-icon">ℹ️</span>
        <span class="setting-label">关于我们</span>
        <span class="setting-arrow">›</span>
      </div>
      <div class="setting-item" @click="logout">
        <span class="setting-icon">🚪</span>
        <span class="setting-label">退出登录</span>
        <span class="setting-arrow">›</span>
      </div>
    </div>

    <!-- 底部导航栏 -->
    <BottomNavigation
      current="UserProfile"
      @navigate="handleNavigate"
    />
  </div>
</template>

<script>
import BottomNavigation from '@/components/BottomNavigation.vue';
import { userAPI, postAPI, voiceAPI } from '@/services/api.service';

export default {
  name: 'UserProfileView',
  components: {
    BottomNavigation
  },
  data() {
    return {
      user: {},
      userId: Number(localStorage.getItem('userId')) || null,
      defaultAvatar: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23E5E7EB"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" font-size="40" fill="%236B7280"%3E👤%3C/text%3E%3C/svg%3E',
      newAvatarFile: null,
      myPosts: [],
      likedPosts: [],
      myVoices: []
    };
  },
  created() {
    this.loadUserData();
  },
  methods: {
    async loadUserData() {
      if (!this.userId) {
        this.userId = 1;
        localStorage.setItem('userId', '1');
      }
      
      try {
        const userData = await userAPI.getUserById(this.userId);
        this.user = userData;
        
        const postsData = await postAPI.getPostsByUserId(this.userId);
        this.myPosts = postsData || [];
        
        const likedData = await postAPI.getLikedPosts(this.userId);
        this.likedPosts = likedData || [];
        
        const voicesData = await voiceAPI.getVoicesByUserId(this.userId);
        this.myVoices = voicesData || this.getMockVoices();
      } catch (error) {
        console.error('加载用户数据失败:', error);
        this.user = { username: '用户', phone_number: '12345678901' };
        this.myVoices = this.getMockVoices();
      }
    },
    
    getMockVoices() {
      return [
        {
          id: 1,
          name: '声音 01',
          status: 'ready',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          name: '声音 02',
          status: 'training',
          createdAt: new Date().toISOString()
        }
      ];
    },
    
    getStatusText(status) {
      const statusMap = {
        ready: '已可用 ✓',
        training: '训练中',
        error: '异常'
      };
      return statusMap[status] || '未知';
    },
    
    getBarHeight(index) {
      const heights = [40, 70, 50, 85, 60, 90, 75, 55, 80, 65, 45, 50];
      return `${heights[index % heights.length]}%`;
    },
    
    handleImageError(e) {
      e.target.src = this.defaultAvatar;
    },
    
    onAvatarChange(e) {
      const file = e.target.files?.[0];
      if (!file) return;
      
      if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB');
        return;
      }
      
      this.newAvatarFile = file;
      const reader = new FileReader();
      reader.onload = (ev) => {
        this.user.avatar_url = ev.target.result;
      };
      reader.readAsDataURL(file);
      
      this.uploadAvatar();
    },
    
    async uploadAvatar() {
      if (!this.newAvatarFile) return;
      
      try {
        const formData = new FormData();
        formData.append('avatar', this.newAvatarFile);
        await userAPI.uploadAvatar(this.userId, formData);
        alert('头像上传成功');
      } catch (error) {
        console.error('头像上传失败:', error);
        alert('头像上传失败');
      }
    },
    
    showMyPosts() {
      alert(`您有 ${this.myPosts.length} 篇帖子`);
    },
    
    showMyLikes() {
      alert(`您收藏了 ${this.likedPosts.length} 篇帖子`);
    },
    
    goToSettings() {
      alert('设置功能即将开放');
    },
    
    playVoice(voice) {
      console.log('播放声音:', voice);
      alert(`播放: ${voice.name}`);
    },
    
    renameVoice(voice) {
      const newName = prompt('请输入新名称:', voice.name);
      if (newName && newName.trim()) {
        voice.name = newName.trim();
      }
    },
    
    deleteVoice(voice) {
      if (confirm(`确定要删除 ${voice.name} 吗？`)) {
        const index = this.myVoices.indexOf(voice);
        if (index > -1) {
          this.myVoices.splice(index, 1);
        }
      }
    },
    
    addNewVoice() {
      this.$router.push({ name: 'VoiceEnrollment' });
    },
    
    goToSecurity() {
      alert('账号与安全功能即将开放');
    },
    
    goToPrivacy() {
      alert('隐私设置功能即将开放');
    },
    
    goToAbout() {
      alert('关于我们：FawnFlock v1.0');
    },
    
    logout() {
      if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('userId');
        this.$router.push({ name: 'Login' });
      }
    },
    
    handleNavigate(item) {
      console.log('导航到:', item.route);
    }
  }
};
</script>

<style scoped>
/* ===== 主容器 ===== */
.profile-page {
  min-height: 100vh;
  background: #f8fafc;
  padding-bottom: 56px;
}

/* ===== 顶部个人信息区 ===== */
.profile-header {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  padding: 48px 16px 24px 16px;
  color: #ffffff;
}

.profile-info {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid #ffffff;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.edit-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ffffff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.edit-avatar-btn .icon {
  font-size: 14px;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.username {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #ffffff;
}

.user-handle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 8px 0;
}

.user-bio {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 统计数据 */
.stats-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.3);
}

/* ===== 功能入口区 ===== */
.function-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 16px;
}

.function-card {
  background: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  position: relative;
}

.function-card:hover {
  background: #f9fafb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.function-card:active {
  transform: scale(0.98);
}

.card-icon {
  font-size: 28px;
}

.card-label {
  font-size: 13px;
  font-weight: 500;
  color: #0f172a;
}

.card-count {
  font-size: 11px;
  color: #94a3b8;
}

.card-arrow {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 18px;
  color: #cbd5e1;
}

/* ===== 声纹管理模块 ===== */
.voice-section {
  padding: 0 16px 16px 16px;
}

.section-header {
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.section-subtitle {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

.voice-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.voice-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.2s;
}

.voice-card:not(.add-voice-card):hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.voice-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.voice-icon {
  font-size: 20px;
}

.voice-name {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
}

.voice-status {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 500;
}

.status-ready {
  background: #d1fae5;
  color: #065f46;
}

.status-training {
  background: #fef3c7;
  color: #92400e;
}

.status-error {
  background: #fee2e2;
  color: #991b1b;
}

.voice-waveform {
  margin-bottom: 12px;
  padding: 12px 0;
}

.waveform-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 40px;
  gap: 3px;
}

.bar {
  flex: 1;
  background: linear-gradient(to top, #6366f1, #a5b4fc);
  border-radius: 2px;
  transition: height 0.3s ease;
  min-height: 4px;
}

.voice-training .bar {
  animation: waveAnimation 1.5s ease-in-out infinite;
}

@keyframes waveAnimation {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

.voice-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  padding: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
  color: #475569;
}

.action-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.action-btn.danger {
  color: #dc2626;
}

.action-btn.danger:hover {
  background: #fee2e2;
  border-color: #fecaca;
}

.action-btn .icon {
  font-size: 14px;
}

/* 添加新声音卡片 */
.add-voice-card {
  border: 2px dashed #cbd5e1;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-voice-card:hover {
  border-color: #6366f1;
  background: #f0f4ff;
}

.add-icon {
  font-size: 32px;
  color: #6366f1;
}

.add-label {
  font-size: 14px;
  font-weight: 500;
  color: #6366f1;
}

/* ===== 其他设置区 ===== */
.settings-section {
  padding: 0 16px 16px 16px;
}

.setting-item {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  margin-bottom: 8px;
}

.setting-item:hover {
  background: #f9fafb;
  transform: translateX(4px);
}

.setting-item:active {
  transform: scale(0.98);
}

.setting-icon {
  font-size: 20px;
  width: 24px;
  text-align: center;
}

.setting-label {
  flex: 1;
  font-size: 15px;
  color: #0f172a;
}

.setting-arrow {
  font-size: 20px;
  color: #cbd5e1;
}

/* ===== 响应式设计 ===== */
@media (max-width: 480px) {
  .profile-header {
    padding: 40px 12px 20px 12px;
  }
  
  .profile-avatar {
    width: 72px;
    height: 72px;
  }
  
  .username {
    font-size: 18px;
  }
  
  .function-cards {
    gap: 8px;
    padding: 12px;
  }
  
  .function-card {
    padding: 16px 8px;
  }
  
  .card-icon {
    font-size: 24px;
  }
  
  .card-label {
    font-size: 12px;
  }
}

@media (min-width: 768px) {
  .profile-page {
    max-width: 640px;
    margin: 0 auto;
    border-left: 1px solid #e5e7eb;
    border-right: 1px solid #e5e7eb;
  }
}
</style>
