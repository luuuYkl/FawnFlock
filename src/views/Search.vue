<template>
  <BaseLayout>
    <template v-slot:header>
      <div class="header-content"><h1>搜索</h1><div style="width:60px"></div></div>
    </template>

    <div class="page-root">
      <div class="card">
        <input v-model="query" @keyup.enter="doSearch" placeholder="搜索帖子、用户、话题..." class="search-input" />
        <div style="margin-top:12px">
          <button class="btn" @click="doSearch">搜索</button>
        </div>
        <div v-if="loading">搜索中...</div>
        <ul v-else>
          <li v-for="r in results" :key="r.id">{{ r.title || r.username || r.name }}</li>
        </ul>
      </div>
    </div>
  </BaseLayout>
  
  <BottomNavigation
    current="Search"
    :message-badge="0"
    @navigate="handleNavigate"
  />
</template>

<script>
import BaseLayout from '@/components/BaseLayout.vue';
import BottomNavigation from '@/components/BottomNavigation.vue';
import { /* postAPI, */ } from '@/services/api.service';
import http from '@/utils/http';
import { API_ENDPOINTS } from '@/config/api.config';

export default {
  name: 'SearchView',
  components: { BaseLayout, BottomNavigation },
  data() {
    return { query: '', results: [], loading: false };
  },
  methods: {
    async doSearch() {
      if (!this.query) return;
      this.loading = true;
      try {
        const res = await http.get(API_ENDPOINTS.SEARCH, { params: { q: this.query } });
        this.results = res;
      } catch (e) {
        console.error('搜索失败', e);
      } finally {
        this.loading = false;
      }
    },
    handleNavigate(item) {
      console.log('导航到:', item.route);
    }
  }
};
</script>

<style scoped>
.page-root { max-width:900px; margin:20px auto; }
.search-input { width:100%; padding:8px 10px; border-radius:8px; border:1px solid #eee; }
</style>
