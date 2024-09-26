<template>
    <!-- 评论区域的外层容器1 -->
    <div class="comment-section">
      
      <!-- 评论列表的容器 -->
      <div class="comment-list">
        <!-- 使用 v-for 指令遍历 comments 数组，动态生成每个评论 -->
        <div v-for="(comment, index) in comments" :key="index" class="comment">
          <!-- 显示评论的用户和内容，使用插值绑定 -->
          <p><strong>{{ comment.user }}</strong>: {{ comment.text }}</p>
        </div>
      </div>
  
      <!-- 评论输入区域 -->
      <div class="comment-input">
        <!-- 输入框，双向绑定 newComment 变量，按下 Enter 键时触发 addComment 方法 -->
        <input v-model="newComment" placeholder="Add a comment..." @keyup.enter="addComment" />
        
        <!-- 提交按钮，点击时触发 addComment 方法 -->
        <button @click="addComment">Submit</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    // 组件的 props 属性，接收初始评论数组
    name:'CommentSection',
    props: {
      initialComments: {
        type: Array, // 类型为 Array
        default: () => [] // 默认值为一个空数组
      }
    },
    
    // 组件的数据属性
    data() {
      return {
        // 初始化评论数组为传入的初始评论
        comments: this.initialComments,
        // 用于存储新评论的文本
        newComment: ''
      };
    },
    
    methods: {
      // 添加新评论的方法
      async addComment() {
        // 检查 newComment 是否为空（去除前后空格）
        if (this.newComment.trim()) {
          // 创建新的评论对象，假设当前用户为 'CurrentUser'
          const comment = { user: 'CurrentUser', text: this.newComment };
          
          // 将新评论添加到 comments 数组中
          this.comments.push(comment);
          
          // 清空输入框
          this.newComment = '';
          
          // 调用方法将新评论发送到后端
          await this.sendCommentToBackend(comment);
          
          // 发出 'comment-added' 事件，通知父组件有新的评论
          this.$emit('comment-added', comment);
        }
      },
  
      // 模拟发送评论到后端的函数
      async sendCommentToBackend(comment) {
        try {
          await fetch('https://your-api-endpoint.com/comments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(comment) // 发送评论内容到后端
          });
        } catch (error) {
          console.error('Error sending comment to backend:', error);
        }
      }
    }
  };
  </script>
  
  <style scoped>
  /* 评论区域的样式 */
  .comment-section {
    margin-top: 10px; /* 评论区域的顶部间距 */
  }
  .comment {
    margin-bottom: 5px; /* 每条评论之间的下间距 */
  }
  .comment-input {
    display: flex; /* 使用 flexbox 布局 */
  }
  input {
    flex: 1; /* 输入框占据剩余空间 */
    margin-right: 5px; /* 输入框与按钮之间的右边距 */
  }
  </style>
  