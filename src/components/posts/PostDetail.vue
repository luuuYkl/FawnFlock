<!-- 从父组件继承posts数据并以帖子详细界面的形式呈现 -->
 <!-- 后端读取对应帖子的评论数据并以评论流方式呈现 -->

<template>
    <div class="post-detail">
      <!-- 上部分：原帖展示 -->
      <div class="original-post">
        <h2>{{ post.title }}</h2>
        <p>{{ post.body }}</p>
  
        <!-- 点赞按钮 -->
        <div class="post-buttons" style="display: flex;">
          <like-button :initialLikes="post.likes" :userId="userId" />
        </div>
      </div>
  
      <!-- 下部分：评论区展示 -->
      <div class="comments-section">
        <h3>评论</h3>
        <div class="comment-list">
          <!-- 渲染评论，使用 v-for 循环渲染评论列表 -->
          <post-card v-for="comment in comments" :key="comment.id" :post="comment" />
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import LikeButton from './LikeButton.vue';
  import PostCard from './PostCard.vue';
  import axios from 'axios';
  
  export default {
    components: {
      LikeButton,
      PostCard
    },
    data() {
      return {
        userId: 1,  // 假设当前用户的 ID 为 1
        post: {},  // 原帖数据
        comments: []  // 评论列表
      };
    },
    async mounted() {
      try {
        // 从路由获取帖子 ID
        const postId = this.$route.params.id;
        // 使用实际的后端接口 URL 来获取帖子数据
        const postResponse = await axios.get(`http://127.0.0.1:7878/posts/${postId}`);
        this.post = postResponse.data;
  
        // 获取评论列表（如果有的话）
        const commentsResponse = await axios.get(`http://127.0.0.1:7878/posts/${postId}/comments`);
        this.comments = commentsResponse.data;
      } catch (error) {
        console.error('获取帖子或评论失败:', error);
      }
    }
  };
  </script>
  
  <style scoped>
  /* 你可以根据需要添加样式 */
  </style>
  