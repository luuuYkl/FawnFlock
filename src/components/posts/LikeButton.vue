<template>
    <!-- 点赞按钮组件的外层容器 -->
    <div class="like-button">
      <!-- 按钮，点击时触发 likePost 方法 -->
      <button @click="likePost">
        Like
      </button>
      
      <!-- 显示当前点赞数，格式为 'X Likes' -->
      <span>{{ likeCount }} </span>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      initialLikes: {
        type: Number,
        default: 0 // 默认值为 0
      }
    },
    
    data() {
      return {
        // 初始化点赞数为传入的初始点赞数
        likeCount: this.initialLikes
      };
    },
    
    methods: {
      // 处理点赞功能的方法
      likePost() {
        // 增加点赞数
        this.likeCount += 1;
        
        // 这里是调用后端 API，将新的点赞数发送给后端
        // 假设你有一个 API 函数 `sendLikesToBackend` 来处理这个请求
        this.sendLikesToBackend(this.likeCount);
      },
  
      // 模拟发送点赞数到后端的函数
      async sendLikesToBackend(likes) {
        try {
          await fetch('https://your-api-endpoint.com/like', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ likes }) // 发送点赞数到后端
          });
        } catch (error) {
          console.error('Error sending likes to backend:', error);
        }
      }
    }
  };
  </script>
  
  <style scoped>
  /* 点赞按钮组件的样式 */
  .like-button {
    display: flex; /* 使用 flexbox 布局 */
    align-items: center; /* 垂直居中对齐 */
  }
  button {
    margin-right: 10px; /* 按钮与点赞数之间的右边距 */
  }
  </style>
  