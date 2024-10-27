<!-- 首页帖子流的展示组件 -->
 <!-- 需要从后端获取帖子列表，并展示在页面上，需要包含：帖子标题、帖子内容、发布时间、作者、点评论数。 -->

<template>
  <div class="post-card">
    <div class="post-content">
      <h2>{{ post.title }}</h2>
      <p>{{ post.body }}</p>
    </div>
    <!-- 点赞组件 -->
    <div class="post-buttons">
      <like-button :initialLikes="post.likes" />
      <!-- 评论按钮组件 -->
      <comment-button :initialCommentCount="post.commentCount" style="margin: auto;" @click="navigateToPostDetail" />
    </div>
  </div>
</template>

<script>
import LikeButton from './LikeButton.vue';
import CommentButton from './CommentButton.vue';
import { useRouter } from 'vue-router';

export default {
  components: {
    LikeButton,
    CommentButton
  },
  props: {
    post: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const router = useRouter();

    const navigateToPostDetail = () => {
      router.push({ name: 'PostDetail', params: { id: props.post.id } }); // 从 props 中获取 post.id
    };

    return {
      navigateToPostDetail
    };
  },
};
</script>

<style scoped>
/* 帖子组件的样式 */
.post-card {
  border: 1px solid #ddd;
  /* 边框样式 */
  padding: 15px;
  /* 内边距 */
  margin-bottom: 15px;
  /* 下边距 */
  border-radius: 8px;
  /* 圆角 */
  background-color: #f9f9f9;
  /* 背景颜色 */
  transition: box-shadow 0.3s;
  /* 添加阴影过渡效果 */
}

.post-card:hover {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  /* 悬停时的阴影效果 */
}

.post-content h2 {
  font-size: 1.5em;
  /* 标题字体大小 */
  margin: 0 0 10px;
  /* 标题与内容之间的下边距 */
}

.post-content p {
  font-size: 1em;
  /* 内容字体大小 */
  color: #333;
  /* 内容字体颜色 */
}

.post-buttons {
  display: flex;
  /* 按钮组采用flex布局 */
}
</style>