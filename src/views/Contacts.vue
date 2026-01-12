<template>
  <div class="contacts-page">
    <!-- 顶部搜索栏 -->
    <div class="search-bar">
      <div class="search-container">
        <span class="search-icon">🔍</span>
        <input
          type="search"
          v-model="searchQuery"
          @input="handleSearch"
          @focus="searchFocused = true"
          @blur="searchFocused = false"
          placeholder="搜索联系人/群聊"
          class="search-input"
        />
        <button v-if="searchQuery" @click="clearSearch" class="clear-btn">✕</button>
        <button class="filter-btn" @click="toggleFilter" title="筛选">
          <span class="icon">⚙️</span>
        </button>
      </div>
    </div>

    <!-- 筛选面板 -->
    <transition name="slide-down">
      <div v-if="showFilterPanel" class="filter-panel">
        <div class="filter-options">
          <button
            v-for="option in filterOptions"
            :key="option.value"
            class="filter-option"
            :class="{ active: currentFilter === option.value }"
            @click="applyFilter(option.value)"
          >
            <span class="option-icon">{{ option.icon }}</span>
            <span class="option-label">{{ option.label }}</span>
          </button>
        </div>
      </div>
    </transition>

    <!-- 联系人列表 -->
    <div class="contacts-container" ref="contactsContainer">
      <!-- 加载中 -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <span>加载中...</span>
      </div>

      <!-- 空状态 -->
      <div v-else-if="filteredContacts.length === 0" class="empty-state">
        <div class="empty-icon">👥</div>
        <p v-if="searchQuery">未找到匹配的联系人</p>
        <p v-else>还没有联系人</p>
        <span class="empty-hint">{{ searchQuery ? '试试其他关键词' : '开始添加新朋友吧' }}</span>
      </div>

      <!-- 联系人分组列表 -->
      <div v-else class="contacts-list">
        <!-- 最近联系人（置顶） -->
        <div v-if="recentContacts.length > 0 && !searchQuery" class="contact-group">
          <div class="group-header">
            <span class="group-title">最近联系</span>
            <span class="group-count">{{ recentContacts.length }}</span>
          </div>
          <TransitionGroup name="contact" tag="div" class="contact-items">
            <div
              v-for="contact in recentContacts"
              :key="'recent-' + contact.id"
              class="contact-card"
              @click="openChat(contact)"
            >
              <div class="contact-avatar-wrapper">
                <img
                  :src="contact.avatar || defaultAvatar"
                  :alt="contact.name"
                  class="contact-avatar"
                  @error="handleImageError"
                />
                <span
                  v-if="contact.online"
                  class="online-indicator"
                  :class="{ online: contact.online }"
                ></span>
              </div>
              <div class="contact-info">
                <div class="contact-name">{{ contact.name }}</div>
                <div class="contact-status">
                  {{ contact.lastMessage || contact.status || '暂无消息' }}
                </div>
              </div>
              <div class="contact-meta">
                <span v-if="contact.unreadCount" class="unread-badge">{{ formatUnread(contact.unreadCount) }}</span>
                <span v-if="contact.lastTime" class="last-time">{{ formatTime(contact.lastTime) }}</span>
              </div>
            </div>
          </TransitionGroup>
        </div>

        <!-- 按字母分组 -->
        <div
          v-for="group in groupedContacts"
          :key="group.letter"
          class="contact-group"
        >
          <div class="group-header" :id="'group-' + group.letter">
            <span class="group-title">{{ group.letter }}</span>
            <span class="group-count">{{ group.contacts.length }}</span>
          </div>
          <TransitionGroup name="contact" tag="div" class="contact-items">
            <div
              v-for="contact in group.contacts"
              :key="contact.id"
              class="contact-card"
              @click="openChat(contact)"
            >
              <div class="contact-avatar-wrapper">
                <img
                  :src="contact.avatar || defaultAvatar"
                  :alt="contact.name"
                  class="contact-avatar"
                  @error="handleImageError"
                />
                <span
                  v-if="contact.online"
                  class="online-indicator"
                  :class="{ online: contact.online }"
                ></span>
              </div>
              <div class="contact-info">
                <div class="contact-name">{{ contact.name }}</div>
                <div class="contact-status">
                  {{ contact.lastMessage || contact.status || '暂无消息' }}
                </div>
              </div>
              <div class="contact-meta">
                <span v-if="contact.unreadCount" class="unread-badge">{{ formatUnread(contact.unreadCount) }}</span>
                <button class="more-btn" @click.stop="showContactMenu(contact)">
                  <span class="icon">›</span>
                </button>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>

      <!-- 字母索引（右侧快速导航） -->
      <div v-if="!searchQuery && groupedContacts.length > 0" class="letter-index">
        <button
          v-for="letter in availableLetters"
          :key="letter"
          class="letter-btn"
          @click="scrollToLetter(letter)"
        >
          {{ letter }}
        </button>
      </div>
    </div>

    <!-- 底部导航栏 -->
    <BottomNavigation
      :current="currentRoute"
      :message-badge="0"
      @navigate="handleNavigate"
    />
  </div>
