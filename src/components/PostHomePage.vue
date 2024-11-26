<template>
  <BaseLayout>
    <template v-slot:header>
      <h1>首页</h1>
    </template>

    <div class="home">
      <div v-if="error" class="error-message">
        <p>获取帖子数据失败，请稍后再试。</p>
      </div>

      <div v-else class="post-list">
        <PostCard v-for="post in posts" :key="post.id" :post="post" />
      </div>
    </div>
  </BaseLayout>
</template>

<script>
import axios from 'axios';
import PostCard from '../components/posts/PostCard.vue';
import BaseLayout from './BaseLayout.vue';

export default {
  name: 'HomePage',
  components: {
    PostCard,
    BaseLayout
  },
  data() {
    return {
      posts: [],    // 初始化为空数组
      error: false  // 错误状态，默认没有错误
    };
  },
  created() {
    this.fetchPosts(); // 组件创建时获取帖子数据
  },
  methods: {
    async fetchPosts() {
      try {
        // 从后端 API 获取帖子列表
        const response = await axios.get('http://127.0.0.1:7878/posts');

        // 检查返回的数据是否有效
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.posts = response.data; // 将返回的数据赋值给 posts
        } else {
          throw new Error('返回的数据为空或格式不正确');
        }
      } catch (error) {
        console.error("PostHomePage获取帖子数据失败:", error);
        this.error = true; // 出现错误时设置error为true
      }
    }
  }
};
</script>

<style scoped>
/* 主页样式 */
.home {
  padding: 20px;
}

.post-list {
  display: flex;
  flex-direction: column;
}

.error-message {
  color: red;
  font-weight: bold;
}
</style>
