<template>
  <BaseLayout>
    <template v-slot:header>
      <div class="header-content">
        <h1>🦌 FawnFlock</h1>
        <button @click="navigateToCreate" class="create-button">
          <span class="plus-icon">+</span> 发帖
        </button>
      </div>
    </template>

    <!-- 顶部固定搜索栏（在页面滚动时隐藏/显示） -->
    <div :class="['search-fixed', { hidden: !showSearch }]">
      <input
        type="search"
        v-model="searchQuery"
        @keydown.enter="onSearch"
        placeholder="搜索帖子或用户"
        aria-label="顶部搜索"
      />
    </div>

    <div class="home" @scroll="handleScroll" ref="scrollContainer">
      <!-- 下拉刷新指示器 -->
      <div v-if="isPulling" class="pull-indicator">
        <div class="spinner-small"></div>
        <span>{{ pullText }}</span>
      </div>

      <!-- 加载中骨架屏 -->
      <div v-if="loading && posts.length === 0" class="skeleton-container">
        <div v-for="i in 3" :key="i" class="skeleton-card">
          <div class="skeleton-header">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-info">
              <div class="skeleton-line short"></div>
              <div class="skeleton-line shorter"></div>
            </div>
          </div>
          <div class="skeleton-content">
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line medium"></div>
          </div>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-else-if="error" class="error-container">
        <div class="error-icon">⚠️</div>
        <p class="error-title">加载失败</p>
        <p class="error-subtitle">{{ errorMessage }}</p>
        <button @click="retryFetch" class="retry-button">
          <span v-if="!loading">🔄 重试</span>
          <span v-else class="spinner-small"></span>
        </button>
      </div>

      <!-- 空状态 -->
      <div v-else-if="posts.length === 0 && !loading" class="empty-container">
        <div class="empty-icon">📭</div>
        <p class="empty-title">还没有帖子</p>
        <p class="empty-subtitle">成为第一个发帖的人吧！</p>
        <button @click="navigateToCreate" class="create-first-button">
          ✍️ 发布第一篇帖子
        </button>
      </div>

      <!-- 帖子列表 -->
      <div v-else class="post-list">
        <TransitionGroup name="post-fade" tag="div">
          <PostCard 
            v-for="post in posts" 
            :key="post.post_id" 
            :post="post"
            class="post-item"
          />
        </TransitionGroup>

        <!-- 加载更多指示器 -->
        <div v-if="loadingMore" class="loading-more">
          <div class="spinner-small"></div>
          <span>加载更多...</span>
        </div>

        <!-- 没有更多数据 -->
        <div v-if="noMoreData && posts.length > 0" class="no-more">
          <span>━━━━━ 没有更多了 ━━━━━</span>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>

<script>
import PostCard from './posts/PostCard.vue';
import BaseLayout from './BaseLayout.vue';
import http from '@/utils/http';
import { API_ENDPOINTS } from '@/config/api.config';

