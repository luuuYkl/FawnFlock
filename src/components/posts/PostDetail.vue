<template>
  <BaseLayout>
    <template v-slot:header>
      <div class="header-content">
        <button @click="goBack" class="back-button">
          ← 返回
        </button>
        <h1>帖子详情</h1>
        <button @click="sharePost" class="share-button">
          📤 分享
        </button>
      </div>
    </template>

    <div class="post-detail-page">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <div class="error-icon">⚠️</div>
        <p class="error-title">加载失败</p>
        <p class="error-subtitle">{{ errorMessage }}</p>
        <button @click="retryLoad" class="btn btn-primary">
          🔄 重试
        </button>
      </div>

      <!-- 帖子内容 -->
      <div v-else class="post-detail-content">
        <!-- 原帖卡片 -->
        <div class="original-post card">
          <!-- 作者信息 -->
          <div class="author-info">
            <div class="avatar">
              {{ post.author ? post.author[0] : 'U' }}
            </div>
            <div class="author-meta">
              <h3 class="author-name">{{ post.author || '未知用户' }}</h3>
              <span class="post-time">{{ formatDate(post.created_at) }}</span>
            </div>
          </div>

          <!-- 帖子标题 -->
          <h1 class="post-title">{{ post.title }}</h1>

          <!-- 帖子内容 -->
          <div class="post-content">
            <p>{{ post.content }}</p>
          </div>

          <!-- 图片/媒体 -->
          <div v-if="post.media_urls && post.media_urls.length > 0" class="media-gallery">
            <img 
              v-for="(url, index) in post.media_urls" 
              :key="index" 
              :src="url" 
              :alt="`图片 ${index + 1}`"
              class="media-image"
            />
          </div>

          <!-- 互动按钮 -->
          <div class="post-actions">
            <LikeButton 
              v-if="postId" 
              :postId="postId" 
              :userId="userId" 
              :initialLikeCount="post.like_count || 0" 
            />
            <button class="action-btn comment-count-btn">
              <span class="icon">💬</span>
              <span class="count">{{ comments.length }} 评论</span>
            </button>
          </div>
        </div>

        <!-- 评论输入框 -->
        <div class="comment-input-section card">
          <h3 class="section-title">发表评论</h3>
          <div class="input-wrapper" :class="{ 'error': commentError }">
            <textarea 
              v-model="newComment"
              placeholder="说点什么..."
              rows="3"
              maxlength="500"
              @input="commentError = ''"
            ></textarea>
          </div>
          <div class="comment-footer">
            <span class="char-count" :class="{ 'warning': newComment.length > 450 }">
              {{ newComment.length }}/500
            </span>
            <button 
              @click="submitComment" 
              class="btn btn-primary btn-sm"
              :disabled="!newComment.trim() || submitting"
            >
              <span v-if="!submitting">📮 发送</span>
              <span v-else class="spinner-sm"></span>
            </button>
          </div>
          <p v-if="commentError" class="error-text">{{ commentError }}</p>
          <div v-if="commentSuccess" class="message message-success">
            评论发表成功！
          </div>
        </div>

        <!-- 评论列表 -->
        <div class="comments-section">
          <h3 class="section-title">
            全部评论 ({{ comments.length }})
          </h3>

          <!-- 空状态 -->
          <div v-if="comments.length === 0" class="empty-comments">
            <div class="empty-icon">💬</div>
            <p>还没有评论</p>
            <p class="text-secondary">快来发表第一条评论吧！</p>
          </div>

          <!-- 评论列表 -->
          <div v-else class="comment-list">
            <div 
              v-for="comment in comments" 
              :key="comment.comment_id" 
              class="comment-item card"
            >
              <div class="comment-header">
                <div class="avatar avatar-sm">
                  {{ comment.author ? comment.author[0] : 'U' }}
                </div>
                <div class="comment-meta">
                  <span class="comment-author">{{ comment.author || '匿名用户' }}</span>
                  <span class="comment-time">{{ formatDate(comment.created_at) }}</span>
                </div>
              </div>
              <div class="comment-content">
                {{ comment.content }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>
  
  <script>
import BaseLayout from '../BaseLayout.vue';
import LikeButton from './LikeButton.vue';
import http from '@/utils/http';
import { API_ENDPOINTS } from '@/config/api.config';

export default {
  components: {
    BaseLayout,
    LikeButton
  },
  data() {
    return {
      userId: 1,           // 假设当前用户的 ID 为 1（实际应从登录状态获取）
      post: {},            // 原帖数据
      comments: [],        // 评论列表
      postId: null,        // 存储帖子 ID
      loading: false,      // 加载状态
      error: false,        // 错误状态
      errorMessage: '',    // 错误信息
      newComment: '',      // 新评论内容
      commentError: '',    // 评论错误
      commentSuccess: false, // 评论成功提示
      submitting: false    // 提交中状态
    };
  },
  async mounted() {
    await this.loadPostDetail();
  },
  methods: {
    // 加载帖子详情
    async loadPostDetail() {
      try {
        this.loading = true;
        this.error = false;

        // 从路由获取帖子 ID
        this.postId = parseInt(this.$route.params.id);
        console.log('PostDetail - 帖子 ID:', this.postId);

        if (!this.postId || isNaN(this.postId)) {
          throw new Error('无效的帖子ID');
        }

        // 使用统一的 HTTP 客户端获取帖子数据
        this.post = await http.get(API_ENDPOINTS.POST_DETAIL(this.postId));
        console.log('PostDetail - 帖子数据:', this.post);

        // 获取评论列表
        try {
          this.comments = await http.get(API_ENDPOINTS.COMMENTS_LIST(this.postId));
          console.log('PostDetail - 评论数据:', this.comments);
        } catch (commentError) {
          console.warn('获取评论失败，使用空数组:', commentError);
          this.comments = [];
        }
      } catch (error) {
        console.error('获取帖子详情失败:', error);
        this.error = true;
        this.errorMessage = error.message || '网络连接失败，请稍后重试';
      } finally {
        this.loading = false;
      }
    },

    // 重试加载
    async retryLoad() {
      await this.loadPostDetail();
    },

    // 提交评论
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
        this.commentSuccess = false;

        // 调用评论创建 API
        const response = await http.post(API_ENDPOINTS.COMMENT_CREATE(this.postId), {
          content: this.newComment,
          user_id: this.userId
        });

        console.log('评论发表成功:', response);

        // 显示成功提示
        this.commentSuccess = true;
        setTimeout(() => {
          this.commentSuccess = false;
        }, 3000);

        // 清空输入框
        this.newComment = '';

        // 重新加载评论列表
        this.comments = await http.get(API_ENDPOINTS.COMMENTS_LIST(this.postId));

      } catch (error) {
        console.error('发表评论失败:', error);
        this.commentError = error.message || '发表评论失败，请稍后重试';
      } finally {
        this.submitting = false;
      }
    },

    // 格式化时间显示
    formatDate(dateString) {
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

    // 返回上一页
    goBack() {
      this.$router.back();
    },

    // 分享帖子
    sharePost() {
      const url = window.location.href;
      if (navigator.share) {
        navigator.share({
          title: this.post.title,
          text: this.post.content,
          url: url
        }).catch(err => console.log('分享失败:', err));
      } else {
        // 复制链接到剪贴板
        navigator.clipboard.writeText(url).then(() => {
          alert('链接已复制到剪贴板！');
        }).catch(err => {
          console.error('复制失败:', err);
        });
      }
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
  padding: 0 var(--spacing-lg);
}

.header-content h1 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.back-button,
.share-button {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: var(--font-size-base);
  cursor: pointer;
  padding: 8px 12px;
  border-radius: var(--border-radius-md);
  transition: all var(--transition-base);
  font-weight: var(--font-weight-semibold);
}

.back-button:hover,
.share-button:hover {
  background: rgba(102, 126, 234, 0.1);
}

/* 页面容器 */
.post-detail-page {
  min-height: calc(100vh - 60px);
  background: var(--bg-gradient);
  padding: var(--spacing-lg);
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl);
  gap: var(--spacing-lg);
}

.loading-container p {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
}

/* 错误状态 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl) var(--spacing-lg);
  text-align: center;
}

.error-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-lg);
}

.error-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.error-subtitle {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
}

/* 内容区 */
.post-detail-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* 原帖卡片 */
.original-post {
  padding: var(--spacing-xl);
}

/* 作者信息 */
.author-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: var(--border-radius-full);
  background: var(--primary-gradient);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
}

