<template>
  <nav class="bottom-navigation">
    <button
      v-for="item in allNavItems"
      :key="item.name"
      class="nav-item"
      :class="{ active: isActive(item.route), 'nav-item-create': item.isCreate }"
      @click="navigateTo(item)"
    >
      <div class="nav-content">
        <span class="nav-icon" :class="item.iconClass">{{ item.icon }}</span>
        <span v-if="item.badge" class="nav-badge">{{ formatBadge(item.badge) }}</span>
      </div>
      <span class="nav-label">{{ item.label }}</span>
    </button>
  </nav>
</template>

<script>
export default {
  name: 'BottomNavigation',
  props: {
    current: {
      type: String,
      default: ''
    },
    messageBadge: {
      type: Number,
      default: 0
    },
    notificationBadge: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      navItems: [
        {
          name: 'home',
          label: '首页',
          icon: '🏠',
          route: 'HomePage',
          iconClass: 'icon-home'
        },
        {
          name: 'discover',
          label: '发现',
          icon: '🔍',
          route: 'Search',
          iconClass: 'icon-discover'
        },
        {
          name: 'create',
          label: '发布',
          icon: '✚',
          route: 'CreatePost',
          iconClass: 'icon-create',
          isCreate: true
        },
        {
          name: 'contacts',
          label: '联系人',
          icon: '👥',
          route: 'Contacts',
          iconClass: 'icon-contacts'
        },
        {
          name: 'profile',
          label: '我的',
          icon: '👤',
          route: 'UserProfile',
          iconClass: 'icon-profile'
        }
      ]
    };
  },
  computed: {
    currentRoute() {
      return this.current || this.$route.name || '';
    },
    allNavItems() {
      return this.navItems;
    }
  },

  methods: {
    isActive(routeName) {
      return this.currentRoute === routeName;
    },
    
    navigateTo(item) {
      if (this.currentRoute !== item.route) {
        this.$router.push({ name: item.route }).catch(err => {
          if (err.name !== 'NavigationDuplicated') {
            console.error('Navigation error:', err);
          }
        });
      }
      this.$emit('navigate', item);
    },
    
    formatBadge(count) {
      if (!count || count <= 0) return '';
      if (count > 99) return '99+';
      return count.toString();
    }
  }
};
</script>

<style scoped>
/* ===== 底部导航栏主容器 ===== */
.bottom-navigation {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 56px;
  background: #ffffff;
  box-shadow: 0 -1px 6px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 4px;
  z-index: 1000;
}

/* ===== 导航项 ===== */
.nav-item {
  flex: 1;
  height: 100%;
  max-width: 90px;
  border: none;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.nav-item:active {
  transform: scale(0.92);
}

/* ===== 导航内容包装 ===== */
.nav-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}

/* ===== 图标样式 ===== */
.nav-icon {
  font-size: 24px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  filter: grayscale(1);
  opacity: 0.6;
}

.nav-item.active .nav-icon {
  filter: grayscale(0);
  opacity: 1;
  transform: scale(1.1);
}

.nav-item:not(.active):hover .nav-icon {
  opacity: 0.8;
  transform: scale(1.05);
}

/* ===== 文字标签 ===== */
.nav-label {
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
  color: #a0a0a0;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.nav-item.active .nav-label {
  color: #6366f1;
  font-weight: 600;
}

/* ===== 徽章（未读消息数） ===== */
.nav-badge {
  position: absolute;
  top: -2px;
  right: -6px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: #ef4444;
  color: #ffffff;
  font-size: 10px;
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
  animation: badgePulse 2s ease-in-out infinite;
}

@keyframes badgePulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* ===== 发布按钮特殊样式 ===== */
.nav-item-create .nav-content {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item-create:hover .nav-content {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.nav-item-create:active .nav-content {
  transform: scale(0.95);
}

.nav-item-create .nav-icon {
  font-size: 22px;
  font-weight: 300;
  color: #ffffff;
  filter: none;
  opacity: 1;
}

.nav-item-create .nav-label {
  color: #6366f1;
  font-weight: 600;
}

.nav-item-create.active .nav-label {
  color: #6366f1;
}

.nav-item-create.active .nav-content {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
}

/* ===== 选中状态指示器（可选） ===== */
.nav-item.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 3px;
  background: #6366f1;
  border-radius: 0 0 3px 3px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-3px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.nav-item-create::before {
  display: none;
}

/* ===== 响应式设计 ===== */
@media (max-width: 380px) {
  .bottom-navigation {
    height: 52px;
  }
  
  .nav-label {
    font-size: 8px;
  }
  
  .nav-icon {
    font-size: 20px;
  }
  
  .nav-item {
    max-width: 60px;
  }
  
  .nav-item-create .nav-content {
    width: 34px;
    height: 34px;
  }
  
  .nav-item-create .nav-icon {
    font-size: 18px;
  }
}

@media (min-width: 768px) {
  .bottom-navigation {
    max-width: 640px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 16px 16px 0 0;
  }
}

/* ===== 暗色模式适配 ===== */
@media (prefers-color-scheme: dark) {
  .bottom-navigation {
    background: #1f2937;
    box-shadow: 0 -1px 6px rgba(0, 0, 0, 0.3);
  }
  
  .nav-label {
    color: #9ca3af;
  }
  
  .nav-item.active .nav-label {
    color: #818cf8;
  }
  
  .nav-item.active::before {
    background: #818cf8;
  }
  
  .create-button {
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.6);
  }
}

/* ===== 占位符（隐藏） ===== */
.nav-item[data-placeholder] {
  visibility: hidden;
  pointer-events: none;
}
</style>