export default {
  name: 'HomePage',
  components: {
    PostCard,
    BaseLayout
  },
  data() {
    return {
      searchQuery: '',
      showSearch: true,
      lastScrollTop: 0,
      posts: [],           // 帖子列表
      loading: false,      // 首次加载状态
      loadingMore: false,  // 加载更多状态
      error: false,        // 错误状态
      errorMessage: '',    // 错误信息
      isPulling: false,    // 下拉刷新状态
      pullText: '下拉刷新',
      page: 1,             // 当前页码
      pageSize: 10,        // 每页数量
      noMoreData: false,   // 是否没有更多数据
      startY: 0,           // 触摸起始位置
      pullDistance: 0      // 下拉距离
    };
  },
  created() {
    this.fetchPosts(); // 组件创建时获取帖子数据
  },
  mounted() {
    // 添加滚动监听
    window.addEventListener('scroll', this.handleScroll);
    
    // 添加触摸事件监听（用于下拉刷新）
    const container = this.$refs.scrollContainer;
    if (container) {
      container.addEventListener('touchstart', this.handleTouchStart);
      container.addEventListener('touchmove', this.handleTouchMove);
      container.addEventListener('touchend', this.handleTouchEnd);
    }
  },
  beforeUnmount() {
    // 移除事件监听
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
        // 如果是刷新，重置状态
        if (refresh) {
          this.page = 1;
          this.noMoreData = false;
          this.posts = [];
        }

        this.loading = true;
        this.error = false;

        // 从后端 API 获取帖子列表
        const response = await http.get(API_ENDPOINTS.POSTS_LIST, {
          params: {
            page: this.page,
            pageSize: this.pageSize
          }
        });

        // 检查返回的数据是否有效
        if (Array.isArray(response)) {
          if (response.length === 0 && this.page === 1) {
            // 第一页就没有数据
            this.posts = [];
          } else if (response.length < this.pageSize) {
            // 返回数据少于请求数量，说明没有更多了
            this.posts = refresh ? response : [...this.posts, ...response];
            this.noMoreData = true;
          } else {
            // 正常添加数据
            this.posts = refresh ? response : [...this.posts, ...response];
          }
        } else {
          throw new Error('返回的数据格式不正确');
        }
      } catch (error) {
        console.error("PostHomePage获取帖子数据失败:", error);
        this.error = true;
        this.errorMessage = error.message || '网络连接失败，请检查网络设置';
      } finally {
        this.loading = false;
        this.isPulling = false;
        this.loadingMore = false;
      }
    },

    // 重试加载
    async retryFetch() {
      this.page = 1;
      this.noMoreData = false;
      await this.fetchPosts(true);
    },

    // 滚动到底部加载更多，同时根据滚动方向隐藏/显示顶部搜索栏
    handleScroll() {
      const st = window.pageYOffset || document.documentElement.scrollTop || 0;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // 根据滚动方向决定是否显示搜索栏
      const delta = st - (this.lastScrollTop || 0);
      if (delta > 10) {
        this.showSearch = false;
      } else if (delta < -10) {
        this.showSearch = true;
      }
      this.lastScrollTop = st;

      // 如果滚动到底部附近（距离底部100px）
      if (st + windowHeight >= documentHeight - 100) {
        this.loadMore();
      }
    },

    onSearch() {
      if (!this.searchQuery) return;
      if (this.$router) {
        this.$router.push({ name: 'Search', query: { q: this.searchQuery } }).catch(() => {});
      }
    },

    // 加载更多
    async loadMore() {
      // 如果正在加载或已经没有更多数据，则不执行
      if (this.loadingMore || this.loading || this.noMoreData || this.error) {
        return;
      }

      this.loadingMore = true;
      this.page++;
      await this.fetchPosts();
    },

    // 下拉刷新 - 触摸开始
    handleTouchStart(e) {
      if (window.scrollY === 0) {
        this.startY = e.touches[0].clientY;
      }
    },

    // 下拉刷新 - 触摸移动
    handleTouchMove(e) {
      if (this.startY === 0) return;

      const currentY = e.touches[0].clientY;
      this.pullDistance = currentY - this.startY;

      if (this.pullDistance > 0 && window.scrollY === 0) {
        this.isPulling = true;
        if (this.pullDistance > 80) {
          this.pullText = '释放刷新';
        } else {
          this.pullText = '下拉刷新';
        }
      }
    },

    // 下拉刷新 - 触摸结束
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

    // 导航到发帖页面
    navigateToCreate() {
      this.$router.push('/create-post');
    }
  }
};
</script>

<style scoped>
/* 头部样式 */
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 20px;
}

.header-content h1 {
  font-size: 24px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.create-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.create-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.plus-icon {
  font-size: 18px;
  font-weight: bold;
}

/* 主容器 */
.home {
  min-height: calc(100vh - 60px);
  background: linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px;
  /* 给顶部固定搜索栏和 header 留出空间（避免遮挡） */
  padding-top: 112px; /* header (~56px) + search (~48px) + smaller gap */
}

/* 固定搜索栏样式 */
.search-fixed {
  position: fixed;
  top: 56px; /* 放在 header 之下，避免覆盖顶部导航 */
  left: 10px;
  right: 10px;
  height: 48px;
  z-index: 1200;
  display: flex;
  align-items: center;
  transition: transform 220ms ease, opacity 220ms ease;
}

.search-fixed.hidden {
  transform: translateY(-140%);
  opacity: 0;
}

.search-fixed input {
  width: 100%;
  height: 36px;
  padding: 6px 10px;
  border-radius: 18px;
  border: 1px solid #e6e6e6;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  outline: none;
}

/* 下拉刷新指示器 */
.pull-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px;
  color: #667eea;
  font-size: 14px;
  animation: fadeIn 0.3s ease;
}

/* 骨架屏 */
.skeleton-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.skeleton-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.skeleton-header {
  display: flex;
  gap: 12px;
  margin-bottom: 15px;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.skeleton-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 12px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-line.short {
  width: 60%;
}

.skeleton-line.shorter {
  width: 40%;
}

.skeleton-line.medium {
  width: 80%;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 错误容器 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.error-icon {
  font-size: 64px;
  margin-bottom: 20px;
  animation: shake 0.5s ease;
}

.error-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.error-subtitle {
  font-size: 14px;
  color: #666;
  margin-bottom: 30px;
}

.retry-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* 空状态 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

.empty-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.empty-subtitle {
  font-size: 14px;
  color: #666;
  margin-bottom: 30px;
}

.create-first-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.create-first-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* 帖子列表 */
.post-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.post-item {
  animation: slideUp 0.3s ease;
}

/* 列表动画 */
.post-fade-enter-active,
.post-fade-leave-active {
  transition: all 0.3s ease;
}

.post-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.post-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 加载更多 */
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  color: #667eea;
  font-size: 14px;
}

.no-more {
  text-align: center;
  padding: 30px 0;
  color: #999;
  font-size: 14px;
}

/* 旋转动画 */
.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home {
    padding: 15px;
  }

  .header-content h1 {
    font-size: 20px;
  }

  .create-button {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>
