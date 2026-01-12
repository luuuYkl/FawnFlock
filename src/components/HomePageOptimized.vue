<template>
  <div class="home-page">
    <!-- 顶部搜索栏（固定） -->
    <div class="search-bar" :class="{ hidden: !showSearchBar }">
      <div class="search-container">
        <span class="search-icon">🔍</span>
        <input
          type="search"
          v-model="searchQuery"
          @keydown.enter="onSearch"
          @focus="searchFocused = true"
          @blur="searchFocused = false"
          placeholder="搜索帖子、用户或话题"
          class="search-input"
        />
        <button v-if="searchQuery" @click="clearSearch" class="clear-btn">✕</button>
        <button class="voice-search-btn" @click="voiceSearch" title="语音搜索">🎤</button>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content" @scroll="handleScroll" ref="scrollContainer">
      <!-- 下拉刷新指示器 -->
      <div v-if="isPulling" class="pull-refresh-indicator">
        <div class="spinner"></div>
        <span>{{ pullText }}</span>
      </div>

      <!-- 加载骨架屏 -->
      <div v-if="loading && posts.length === 0" class="skeleton-list">
        <div v-for="i in 3" :key="i" class="skeleton-card">
          <div class="skeleton-header">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-user-info">
              <div class="skeleton-line username"></div>
              <div class="skeleton-line time"></div>
            </div>
          </div>
          <div class="skeleton-content">
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
          </div>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>加载失败</h3>
        <p>{{ errorMessage }}</p>
        <button @click="retryFetch" class="retry-btn">
          <span v-if="!loading">🔄 重新加载</span>
          <div v-else class="spinner small"></div>
        </button>
      </div>

      <!-- 空状态 -->
      <div v-else-if="posts.length === 0 && !loading" class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>还没有帖子</h3>
        <p>成为第一个发帖的人吧！</p>
        <button @click="navigateToCreate" class="action-btn">
          ✍️ 发布第一篇帖子
        </button>
      </div>

      <!-- 帖子流列表 -->
      <div v-else class="post-stream">
        <TransitionGroup name="post" tag="div" class="post-list">
          <div
            v-for="post in posts"
            :key="post.post_id"
            class="post-card"
            @click="navigateToDetail(post.post_id)"
          >
            <!-- 用户信息栏 -->
            <div class="post-header">
              <img
                :src="post.avatar || defaultAvatar"
                :alt="post.author"
                class="user-avatar"
                @error="handleImageError"
              />
              <div class="user-info">
                <span class="username">{{ post.author || '匿名用户' }}</span>
                <span class="post-time">{{ formatTime(post.created_at) }}</span>
              </div>
              <button class="more-btn" @click.stop="showMoreOptions(post)">⋯</button>
            </div>

            <!-- 帖子内容 -->
            <div class="post-body">
              <h3 v-if="post.title" class="post-title">{{ post.title }}</h3>
              <p class="post-content" :class="{ expanded: post.expanded }">
                {{ post.content }}
              </p>
              <button
                v-if="isContentLong(post.content) && !post.expanded"
                @click.stop="expandContent(post)"
                class="expand-btn"
              >
                展开
              </button>
            </div>

            <!-- 媒体内容 -->
            <div v-if="post.images && post.images.length > 0" class="post-media">
              <div
                class="media-grid"
                :class="{
                  'single': post.images.length === 1,
                  'double': post.images.length === 2,
                  'triple': post.images.length === 3,
                  'multiple': post.images.length > 3
                }"
              >
                <img
                  v-for="(img, index) in post.images.slice(0, 9)"
                  :key="index"
                  :src="img"
                  :alt="`图片 ${index + 1}`"
                  class="media-item"
                  @click.stop="previewImage(post.images, index)"
                  @error="handleImageError"
                />
                <div
                  v-if="post.images.length > 9"
                  class="more-images-overlay"
                  @click.stop="previewImage(post.images, 9)"
                >
                  +{{ post.images.length - 9 }}
                </div>
              </div>
            </div>

            <!-- 操作栏 -->
            <div class="post-actions">
              <button
                class="action-btn like"
                :class="{ active: post.isLiked }"
                @click.stop="toggleLike(post)"
              >
                <span class="icon">{{ post.isLiked ? '❤️' : '🤍' }}</span>
                <span class="text">{{ formatCount(post.like_count || 0) }}</span>
              </button>
              <button class="action-btn comment" @click.stop="navigateToDetail(post.post_id)">
                <span class="icon">💬</span>
                <span class="text">{{ formatCount(post.comment_count || 0) }}</span>
              </button>
              <button 
                class="action-btn voice"
                :class="{ playing: playingPostId === post.post_id }"
                @click.stop="playPostVoice(post)"
                title="用声音朗读这条帖子"
              >
                <span class="icon">{{ playingPostId === post.post_id ? '🎵' : '🎙️' }}</span>
                <span class="text">{{ playingPostId === post.post_id ? '播放中' : '朗读' }}</span>
              </button>
              <button class="action-btn share" @click.stop="sharePost(post)">
                <span class="icon">🔗</span>
                <span class="text">分享</span>
              </button>
            </div>
          </div>
        </TransitionGroup>

        <!-- 加载更多指示器 -->
        <div v-if="loadingMore" class="loading-more">
          <div class="spinner small"></div>
          <span>加载更多...</span>
        </div>

        <!-- 没有更多数据 -->
        <div v-if="noMoreData && posts.length > 0" class="no-more-data">
          <span>━━━━━  已经到底啦  ━━━━━</span>
        </div>
      </div>
    </div>

    <!-- 底部导航栏（固定） -->
    <BottomNavigation
      :current="currentRoute"
      :message-badge="0"
      @navigate="handleNavigate"
    />
  </div>
