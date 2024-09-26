<template>
    <div class="comment-button">
      <!-- 显示评论按钮，点击时触发跳转 -->
      <button @click="navigateToComments">comments</button>
      <!-- 显示评论数，超过999时显示999+ -->
      <span class="comment-count">{{ displayCommentCount }}</span>
    </div>
  </template>
  
  <script>
  import { useRouter } from 'vue-router'; // 引入 Vue Router
  
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
      // 点击评论按钮时跳转到评论区
      navigateToComments() {
        const router = useRouter(); // 获取路由实例
        router.push({ name: 'CommentSection' }); // 跳转到评论区路由
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
  