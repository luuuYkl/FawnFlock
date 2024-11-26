<!-- 从父组件继承对应postid并显示评论数量 -->
<!-- 根据postid实现跳转到PostDetial的功能 -->

<template>
  <div class="comment-button">
    <!-- 显示评论按钮，点击时触发跳转到帖子详情页面的方法 -->
    <button>Comment</button>
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
/* 评论按钮组件的样式 */
.comment-button {
  display: flex;
  /* 使用 flexbox 布局 */
  align-items: center;
  /* 垂直居中对齐 */
}

.comment-count {
  margin-left: 10px;
  /* 评论数与按钮之间的左边距 */
}
</style>
