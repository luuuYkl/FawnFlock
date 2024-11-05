<template>
  <div class="post-card">
    <div class="post-content">
      <h2>{{ post.title }}</h2>
      <p>{{ post.content }}</p>
      <div class="post-meta">
        <span>作者: {{ post.author }}</span>
        <span>发布时间: {{ formatDate(post.created_at) }}</span>
      </div>
    </div>
    <!-- 点赞和评论按钮 -->
    <div class="post-buttons">
      <LikeButton :postId="post.post_id" :initialLikes="post.like_count" />
      <CommentButton :postId="post.post_id" :initialCommentCount="post.comment_count" />
    </div>
  </div>
</template>

<script>
import LikeButton from './LikeButton.vue';
import CommentButton from './CommentButton.vue';

export default {
  props: {
    post: {
      type: Object,
      required: true
    }
  },
  components: {
    LikeButton,
    CommentButton
  },
  methods: {
    // 格式化时间显示
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
  }
};
</script>

<style scoped>
.post-card {
  border: 1px solid #ddd;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 8px;
  background-color: #f9f9f9;
  transition: box-shadow 0.3s;
}

.post-card:hover {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.post-content h2 {
  font-size: 1.5em;
  margin: 0 0 10px;
}

.post-content p {
  font-size: 1em;
  color: #333;
}

.post-meta {
  font-size: 0.9em;
  color: #777;
}

.post-buttons {
  display: flex;
}
</style>