</template>

<script>
import http from '@/utils/http';
import { API_ENDPOINTS } from '@/config/api.config';
import BottomNavigation from '@/components/BottomNavigation.vue';

export default {
  name: 'HomePageOptimized',
  components: {
    BottomNavigation
  },
  data() {
    return {
      searchQuery: '',
      searchFocused: false,
      showSearchBar: true,
      lastScrollTop: 0,
      
      posts: [],
      loading: false,
      loadingMore: false,
      error: false,
      errorMessage: '',
      
      isPulling: false,
      pullText: '下拉刷新',
      startY: 0,
      pullDistance: 0,
      
      page: 1,
      pageSize: 10,
      noMoreData: false,
      
      defaultAvatar: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23E5E7EB"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" font-size="40" fill="%236B7280"%3E👤%3C/text%3E%3C/svg%3E',
      
      currentRoute: 'HomePage',
      playingPostId: null,
      synth: null
    };
  },
  
  created() {
    this.fetchPosts();
  },
  
  mounted() {
    this.updateCurrentRoute();
    window.addEventListener('scroll', this.handleScroll);
    
    const container = this.$refs.scrollContainer;
    if (container) {
      container.addEventListener('touchstart', this.handleTouchStart, { passive: true });
      container.addEventListener('touchmove', this.handleTouchMove, { passive: true });
      container.addEventListener('touchend', this.handleTouchEnd);
    }
  },
  
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
    const container = this.$refs.scrollContainer;
    if (container) {
      container.removeEventListener('touchstart', this.handleTouchStart);
      container.removeEventListener('touchmove', this.handleTouchMove);
      container.removeEventListener('touchend', this.handleTouchEnd);
    }
  },
  
  methods: {
    async fetchPosts(refresh = false) {
      try {
        if (refresh) {
          this.page = 1;
          this.noMoreData = false;
          this.posts = [];
        }

        this.loading = true;
        this.error = false;

        const response = await http.get(API_ENDPOINTS.POSTS_LIST, {
          params: {
            page: this.page,
            pageSize: this.pageSize
          }
        });

        if (Array.isArray(response)) {
          if (response.length === 0 && this.page === 1) {
            this.posts = [];
          } else if (response.length < this.pageSize) {
            this.posts = refresh ? response : [...this.posts, ...response];
            this.noMoreData = true;
          } else {
            this.posts = refresh ? response : [...this.posts, ...response];
          }
        } else {
          throw new Error('数据格式错误');
        }
      } catch (error) {
        console.error('获取帖子失败:', error);
        this.error = true;
        this.errorMessage = error.message || '网络连接失败';
      } finally {
        this.loading = false;
        this.isPulling = false;
        this.loadingMore = false;
      }
    },

    async retryFetch() {
      this.page = 1;
      this.noMoreData = false;
      await this.fetchPosts(true);
    },

    handleScroll(e) {
      const scrollTop = e.target.scrollTop || window.pageYOffset || document.documentElement.scrollTop;
      const clientHeight = e.target.clientHeight || window.innerHeight;
      const scrollHeight = e.target.scrollHeight || document.documentElement.scrollHeight;

      // 控制搜索栏显示/隐藏
      const delta = scrollTop - this.lastScrollTop;
      if (delta > 10 && scrollTop > 50) {
        this.showSearchBar = false;
      } else if (delta < -10) {
        this.showSearchBar = true;
      }
      this.lastScrollTop = scrollTop;

      // 加载更多
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        this.loadMore();
      }
    },

    async loadMore() {
      if (this.loadingMore || this.loading || this.noMoreData || this.error) return;
      
      this.loadingMore = true;
      this.page++;
      await this.fetchPosts();
    },

    handleTouchStart(e) {
      if (window.scrollY === 0 || e.target.scrollTop === 0) {
        this.startY = e.touches[0].clientY;
      }
    },

    handleTouchMove(e) {
      if (this.startY === 0) return;

      const currentY = e.touches[0].clientY;
      this.pullDistance = currentY - this.startY;

      if (this.pullDistance > 0 && (window.scrollY === 0 || e.target.scrollTop === 0)) {
        this.isPulling = true;
        this.pullText = this.pullDistance > 80 ? '释放刷新' : '下拉刷新';
      }
    },

    async handleTouchEnd() {
      if (this.pullDistance > 80) {
        this.pullText = '刷新中...';
        await this.fetchPosts(true);
      } else {
        this.isPulling = false;
      }
      this.startY = 0;
      this.pullDistance = 0;
    },

    onSearch() {
      if (!this.searchQuery.trim()) return;
      this.$router.push({ name: 'Search', query: { q: this.searchQuery } });
    },

    clearSearch() {
      this.searchQuery = '';
    },

    voiceSearch() {
      alert('语音搜索功能即将开放');
    },

    formatTime(dateString) {
      const now = new Date();
      const date = new Date(dateString);
      const diff = now - date;
      
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (seconds < 60) return '刚刚';
      if (minutes < 60) return `${minutes}分钟前`;
      if (hours < 24) return `${hours}小时前`;
      if (days < 7) return `${days}天前`;
      
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    },

    formatCount(count) {
      if (count >= 10000) return `${(count / 10000).toFixed(1)}w`;
      if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
      return count || 0;
    },

    isContentLong(content) {
      return content && content.length > 120;
    },

    expandContent(post) {
      post.expanded = true;
      this.$forceUpdate();
    },

    handleImageError(e) {
      e.target.src = this.defaultAvatar;
    },

    previewImage(images, index) {
      console.log('预览图片:', images, index);
      // TODO: 实现图片预览功能
    },

    async toggleLike(post) {
      try {
        post.isLiked = !post.isLiked;
        post.like_count = (post.like_count || 0) + (post.isLiked ? 1 : -1);
        this.$forceUpdate();
        // TODO: 调用API更新点赞状态
      } catch (error) {
        console.error('点赞失败:', error);
        post.isLiked = !post.isLiked;
        post.like_count = (post.like_count || 0) + (post.isLiked ? 1 : -1);
        this.$forceUpdate();
      }
    },

    sharePost(post) {
      console.log('分享帖子:', post);
      alert('分享功能即将开放');
    },

    playPostVoice(post) {
      // 检查浏览器是否支持 Web Speech API
      const SpeechSynthesisUtterance = window.SpeechSynthesisUtterance;
      const speechSynthesis = window.speechSynthesis;

      if (!SpeechSynthesisUtterance || !speechSynthesis) {
        alert('您的浏览器不支持语音合成功能');
        return;
      }

      // 如果已经在播放此帖子，则停止播放
      if (this.playingPostId === post.post_id) {
        speechSynthesis.cancel();
        this.playingPostId = null;
        return;
      }

      // 停止其他帖子的语音播放
      if (this.playingPostId !== null) {
        speechSynthesis.cancel();
      }

      // 组织要朗读的文本
      const textToSpeak = `${post.title || ''}。${post.content || ''}`;

      if (!textToSpeak.trim()) {
        alert('此帖子没有可读取的内容');
        return;
      }

      // 创建语音对象
      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      // 设置语音参数
      utterance.lang = 'zh-CN'; // 中文
      utterance.rate = 1; // 语速
      utterance.pitch = 1; // 音调
      utterance.volume = 1; // 音量

      // 监听事件
      utterance.onstart = () => {
        this.playingPostId = post.post_id;
      };

      utterance.onend = () => {
        this.playingPostId = null;
      };

      utterance.onerror = (event) => {
        console.error('语音播放出错:', event);
        this.playingPostId = null;
        alert('语音播放出错，请稍后重试');
      };

      // 开始播放
      speechSynthesis.cancel(); // 确保之前的语音已停止
      speechSynthesis.speak(utterance);
    },

    showMoreOptions(post) {
      console.log('更多选项:', post);
      alert('更多选项功能即将开放');
    },

    navigateToDetail(postId) {
      this.$router.push({ name: 'PostDetail', params: { id: postId } });
    },

    navigateToCreate() {
      this.$router.push({ name: 'CreatePost' });
    },

    handleNavigate(item) {
      console.log('导航到:', item.route);
    },

    updateCurrentRoute() {
      this.currentRoute = this.$route.name || 'HomePage';
    }
  },
  
  watch: {
    '$route.name'(newVal) {
      this.currentRoute = newVal || 'HomePage';
    }
  }
};
</script>

