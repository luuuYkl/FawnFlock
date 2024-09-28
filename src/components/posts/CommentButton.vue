<template>
  <div class="comment-button">
    <!-- 显示评论按钮，点击时触发添加评论的方法 -->
    <button @click="addComment">Comment</button>
    <!-- 显示评论数，超过999时显示999+ -->
    <span class="comment-count">{{ displayCommentCount }}</span>
  </div>
</template>

<script>
export default {
  props: {
    initialCommentCount: {
      type: Number,
      default: 0 // 默认值为 0
    }
  },

  data() {
    return {
      // 初始化评论数为传入的初始评论数
      commentCount: this.initialCommentCount
    };
  },

  computed: {
    // 计算属性，根据评论数返回合适的显示格式
    displayCommentCount() {
      return this.commentCount > 999 ? '999+' : this.commentCount;
    }
  },

  methods: {
    // 添加评论的处理方法
    addComment() {
      // 这里可以发送请求到后端，添加评论
      // 假设成功后，增加评论数
      this.commentCount += 1;

      // 发送 POST 请求到后端示例
      /*
      axios.post('/api/comments', { postId: this.postId })
        .then(response => {
          // 成功处理
          this.commentCount += 1; // 更新评论数
        })
        .catch(error => {
          console.error('添加评论失败:', error);
        });
      */
    }
  }
};
</script>

<style scoped>
/* 评论按钮组件的样式 */
.comment-button {
  display: flex; /* 使用 flexbox 布局 */
  align-items: center; /* 垂直居中对齐 */
}

.comment-count {
  margin-left: 10px; /* 评论数与按钮之间的左边距 */
}
</style>
