<template>
  <div class="post-detail-page">
    <!-- 顶部导航栏（固定） -->
    <div class="detail-header">
      <button class="back-btn" @click="goBack">
        <span>←</span>
      </button>
      <h1 class="header-title">详情</h1>
      <button class="share-btn" @click="sharePost">
        <span>🔗</span>
      </button>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>加载失败</h3>
        <p>{{ errorMessage }}</p>
        <button @click="retryLoad" class="retry-btn">🔄 重新加载</button>
      </div>

      <!-- 帖子内容 -->
      <div v-else class="post-container">
        <!-- 顶部作者区 -->
        <div class="author-section">
          <div class="author-header">
            <div class="avatar" @click="navigateToUserProfile">{{ getInitial(post.author) }}</div>
            <div class="author-info">
              <h2 class="author-name">{{ post.author || '匿名用户' }}</h2>
              <span class="author-handle">@{{ getUsername(post.author) }}</span>
            </div>
            <span class="post-time">{{ formatTime(post.created_at) }}</span>
          </div>
        </div>

        <!-- 帖子内容区 -->
        <div class="content-section">
          <h1 v-if="post.title" class="post-title">{{ post.title }}</h1>
          <div class="post-body">
            <p v-for="(paragraph, index) in parseParagraphs(post.content)" :key="index" class="paragraph">
              {{ paragraph }}
            </p>
          </div>

          <!-- 媒体内容 -->
          <div v-if="post.images && post.images.length > 0" class="media-gallery">
            <img
              v-for="(img, index) in post.images"
              :key="index"
              :src="img"
              :alt="`图片 ${index + 1}`"
              class="gallery-image"
              @click="previewImage(post.images, index)"
            />
          </div>
        </div>

        <!-- 朗读控制区（核心亮点） -->
        <div v-if="hasAuthorVoice" class="voice-section">
          <div class="voice-card">
            <!-- 朗读按钮和标题 -->
            <div class="voice-header">
              <button 
                class="play-btn"
                :class="{ 'playing': isVoicePlaying }"
                @click="toggleVoicePlayback"
                :disabled="loadingVoice"
              >
                <span class="play-icon">{{ playButtonIcon }}</span>
              </button>
              <span class="voice-text">用 TA 的声音朗读</span>
            </div>

            <!-- 进度条 -->
            <div class="progress-section">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: voiceProgress + '%' }"></div>
              </div>
              <span class="time-display">
                {{ formatVoiceTime(voiceCurrentTime) }} / {{ formatVoiceTime(voiceDuration) }}
              </span>
            </div>

            <!-- 状态提示 -->
            <div v-if="voiceStatus" class="voice-status">
              {{ voiceStatusText }}
            </div>
          </div>
        </div>

        <!-- 作者未提供声纹 -->
        <div v-else class="no-voice-section">
          <span class="no-voice-text">作者暂未提供声音</span>
        </div>

        <!-- 帖子互动区 -->
        <div class="interaction-section">
          <button 
            class="interaction-btn like-btn"
            :class="{ active: post.isLiked }"
            @click="toggleLike"
          >
            <span class="icon">{{ post.isLiked ? '❤️' : '🤍' }}</span>
            <span class="count">{{ post.like_count || 0 }}</span>
          </button>
          <button class="interaction-btn comment-btn">
            <span class="icon">💬</span>
            <span class="count">{{ comments.length }}</span>
          </button>
          <button class="interaction-btn favorite-btn">
            <span class="icon">⭐</span>
            <span class="text">收藏</span>
          </button>
        </div>

        <!-- 评论区 -->
        <div class="comments-section">
          <!-- 评论输入框 -->
          <div class="comment-input-box">
            <h3 class="section-title">发表评论</h3>
            <textarea
              v-model="newComment"
              placeholder="说说你的想法..."
              class="comment-textarea"
              @input="commentError = ''"
            ></textarea>
            <div class="input-footer">
              <span class="char-count">{{ newComment.length }}/500</span>
              <button
                class="submit-btn"
                @click="submitComment"
                :disabled="!newComment.trim() || submitting"
              >
                <span v-if="!submitting">发送</span>
                <span v-else class="spinner-small"></span>
              </button>
            </div>
            <p v-if="commentError" class="error-text">{{ commentError }}</p>
            <div v-if="commentSuccess" class="success-toast">评论发表成功！</div>
          </div>

          <!-- 评论列表 -->
          <div class="comment-list">
            <h3 class="section-title">全部评论 ({{ comments.length }})</h3>

            <!-- 空状态 -->
            <div v-if="comments.length === 0" class="empty-comments">
              <p>还没有评论</p>
            </div>

            <!-- 评论项 -->
            <div v-else>
              <div v-for="comment in comments" :key="comment.comment_id" class="comment-item">
                <div class="comment-avatar">{{ getInitial(comment.author) }}</div>
                <div class="comment-body">
                  <div class="comment-header">
                    <span class="comment-author">{{ comment.author || '匿名用户' }}</span>
                    <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
                  </div>
                  <p class="comment-text">{{ comment.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 隐藏音频元素 -->
    <audio ref="voiceAudio" @timeupdate="updateVoiceProgress" @ended="voicePlaybackEnded"></audio>
  </div>
</template>

<script>
import http from '@/utils/http';
import { API_ENDPOINTS } from '@/config/api.config';
import { voiceAPI } from '@/services/api.service';

export default {
  name: 'PostDetailOptimized',
  
  data() {
    return {
      // 帖子数据
      post: {},
      postId: null,
      comments: [],
      
      // 加载状态
      loading: false,
      error: false,
      errorMessage: '',
      
      // 评论相关
      newComment: '',
      commentError: '',
      commentSuccess: false,
      submitting: false,
      
      // 声音播放相关
      hasAuthorVoice: false,
      isVoicePlaying: false,
      loadingVoice: false,
      voiceStatus: '',
      voiceProgress: 0,
      voiceCurrentTime: 0,
      voiceDuration: 0,
      voiceAudioUrl: null,
      authorVoiceId: null
    };
  },
  
  computed: {
    playButtonIcon() {
      if (this.loadingVoice) return '⏳';
      if (this.isVoicePlaying) return '⏸';
      return '▶';
    },
    
    voiceStatusText() {
      if (this.loadingVoice) return '正在加载声音…';
      if (this.isVoicePlaying) return '正在朗读';
      return '';
    }
  },
  
  async mounted() {
    await this.loadPostDetail();
  },
  
  beforeUnmount() {
    this.stopVoicePlayback();
  },
  
  methods: {
    async loadPostDetail() {
      try {
        this.loading = true;
        this.error = false;
        
        this.postId = parseInt(this.$route.params.id);
        
        if (!this.postId || isNaN(this.postId)) {
          throw new Error('无效的帖子ID');
        }
        
        // 获取帖子数据
        this.post = await http.get(API_ENDPOINTS.POST_DETAIL(this.postId));
        console.log('帖子数据:', this.post);
        
        // 检查作者是否有声纹
        if (this.post.user_id) {
          try {
            const voiceProfile = await voiceAPI.getVoiceProfile(this.post.user_id);
            if (voiceProfile && voiceProfile.voices && voiceProfile.voices.length > 0) {
              this.hasAuthorVoice = true;
              this.authorVoiceId = voiceProfile.voices[0].voice_id;
            }
          } catch (err) {
            console.log('作者无声纹:', err);
            this.hasAuthorVoice = false;
          }
        }
        
        // 获取评论列表
        try {
          this.comments = await http.get(API_ENDPOINTS.COMMENTS_LIST(this.postId));
        } catch (err) {
          console.warn('获取评论失败:', err);
          this.comments = [];
        }
        
      } catch (error) {
        console.error('加载帖子失败:', error);
        this.error = true;
        this.errorMessage = error.message || '网络连接失败';
      } finally {
        this.loading = false;
      }
    },
    
    async toggleVoicePlayback() {
      if (this.isVoicePlaying) {
        this.stopVoicePlayback();
      } else {
        await this.playVoice();
      }
    },
    
    async playVoice() {
      try {
        this.loadingVoice = true;
        this.voiceStatus = 'loading';
        
        // 获取文本转语音或声纹朗读
        const textToSpeak = `${this.post.title || ''}。${this.post.content || ''}`;
        
        if (!textToSpeak.trim()) {
          alert('帖子内容为空');
          this.loadingVoice = false;
          return;
        }
        
        // 使用 Web Speech API 或获取预生成的音频
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'zh-CN';
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        utterance.onstart = () => {
          this.isVoicePlaying = true;
          this.voiceStatus = 'playing';
          this.loadingVoice = false;
        };
        
        utterance.onend = () => {
          this.stopVoicePlayback();
        };
        
        utterance.onerror = (event) => {
          console.error('语音播放错误:', event);
          this.voiceStatus = 'error';
          this.isVoicePlaying = false;
          this.loadingVoice = false;
        };
        
        this.loadingVoice = false;
        window.speechSynthesis.speak(utterance);
        
      } catch (error) {
        console.error('播放声音失败:', error);
        this.voiceStatus = 'error';
        this.loadingVoice = false;
      }
    },
    
    stopVoicePlayback() {
      window.speechSynthesis.cancel();
      this.isVoicePlaying = false;
      this.voiceStatus = '';
      this.voiceProgress = 0;
      this.voiceCurrentTime = 0;
    },
    
    updateVoiceProgress() {
      if (this.$refs.voiceAudio) {
        const audio = this.$refs.voiceAudio;
        this.voiceDuration = audio.duration || 0;
        this.voiceCurrentTime = audio.currentTime || 0;
        this.voiceProgress = this.voiceDuration > 0 
          ? (this.voiceCurrentTime / this.voiceDuration) * 100 
          : 0;
      }
    },
    
    voicePlaybackEnded() {
      this.stopVoicePlayback();
    },
    
    formatVoiceTime(seconds) {
      if (!seconds || isNaN(seconds)) return '00:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    async submitComment() {
      if (!this.newComment.trim()) {
        this.commentError = '评论内容不能为空';
        return;
      }
      
      if (this.newComment.length > 500) {
        this.commentError = '评论内容不能超过500字';
        return;
      }
      
      try {
        this.submitting = true;
        this.commentError = '';
        
        const userId = localStorage.getItem('userId') || 1;
        
        await http.post(API_ENDPOINTS.COMMENT_CREATE(this.postId), {
          content: this.newComment,
          user_id: userId
        });
        
        this.commentSuccess = true;
        this.newComment = '';
        
        setTimeout(() => {
          this.commentSuccess = false;
        }, 3000);
        
        // 重新加载评论
        this.comments = await http.get(API_ENDPOINTS.COMMENTS_LIST(this.postId));
        
      } catch (error) {
        console.error('发表评论失败:', error);
        this.commentError = error.message || '发表评论失败';
      } finally {
        this.submitting = false;
      }
    },
    
    async toggleLike() {
      this.post.isLiked = !this.post.isLiked;
      this.post.like_count = (this.post.like_count || 0) + (this.post.isLiked ? 1 : -1);
    },
    
    parseParagraphs(content) {
      if (!content) return [];
      return content.split('\n\n').filter(p => p.trim());
    },
    
    getInitial(name) {
      return name ? name[0].toUpperCase() : 'U';
    },
    
    getUsername(name) {
      return name ? name.toLowerCase().replace(/\s+/g, '') : 'user';
    },
    
    formatTime(dateString) {
      if (!dateString) return '未知时间';
      
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      
      if (minutes < 1) return '刚刚';
      if (minutes < 60) return `${minutes}分钟前`;
      if (hours < 24) return `${hours}小时前`;
      if (days < 7) return `${days}天前`;
      
      return date.toLocaleDateString('zh-CN');
    },
    
    retryLoad() {
      this.loadPostDetail();
    },
    
    goBack() {
      this.$router.back();
    },
    
    sharePost() {
      const url = window.location.href;
      if (navigator.share) {
        navigator.share({
          title: this.post.title,
          text: this.post.content,
          url: url
        }).catch(err => console.log('分享失败:', err));
      } else {
        alert('分享功能即将开放');
      }
    },
    
    navigateToUserProfile() {
      if (this.post.user_id) {
        this.$router.push(`/UserProfile?userId=${this.post.user_id}`);
      }
    },
    
    previewImage(images, index) {
      console.log('预览图片:', index, images);
    }
  }
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.post-detail-page {
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
.detail-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.back-btn,
.share-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #0f172a;
  transition: background 0.2s ease;
}

.back-btn:hover,
.share-btn:hover {
  background: #f1f5f9;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  margin-top: 56px;
  overflow-y: auto;
  padding: 0;
}

/* 加载和错误状态 */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 20px;
  text-align: center;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.error-state h3 {
  font-size: 18px;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.error-state p {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 20px 0;
}

.retry-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.retry-btn:hover {
  transform: translateY(-2px);
}

/* 帖子容器 */
.post-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 作者区 */
.author-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
}

.author-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.avatar:hover {
  transform: scale(1.05);
}

.author-info {
  flex: 1;
}

.author-name {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.author-handle {
  font-size: 13px;
  color: #64748b;
}

.post-time {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
}

/* 内容区 */
.content-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
}

.post-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.post-body {
  font-size: 15px;
  color: #1e293b;
  line-height: 1.7;
}

.paragraph {
  margin: 0 0 12px 0;
}

.paragraph:last-child {
  margin-bottom: 0;
}

/* 媒体库 */
.media-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 8px;
  margin-top: 16px;
}

.gallery-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.gallery-image:hover {
  transform: scale(1.02);
}

/* 朗读卡片（核心亮点） */
.voice-section {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.voice-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.voice-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.play-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
  outline: none;
}

.play-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.play-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.play-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.play-btn.playing {
  animation: pulse-btn 1s ease-in-out infinite;
}

@keyframes pulse-btn {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(99, 102, 241, 0);
  }
}

.voice-text {
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(99, 102, 241, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
  transition: width 0.1s linear;
  border-radius: 2px;
}

.time-display {
  font-size: 12px;
  color: #64748b;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.voice-status {
  font-size: 12px;
  color: #6366f1;
  text-align: center;
  height: 16px;
}

/* 无声纹区 */
.no-voice-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.no-voice-text {
  font-size: 13px;
  color: #94a3b8;
}

/* 互动区 */
.interaction-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  gap: 16px;
  border-top: 1px solid #e2e8f0;
}

.interaction-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #64748b;
  font-size: 13px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.interaction-btn:hover {
  background: #f8fafc;
}

.interaction-btn .icon {
  font-size: 16px;
}

.interaction-btn.like-btn.active {
  color: #ef4444;
}

.interaction-btn.comment-btn {
  color: #6366f1;
}

.interaction-btn.favorite-btn {
  color: #f59e0b;
}

/* 评论区 */
.comments-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

/* 评论输入框 */
.comment-input-box {
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 16px;
}

.comment-textarea {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  outline: none;
  transition: border-color 0.2s ease;
}

.comment-textarea:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e2e8f0;
}

.char-count {
  font-size: 12px;
  color: #94a3b8;
}

.submit-btn {
  padding: 6px 16px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-text {
  color: #ef4444;
  font-size: 12px;
  margin-top: 8px;
}

.success-toast {
  background: #d1fae5;
  color: #047857;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  margin-top: 8px;
  text-align: center;
}

/* 评论列表 */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-comments {
  text-align: center;
  padding: 20px;
  color: #94a3b8;
  font-size: 13px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.comment-body {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.comment-author {
  font-size: 13px;
  font-weight: 500;
  color: #0f172a;
}

.comment-time {
  font-size: 12px;
  color: #94a3b8;
}

.comment-text {
  font-size: 14px;
  color: #1e293b;
  line-height: 1.6;
  margin: 0;
}

/* 微调 */
@media (max-width: 480px) {
  .post-container {
    padding: 12px;
    gap: 16px;
  }
  
  .content-section {
    padding: 16px;
  }
  
  .post-title {
    font-size: 18px;
  }
  
  .post-body {
    font-size: 14px;
  }
}
</style>
