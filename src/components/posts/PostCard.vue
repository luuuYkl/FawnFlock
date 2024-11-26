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
      <LikeButton style="margin-right:1%" :postId="post.post_id" :userId="post.user_id" />
      <CommentButton :postId="post.post_id" :initialCommentCount="post.comment_count" @click="navigateToPostDetail" />
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

  mounted() {
    // 检查 post 对象是否存在
    if (!this.post) {
      console.error('PostCard: 接收到的 post 对象为空。');
      return;
    }

    // 逐项检查每个必需字段是否存在并提供详细报错
    if (!this.post.post_id) {
      console.error('PostCard: 缺少 post_id 属性。');
    }
    if (!this.post.title) {
      console.error('PostCard: 缺少 title 属性。');
    }
    if (!this.post.content) {
      console.error('PostCard: 缺少 content 属性。');
    }
    if (!this.post.user_id) {
      console.error('PostCard: 缺少 user_id 属性。');
    }
    if (!this.post.created_at) {
      console.error('PostCard: 缺少 created_at 属性。');
    }
    if (typeof this.post.like_count === 'undefined') {
      console.error('PostCard: 缺少 like_count 属性或其值未定义。');
    }
    if (typeof this.post.comment_count === 'undefined') {
      console.error('PostCard: 缺少 comment_count 属性或其值未定义。');
    }
  },
  methods: {
    // 格式化时间显示
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },
    navigateToPostDetail() {
      try {
        console.log('postId:', this.post.post_id);
        // 检查 postId 是否存在
        if (this.post.post_id) {
            
          // 跳转到 PostDetail 页面
          this.$router.push({ name: 'PostDetail', params: { postId: this.post.post_id } })
            .then(() => {
              console.log(`成功跳转到 PostDetail 页面，postId: ${this.post.post_id}`);
            })
            .catch((error) => {
              console.error('路由跳转失败:', error);
            });
        } else {
          console.error('无法跳转到详情页面，postId 未定义或无效');
        }
      } catch (error) {
        console.error('跳转到帖子详情页时发生异常:', error);
      }
    }
  },

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