<style scoped>
/* ===== 主容器 ===== */
.home-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-top: 56px;
  padding-bottom: 56px;
}

/* ===== 顶部搜索栏 ===== */
.search-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  z-index: 1000;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.search-bar.hidden {
  transform: translateY(-100%);
  opacity: 0;
}

.search-container {
  max-width: 100%;
  height: 100%;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-icon {
  font-size: 20px;
  color: #9ca3af;
}

.search-input {
  flex: 1;
  height: 40px;
  padding: 0 16px;
  border: none;
  border-radius: 20px;
  background: #f0f0f0;
  font-size: 15px;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  background: #e9ecef;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-input::placeholder {
  color: #9ca3af;
}

.clear-btn,
.voice-search-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #6b7280;
  transition: all 0.2s;
}

.clear-btn:hover,
.voice-search-btn:hover {
  background: #f3f4f6;
}

.clear-btn:active,
.voice-search-btn:active {
  transform: scale(0.95);
}

/* ===== 主内容区域 ===== */
.main-content {
  min-height: calc(100vh - 112px);
  overflow-y: auto;
}

/* ===== 下拉刷新 ===== */
.pull-refresh-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  color: #6366f1;
  font-size: 14px;
  animation: fadeIn 0.3s ease;
}

/* ===== 骨架屏 ===== */
.skeleton-list {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.skeleton-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 12px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}

