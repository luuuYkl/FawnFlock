<template>
  <BaseLayout>
    <template v-slot:header>
      <h1>首页</h1>
    </template>
    
    <div class="home">
      <div class="post-list">
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
      posts: [] // 初始化为空数组
    };
  },
  created() {
    this.fetchPosts(); // 组件创建时获取帖子数据
  },
  methods: {
    async fetchPosts() {
      try {
        // 从后端 API 获取帖子列表
        const response = await axios.get('/posts');
        this.posts = response.data; // 将返回的数据赋值给 posts
      } catch (error) {
        console.error("PostHomePage获取帖子数据失败:", error);
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
</style>
