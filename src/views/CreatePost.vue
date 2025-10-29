<template>
  <BaseLayout>
    <template v-slot:header>
      <div class="header-content">
        <button @click="goBack" class="back-button">← 返回</button>
        <h1>发布帖子</h1>
        <div style="width: 60px;"></div>
      </div>
    </template>

    <div class="create-post">
      <div class="form-container">
        <h2>📝 发帖功能开发中...</h2>
        <p>这个页面即将上线，敬请期待！</p>
        <button @click="goBack" class="go-back-button">
          返回首页
        </button>
      </div>
    </div>
  </BaseLayout>
</template>

<script>
import BaseLayout from '../components/BaseLayout.vue';

export default {
  name: 'CreatePost',
  components: {
    BaseLayout
  },
  methods: {
    goBack() {
      this.$router.push('/HomePage');
    }
  }
};
</script>

<style scoped>
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 20px;
}

.header-content h1 {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.back-button {
  background: none;
  border: none;
  color: #667eea;
  font-size: 16px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background 0.3s ease;
}

.back-button:hover {
  background: rgba(102, 126, 234, 0.1);
}

.create-post {
  min-height: calc(100vh - 60px);
  background: linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%);
  padding: 40px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.form-container {
  background: white;
  border-radius: 20px;
  padding: 60px 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.form-container h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 15px;
}

.form-container p {
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
}

.go-back-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.go-back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}
</style>