.skeleton-line.username {
  width: 30%;
}

.skeleton-line.time {
  width: 20%;
}

.skeleton-line.short {
  width: 60%;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ===== 错误状态 ===== */
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.error-icon,
.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.error-state h3,
.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.error-state p,
.empty-state p {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px 0;
}

.retry-btn,
.action-btn {
  padding: 12px 28px;
  border: none;
  border-radius: 24px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.retry-btn:hover,
.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}

.retry-btn:active,
.action-btn:active {
  transform: translateY(0);
}

/* ===== 帖子流 ===== */
.post-stream {
  padding: 12px 16px;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ===== 帖子卡片 ===== */
.post-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
}

.post-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.post-card:active {
  transform: translateY(0);
}

/* 帖子头部 */
.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.username {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.2;
}

.post-time {
  font-size: 12px;
  color: #a0a0a0;
  line-height: 1;
}

.more-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.more-btn:hover {
  background: #f3f4f6;
}

/* 帖子主体 */
.post-body {
  margin-bottom: 12px;
}

.post-title {
  font-size: 17px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.post-content {
  font-size: 15px;
  color: #374151;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-content.expanded {
  display: block;
  -webkit-line-clamp: unset;
}

.expand-btn {
  margin-top: 8px;
  padding: 4px 0;
  border: none;
  background: transparent;
  color: #6366f1;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
}

.expand-btn:hover {
  color: #4f46e5;
  text-decoration: underline;
}

/* 媒体内容 */
.post-media {
  margin-bottom: 12px;
}

.media-grid {
  display: grid;
  gap: 4px;
  border-radius: 8px;
  overflow: hidden;
}

.media-grid.single {
  grid-template-columns: 1fr;
  max-height: 400px;
}

.media-grid.double {
  grid-template-columns: repeat(2, 1fr);
}

.media-grid.triple {
  grid-template-columns: repeat(3, 1fr);
}

.media-grid.multiple {
  grid-template-columns: repeat(3, 1fr);
}

.media-item {
  width: 100%;
  height: 100%;
  object-fit: cover;
  aspect-ratio: 1;
  cursor: pointer;
  transition: all 0.2s;
}

.media-item:hover {
  opacity: 0.9;
}

.more-images-overlay {
  position: relative;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  aspect-ratio: 1;
}

/* 操作栏 */
.post-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.post-actions .action-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #6b7280;
  box-shadow: none;
}

.post-actions .action-btn:hover {
  background: #f9fafb;
  transform: none;
  box-shadow: none;
}

.post-actions .action-btn.active {
  color: #ef4444;
}

.post-actions .action-btn.voice {
  color: #6366f1;
}

.post-actions .action-btn.voice.playing {
  color: #8b5cf6;
  animation: pulse-voice 1s ease-in-out infinite;
}

@keyframes pulse-voice {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.post-actions .action-btn .icon {
  font-size: 18px;
}

.post-actions .action-btn .text {
  font-size: 13px;
  font-weight: 500;
}

.post-actions .action-btn:active {
  transform: scale(0.95);
}

/* 加载更多 / 没有更多 */
.loading-more,
.no-more-data {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px;
  color: #9ca3af;
  font-size: 14px;
}

/* ===== Spinner ===== */
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(99, 102, 241, 0.2);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.spinner.small {
  width: 16px;
  height: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== 过渡动画 ===== */
.post-enter-active,
.post-leave-active {
  transition: all 0.3s ease;
}

.post-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.post-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== 响应式设计 ===== */
@media (max-width: 480px) {
  .search-container {
    padding: 8px 12px;
  }
  
  .search-input {
    height: 36px;
    padding: 0 12px;
    font-size: 14px;
  }
  
  .post-stream {
    padding: 8px 12px;
  }
  
  .post-card {
    padding: 12px;
  }
  
  .post-title {
    font-size: 16px;
  }
  
  .post-content {
    font-size: 14px;
  }
}

@media (min-width: 768px) {
  .home-page {
    max-width: 640px;
    margin: 0 auto;
  }
}
</style>