.avatar-sm {
  width: 36px;
  height: 36px;
  font-size: var(--font-size-base);
}

.author-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.post-time {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

/* 帖子标题 */
.post-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
  line-height: 1.3;
}

/* 帖子内容 */
.post-content {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: var(--spacing-lg);
}

.post-content p {
  margin-bottom: var(--spacing-md);
  white-space: pre-wrap;
}

/* 媒体画廊 */
.media-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.media-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: transform var(--transition-base);
}

.media-image:hover {
  transform: scale(1.05);
}

/* 互动按钮 */
.post-actions {
  display: flex;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color-light);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-base);
}

.comment-count-btn {
  cursor: default;
}

/* 评论输入区 */
.comment-input-section {
  padding: var(--spacing-xl);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.comment-input-section textarea {
  width: 100%;
  padding: var(--spacing-md);
  border: none;
  outline: none;
  font-size: var(--font-size-base);
  color: var(--text-primary);
  resize: vertical;
  min-height: 80px;
  font-family: var(--font-family-base);
  background: transparent;
}

.comment-input-section textarea::placeholder {
  color: var(--text-tertiary);
}

.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-sm);
}

.char-count {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.char-count.warning {
  color: var(--warning-color);
  font-weight: var(--font-weight-semibold);
}

.error-text {
  color: var(--error-color);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-sm);
}

/* 评论区 */
.comments-section {
  padding: var(--spacing-xl);
  background: transparent;
}

.empty-comments {
  text-align: center;
  padding: var(--spacing-3xl) var(--spacing-lg);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-lg);
  opacity: 0.5;
}

.empty-comments p {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-xs);
}

/* 评论列表 */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.comment-item {
  padding: var(--spacing-lg);
  background: var(--bg-primary);
  animation: slideUp 0.3s ease;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.comment-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.comment-author {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.comment-time {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.comment-content {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: 1.6;
  padding-left: 48px;
  white-space: pre-wrap;
}

/* 响应式 */
@media (max-width: 768px) {
  .post-detail-page {
    padding: var(--spacing-md);
  }

  .post-title {
    font-size: var(--font-size-2xl);
  }

  .original-post,
  .comment-input-section,
  .comments-section {
    padding: var(--spacing-lg);
  }

  .header-content h1 {
    font-size: var(--font-size-base);
  }

  .back-button,
  .share-button {
    font-size: var(--font-size-sm);
    padding: 6px 10px;
  }

  .comment-content {
    padding-left: 0;
  }
}
</style>
  