</template>

<script>
import BottomNavigation from '@/components/BottomNavigation.vue';

export default {
  name: 'ContactsView',
  components: {
    BottomNavigation
  },
  data() {
    return {
      contacts: [],
      loading: false,
      searchQuery: '',
      searchFocused: false,
      showFilterPanel: false,
      currentFilter: 'all',
      
      filterOptions: [
        { value: 'all', label: '全部', icon: '👥' },
        { value: 'online', label: '在线', icon: '🟢' },
        { value: 'recent', label: '最近', icon: '🕐' },
        { value: 'favorites', label: '星标', icon: '⭐' }
      ],
      
      defaultAvatar: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23E5E7EB"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" font-size="40" fill="%236B7280"%3E👤%3C/text%3E%3C/svg%3E',
      
      currentRoute: 'Contacts'
    };
  },
  
  computed: {
    filteredContacts() {
      let result = [...this.contacts];
      
      // 搜索过滤
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(contact =>
          contact.name.toLowerCase().includes(query) ||
          (contact.status && contact.status.toLowerCase().includes(query))
        );
      }
      
      // 筛选过滤
      if (this.currentFilter === 'online') {
        result = result.filter(contact => contact.online);
      } else if (this.currentFilter === 'recent') {
        result = result.filter(contact => contact.lastTime);
      } else if (this.currentFilter === 'favorites') {
        result = result.filter(contact => contact.favorite);
      }
      
      return result;
    },
    
    recentContacts() {
      if (this.currentFilter !== 'all') return [];
      return this.filteredContacts
        .filter(contact => contact.lastTime)
        .sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime))
        .slice(0, 5);
    },
    
    groupedContacts() {
      const groups = {};
      const recentIds = new Set(this.recentContacts.map(c => c.id));
      
      this.filteredContacts.forEach(contact => {
        // 最近联系人已经单独显示，不重复
        if (recentIds.has(contact.id) && !this.searchQuery) return;
        
        const firstLetter = this.getFirstLetter(contact.name);
        if (!groups[firstLetter]) {
          groups[firstLetter] = [];
        }
        groups[firstLetter].push(contact);
      });
      
      // 排序并返回
      return Object.keys(groups)
        .sort()
        .map(letter => ({
          letter,
          contacts: groups[letter].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
        }));
    },
    
    availableLetters() {
      return this.groupedContacts.map(group => group.letter);
    }
  },
  
  created() {
    this.fetchContacts();
  },
  
  mounted() {
    this.updateCurrentRoute();
  },
  
  methods: {
    async fetchContacts() {
      this.loading = true;
      try {
        // 模拟联系人数据（实际应从API获取）
        const mockContacts = [
          {
            id: 1,
            name: '张三',
            avatar: '',
            online: true,
            status: '在线',
            lastMessage: '好的，明天见',
            lastTime: new Date().toISOString(),
            unreadCount: 2
          },
          {
            id: 2,
            name: '李四',
            avatar: '',
            online: false,
            status: '离开',
            lastMessage: '收到',
            lastTime: new Date(Date.now() - 3600000).toISOString(),
            unreadCount: 0
          },
          {
            id: 3,
            name: 'Alice',
            avatar: '',
            online: true,
            status: '在线',
            lastMessage: 'Hello!',
            lastTime: new Date(Date.now() - 7200000).toISOString(),
            unreadCount: 5
          },
          {
            id: 4,
            name: 'Bob',
            avatar: '',
            online: false,
            status: '',
            lastMessage: '',
            lastTime: '',
            unreadCount: 0
          },
          {
            id: 5,
            name: '王五',
            avatar: '',
            online: true,
            status: '忙碌',
            lastMessage: '',
            lastTime: '',
            unreadCount: 0,
            favorite: true
          }
        ];
        
        this.contacts = mockContacts;
      } catch (error) {
        console.error('获取联系人失败:', error);
      } finally {
        this.loading = false;
      }
    },
    
    handleSearch() {
      // 搜索防抖可以在这里添加
    },
    
    clearSearch() {
      this.searchQuery = '';
    },
    
    toggleFilter() {
      this.showFilterPanel = !this.showFilterPanel;
    },
    
    applyFilter(value) {
      this.currentFilter = value;
      this.showFilterPanel = false;
    },
    
    openChat(contact) {
      console.log('打开聊天:', contact);
      this.$router.push({ name: 'Messages', params: { contactId: contact.id } });
    },
    
    showContactMenu(contact) {
      console.log('显示菜单:', contact);
      alert('联系人菜单功能即将开放');
    },
    
    getFirstLetter(name) {
      const firstChar = name.charAt(0).toUpperCase();
      // 中文字符
      if (/[\u4e00-\u9fa5]/.test(firstChar)) {
        // 简单的拼音首字母映射（实际应使用完整的拼音库）
        const pinyinMap = {
          '张': 'Z', '李': 'L', '王': 'W', '刘': 'L', '陈': 'C',
          '杨': 'Y', '赵': 'Z', '黄': 'H', '周': 'Z', '吴': 'W'
        };
        return pinyinMap[firstChar] || '#';
      }
      // 英文字符
      if (/[A-Z]/.test(firstChar)) {
        return firstChar;
      }
      return '#';
    },
    
    scrollToLetter(letter) {
      const element = document.getElementById('group-' + letter);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    
    formatTime(timeString) {
      if (!timeString) return '';
      
      const now = new Date();
      const time = new Date(timeString);
      const diff = now - time;
      
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      
      if (minutes < 1) return '刚刚';
      if (minutes < 60) return `${minutes}分钟前`;
      if (hours < 24) return `${hours}小时前`;
      if (days < 7) return `${days}天前`;
      
      return time.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    },
    
    formatUnread(count) {
      if (count > 99) return '99+';
      return count;
    },
    
    handleImageError(e) {
      e.target.src = this.defaultAvatar;
    },
    
    handleNavigate(item) {
      console.log('导航到:', item.route);
    },
    
    updateCurrentRoute() {
      this.currentRoute = this.$route.name || 'Contacts';
    }
  },
  
  watch: {
    '$route.name'(newVal) {
      this.currentRoute = newVal || 'Contacts';
    }
  }
};
</script>

