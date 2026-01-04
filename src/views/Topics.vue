<template>
  <BaseLayout>
    <template v-slot:header>
      <div class="header-content"><h1>话题</h1><div style="width:60px"></div></div>
    </template>

    <div class="page-root">
      <div class="card">
        <div v-if="loading">加载中...</div>
        <ul v-else>
          <li v-for="t in topics" :key="t.id">
            <div class="topic-name">#{{ t.name }}</div>
            <div class="meta">{{ t.description || '' }}</div>
          </li>
        </ul>
      </div>
    </div>
  </BaseLayout>
</template>

<script>
import BaseLayout from '@/components/BaseLayout.vue';
import { topicAPI } from '@/services/api.service';

export default {
  name: 'TopicsView',
  components: { BaseLayout },
  data() {
    return { topics: [], loading: false };
  },
  created() {
    this.fetch();
  },
  methods: {
    async fetch() {
      this.loading = true;
      try {
        this.topics = await topicAPI.getTopics();
      } catch (e) {
        console.error('获取话题失败', e);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.page-root { max-width:900px; margin:20px auto; }
.topic-name{font-weight:600}
.meta{font-size:12px;color:#999}
</style>
