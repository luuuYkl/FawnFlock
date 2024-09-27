<template>
  <BaseLayout>
    <template v-slot:header>
    <h1>首页</h1>
  </template> 
    <div class="home">
    <div class="post-list">
      <post-card v-for="post in posts" :key="post.id" :post="post" />
    </div>
  </div>
  </BaseLayout>
</template>

<script>
import PostCard from '../components/posts/PostCard.vue';
import BaseLayout from './BaseLayout.vue';

export default {
  name: 'HomePage',
  components: {
    PostCard,
    BaseLayout  
  },
  // 帖子流的实现
  data() {
    return {
      posts: [ // 使用静态数据模拟帖子内容
        {
          id: 1,
          title: '第一个帖子',
          body: '这是第一个帖子的内容。',
          likes: 5,
          commentCount: 3
        },
        {
          id: 2,
          title: '第二个帖子',
          body: '这是第二个帖子的内容。',
          likes: 10,
          commentCount: 2
        },
        {
          id: 3,
          title: '第三个帖子',
          body: '这是第三个帖子的内容。',
          likes: 8,
          commentCount: 1
        }
      ]
    };
  }
};
</script>

<style scoped>
/* 主页样式 */
.home {
  padding: 20px;
  /* 内边距 */
}

.post-list {
  display: flex;
  flex-direction: column;
  /* 垂直排列帖子 */
}
</style>