<style scoped>
/* ===== 主容器 ===== */
.contacts-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-top: 56px; /* 搜索栏高度 */
  padding-bottom: 56px; /* 底部导航栏高度 */
}

/* ===== 顶部搜索栏 ===== */
.search-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  z-index: 1000;
  padding: 8px 16px;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
}

.search-icon {
  font-size: 18px;
  color: #9ca3af;
}

.search-input {
  flex: 1;
  height: 100%;
  padding: 0 16px;
  border: none;
  border-radius: 20px;
  background: #f0f0f0;
  font-size: 15px;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  background: #e9ecef;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-input::placeholder {
  color: #9ca3af;
}

.clear-btn,
.filter-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #6b7280;
  transition: all 0.2s;
}

.clear-btn:hover,
.filter-btn:hover {
  background: #f3f4f6;
}

.clear-btn:active,
.filter-btn:active {
  transform: scale(0.95);
}

/* ===== 筛选面板 ===== */
.filter-panel {
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 16px;
  z-index: 999;
}

.filter-options {
  display: flex;
  gap: 8px;
  overflow-x: auto;
}

.filter-option {
  flex-shrink: 0;
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6b7280;
  transition: all 0.2s;
}

.filter-option:hover {
  background: #f9fafb;
}

.filter-option.active {
  background: #6366f1;
  color: #ffffff;
  border-color: #6366f1;
}

