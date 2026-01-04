<template>
  <BaseLayout>
    <template v-slot:header>
      <div class="header-content"><h1>私信</h1><div style="width:60px"></div></div>
    </template>

    <div class="page-root">
      <div class="card">
        <div v-if="loading">加载中...</div>
        <ul v-else>
          <li v-for="m in messages" :key="m.id">
            <div><strong>{{ m.from_username }}</strong> → {{ m.to_username }}</div>
            <div>{{ m.content }}</div>
            <div class="meta">{{ m.created_at }}</div>
          </li>
        </ul>
      </div>
    </div>
  </BaseLayout>
</template>

<script>
import BaseLayout from '@/components/BaseLayout.vue';
import { messageAPI } from '@/services/api.service';

export default {
  name: 'MessagesView',
  components: { BaseLayout },
  data() {
    return { messages: [], loading: false };
  },
  created() {
    this.fetch();
  },
  methods: {
    async fetch() {
      this.loading = true;
      try {
        const userId = Number(localStorage.getItem('userId')) || null;
        this.messages = await messageAPI.getMessages(userId);
      } catch (e) {
        console.error('获取私信失败', e);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.page-root { max-width:900px; margin:20px auto; }
.meta{font-size:12px;color:#999}
</style>
