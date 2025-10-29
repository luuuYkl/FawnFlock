<!-- 从父组件继承对应postid并显示评论数量 -->
<!-- 根据postid实现跳转到PostDetial的功能 -->

<template>
  <button class="comment-btn">
    <span class="icon">💬</span>
    <span class="count">{{ displayCommentCount }}</span>
  </button>
</template>

<script>
export default {
  props: {
    initialCommentCount: {
      type: Number,
      default: 0 // 默认值为 0
    },
    postId: {
      type: Number,
      required: true // 必须传入 postId
    }
  },

  data() {
    return {
      // 使用传入的初始评论数作为评论数
      commentCount: this.initialCommentCount
    };
  },

  computed: {
    // 计算属性，根据评论数返回合适的显示格式
    displayCommentCount() {
      return this.commentCount > 999 ? '999+' : this.commentCount;
    }
  },

  created() {
    // 检查是否接收到所需的 props，并记录错误
    if (this.postId === undefined) {
      console.error('postId 未定义，请确保从父组件传递了 postId');
    }
    if (this.initialCommentCount === undefined) {
      console.error('initialCommentCount 未定义，请确保从父组件传递了 initialCommentCount');
    }
  },

  // methods: {
  //   // 跳转到帖子详情页的方法
  //   navigateToPostDetail() {
  //     if (this.postId) {
  //       this.$router.push({ name: 'PostDetail', params: { postId: this.postId } });
  //     } else {
  //       console.error('无法跳转到详情页面，postId 未定义');
  //     }
  //   }
  // }
};
</script>

<style scoped>
.comment-btn {
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

.comment-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: rgba(102, 126, 234, 0.05);
}

.comment-btn .icon {
  font-size: 16px;
  line-height: 1;
}

.comment-btn .count {
  font-weight: var(--font-weight-semibold);
}
</style>