.option-icon {
  font-size: 16px;
}

.option-label {
  font-weight: 500;
}

/* ===== 联系人列表容器 ===== */
.contacts-container {
  min-height: calc(100vh - 112px);
  overflow-y: auto;
  position: relative;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
  color: #6b7280;
  font-size: 14px;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 16px;
  font-weight: 500;
  color: #374151;
  margin: 0 0 8px 0;
}

.empty-hint {
  font-size: 14px;
  color: #9ca3af;
}

/* ===== 联系人列表 ===== */
.contacts-list {
  padding: 0 0 16px 0;
}

/* 分组 */
.contact-group {
  margin-bottom: 16px;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 8px 16px;
  background: #f9fafb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.group-title {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
}

.group-count {
  font-size: 12px;
  color: #9ca3af;
}

/* 联系人卡片 */
.contact-items {
  display: flex;
  flex-direction: column;
}

.contact-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #ffffff;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: all 0.2s;
  animation: contactSlideIn 0.3s ease;
}

@keyframes contactSlideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.contact-card:hover {
  background: #f9fafb;
}

.contact-card:active {
  background: #f3f4f6;
  transform: scale(0.98);
}

/* 头像区域 */
.contact-avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.contact-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #d1d5db;
  border: 2px solid #ffffff;
}

.online-indicator.online {
  background: #10b981;
}

/* 联系人信息 */
.contact-info {
  flex: 1;
  min-width: 0; /* 防止文字溢出 */
}

.contact-name {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.contact-status {
  font-size: 13px;
  color: #9ca3af;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 元信息 */
.contact-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}

.unread-badge {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #ef4444;
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.last-time {
  font-size: 11px;
  color: #9ca3af;
}

.more-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #9ca3af;
  transition: all 0.2s;
}

.more-btn:hover {
  background: #f3f4f6;
}

/* ===== 字母索引 ===== */
.letter-index {
  position: fixed;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 100;
}

.letter-btn {
  width: 24px;
  height: 20px;
  border: none;
  background: transparent;
  color: #6366f1;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.letter-btn:hover {
  transform: scale(1.2);
}

.letter-btn:active {
  background: rgba(99, 102, 241, 0.1);
  border-radius: 50%;
}

/* ===== Spinner ===== */
.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(99, 102, 241, 0.2);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== 过渡动画 ===== */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.contact-enter-active,
.contact-leave-active {
  transition: all 0.3s ease;
}

.contact-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.contact-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* ===== 响应式设计 ===== */
@media (max-width: 480px) {
  .contact-avatar {
    width: 44px;
    height: 44px;
  }
  
  .contact-name {
    font-size: 15px;
  }
  
  .contact-status {
    font-size: 12px;
  }
}

@media (min-width: 768px) {
  .contacts-page {
    max-width: 640px;
    margin: 0 auto;
    border-left: 1px solid #e5e7eb;
    border-right: 1px solid #e5e7eb;
  }
}

/* 滚动条样式 */
.contacts-container::-webkit-scrollbar {
  width: 6px;
}

.contacts-container::-webkit-scrollbar-track {
  background: transparent;
}

.contacts-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.contacts-container::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
