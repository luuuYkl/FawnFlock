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
        <div class="editor">
          <textarea
            v-model="content"
            :maxlength="maxLength"
            placeholder="说点什么...（最多 {{ maxLength }} 字）"
            @input="onContentInput"
          ></textarea>
          <div class="title-group">
            <input
              type="text"
              v-model="title"
              :maxlength="titleMax"
              placeholder="标题（必填，最多 {{ titleMax }} 字）"
              @input="onContentInput"
            />
            <div class="title-count">{{ title.length }}/{{ titleMax }}</div>
          </div>
          <div class="meta">
            <span :class="{'over': content.length > maxLength}">{{ content.length }}/{{ maxLength }}</span>
            <div class="meta-actions">
              <button class="btn" @click="saveDraft">保存草稿</button>
              <button class="btn" v-if="hasDraft" @click="clearDraft">清除草稿</button>
            </div>
          </div>

          <div class="upload">
            <label class="upload-label">上传图片（最多 4 张）</label>
            <input type="file" accept="image/*" multiple @change="onFilesChange" />
            <div class="previews">
              <div v-for="(p, idx) in previews" :key="idx" class="preview">
                <img :src="p" alt="preview" />
                <button class="remove" @click="removeImage(idx)">×</button>
              </div>
            </div>
          </div>

          <div class="actions">
            <button class="btn btn-secondary" @click="saveDraft">保存草稿</button>
            <button class="btn btn-primary" :disabled="submitting || !canSubmit" @click="submitPost">
              <span v-if="submitting">发布中...</span>
              <span v-else>发布</span>
            </button>
          </div>

          <div v-if="message" :class="['message', messageType]">{{ message }}</div>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>

<script>
import BaseLayout from '../components/BaseLayout.vue';
import { postAPI } from '@/services/api.service';

const DRAFT_KEY = 'create_post_draft_v1';

export default {
  name: 'CreatePost',
  components: { BaseLayout },
  data() {
    return {
      title: '',
      titleMax: 100,
      content: '',
      previews: [],
      files: [],
      maxLength: 1000,
      submitting: false,
      message: '',
      messageType: 'info'
    };
  },
  computed: {
    canSubmit() {
      return this.title.trim().length > 0 && this.title.length <= this.titleMax &&
             this.content.trim().length > 0 && this.content.length <= this.maxLength;
    },
    hasDraft() {
      return !!localStorage.getItem(DRAFT_KEY);
    }
  },
  created() {
    this.loadDraft();
  },
  methods: {
    goBack() {
      this.$router.push('/HomePage');
    },
    onContentInput() {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ title: this.title, content: this.content, previews: this.previews }));
    },
    saveDraft() {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ title: this.title, content: this.content, previews: this.previews }));
      this.message = '草稿已保存';
      this.messageType = 'success';
      setTimeout(() => (this.message = ''), 2000);
    },
    loadDraft() {
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        this.title = data.title || '';
        this.content = data.content || '';
        this.previews = data.previews || [];
      } catch (e) {
        console.warn('无法加载草稿', e);
      }
    },
    clearDraft() {
      localStorage.removeItem(DRAFT_KEY);
      this.message = '草稿已清除';
      this.messageType = 'info';
      setTimeout(() => (this.message = ''), 1500);
    },
    onFilesChange(e) {
      const chosen = Array.from(e.target.files || []);
      const allowed = 4 - this.files.length;
      const take = chosen.slice(0, allowed);
      take.forEach((f) => {
        if (!f.type.startsWith('image/')) return;
        this.files.push(f);
        const reader = new FileReader();
        reader.onload = (ev) => {
          this.previews.push(ev.target.result);
          localStorage.setItem(DRAFT_KEY, JSON.stringify({ title: this.title, content: this.content, previews: this.previews }));
        };
        reader.readAsDataURL(f);
      });
      e.target.value = '';
    },
    removeImage(idx) {
      this.previews.splice(idx, 1);
      this.files.splice(idx, 1);
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ title: this.title, content: this.content, previews: this.previews }));
    },
    async submitPost() {
      if (!this.canSubmit) return;
      this.submitting = true;
      this.message = '';
      try {
        const media_urls = this.previews.slice(0, 4);
        const userId = Number(localStorage.getItem('userId')) || 1;
        await postAPI.createPost(userId, this.title, this.content, media_urls);
        this.message = '发布成功';
        this.messageType = 'success';
        localStorage.removeItem(DRAFT_KEY);
        setTimeout(() => this.$router.push('/HomePage'), 800);
      } catch (err) {
        console.error('发布失败', err);
        this.message = err?.response?.data?.error || '发布失败，请稍后重试';
        this.messageType = 'error';
      } finally {
        this.submitting = false;
      }
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
.header-content h1 { font-size: 20px; font-weight: bold; color: #333; }
.back-button { background: none; border: none; color: #667eea; font-size: 16px; cursor: pointer; padding: 8px 12px; border-radius: 8px; transition: background 0.3s ease; }
.create-post { min-height: calc(100vh - 60px); background: linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%); padding: 40px 20px; display: flex; justify-content: center; align-items: flex-start; }
.form-container { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 6px 20px rgba(0,0,0,0.06); width: 100%; max-width: 820px; }
.editor textarea { width: 100%; min-height: 200px; padding: 12px; border-radius: 8px; border: 1px solid #e6e6e6; font-size: 14px; resize: vertical; }
.title-group { display:flex; align-items:center; gap:8px; margin:8px 0; }
.title-group input { flex:1; padding:10px; border:1px solid #e6e6e6; border-radius:8px; font-size:16px; }
.title-count { font-size:12px; color:#888; }
.meta { display:flex; align-items:center; justify-content:space-between; margin-top:8px; }
.meta .over { color: #ff4d4f; }
.previews { display:flex; gap:8px; margin-top:8px; flex-wrap:wrap; }
.preview { position:relative; width:100px; height:100px; border-radius:8px; overflow:hidden; border:1px solid #eee; }
.preview img { width:100%; height:100%; object-fit:cover; }
.preview .remove { position:absolute; top:4px; right:4px; background:rgba(0,0,0,0.6); color:#fff; border:none; border-radius:50%; width:22px; height:22px; cursor:pointer; }
.actions { display:flex; gap:12px; justify-content:flex-end; margin-top:12px; }
.message { margin-top:12px; padding:8px 12px; border-radius:6px; }
.message.success { background:#f6ffed; color:#389e0d; }
.message.error { background:#fff1f0; color:#cf1322; }
.message.info { background:#e6f7ff; color:#096dd9; }
.btn { padding:8px 12px; border-radius:6px; border:none; cursor:pointer; }
.btn-primary { background: linear-gradient(135deg,#667eea, #764ba2); color:#fff; }
.btn-secondary { background:#fafafa; border:1px solid #ddd; }
</style>
