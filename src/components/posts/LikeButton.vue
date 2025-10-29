<template>
  <button 
    @click.stop="handleLike" 
    class="like-btn"
    :class="{ 'liked': isLiked }"
  >
    <span class="icon">{{ isLiked ? "❤️" : "🤍" }}</span>
    <span class="count">{{ likeCount }}</span>
  </button>
</template>

<script>
import http from '@/utils/http';
import { API_ENDPOINTS } from '@/config/api.config';

export default {
  props: {
    postId: {
      type: Number,
      required: true, // 确保从父组件接收 postId
    },
    userId: {
      type: Number,
      required: true, // 确保从父组件接收 userId
    },
    initialLikeCount: {
      type: Number,
      default: 0, // 初始点赞数
    },
    initialIsLiked: {
      type: Boolean,
      default: false, // 是否已点赞的初始状态
    },
  },
  data() {
    return {
      likeCount: this.initialLikeCount, // 使用传入的初始点赞数
      isLiked: this.initialIsLiked, // 是否已点赞
    };
  },
  created() {
    // 不需要单独获取点赞数，直接从父组件传递
    // this.fetchLikeCount();
  },
  watch: {
    // 监听 postId 变化时更新数据(如果需要)
    postId: {
      immediate: true,
      handler(newPostId) {
        if (newPostId) {
          this.fetchLikeCount();
        }
      }
    }
  },
  methods: {
    // 获取点赞数
    async fetchLikeCount() {
      try {
        // 从帖子详情获取点赞数，而不是用单独的 API
        const response = await http.get(API_ENDPOINTS.POST_DETAIL(this.postId));
        console.log("读取帖子详情:", response);
        if (response && typeof response.like_count !== 'undefined') {
          this.likeCount = response.like_count; // 更新点赞数
        } else {
          console.error("获取点赞数失败");
        }
      } catch (error) {
        console.error("获取点赞数时发生错误:", error);
      }
    },

    // 点赞操作
    async handleLike() {
      try {
        if (!this.isLiked) {
          // 点赞
          const response = await http.post(API_ENDPOINTS.POST_LIKE(this.postId));
          if (response && response.success) {
            this.likeCount += 1; // 点赞数增加
            this.isLiked = true; // 标记为已点赞
            console.log("点赞成功:", response);
          } else {
            console.error("点赞失败");
          }
        } else {
          // 取消点赞
          const response = await http.delete(API_ENDPOINTS.POST_UNLIKE(this.postId));
          if (response && response.success) {
            this.likeCount -= 1; // 点赞数减少
            this.isLiked = false; // 标记为未点赞
            console.log("取消点赞成功:", response);
          } else {
            console.error("取消点赞失败");
          }
        }
      } catch (error) {
        console.error(`点赞操作失败:`, error);
      }
    },
  },
};
</script>

<style scoped>
.like-btn {
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
  user-select: none;
}

.like-btn:hover {
  border-color: var(--error-color);
  color: var(--error-color);
  background: var(--error-light);
}

.like-btn.liked {
  border-color: var(--error-color);
  color: var(--error-color);
  background: var(--error-light);
}

.like-btn .icon {
  font-size: 16px;
  line-height: 1;
  transition: transform var(--transition-fast);
}

.like-btn:active .icon {
  transform: scale(1.3);
}

.like-btn .count {
  font-weight: var(--font-weight-semibold);
}
</style>
