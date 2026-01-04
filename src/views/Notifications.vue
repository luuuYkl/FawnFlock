<template>
  <BaseLayout>
    <template v-slot:header>
      <div class="header-content"><h1>通知</h1><div style="width:60px"></div></div>
    </template>

    <div class="page-root">
      <div class="card">
        <div v-if="loading">加载中...</div>
        <ul v-else>
          <li v-for="n in notifications" :key="n.id">
            <div>{{ n.message }}</div>
            <div class="meta">{{ n.created_at }}</div>
          </li>
        </ul>
      </div>
    </div>
  </BaseLayout>
</template>

<script>
import BaseLayout from '@/components/BaseLayout.vue';
import { notificationAPI } from '@/services/api.service';

export default {
  name: 'NotificationsView',
  components: { BaseLayout },
  data() {
    return { notifications: [], loading: false };
  },
  created() {
    this.fetch();
  },
  methods: {
    async fetch() {
      this.loading = true;
      try {
        const userId = Number(localStorage.getItem('userId')) || null;
        this.notifications = await notificationAPI.getNotifications(userId);
      } catch (e) {
        console.error('获取通知失败', e);
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
