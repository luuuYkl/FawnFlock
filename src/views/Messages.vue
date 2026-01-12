<template>
  <div class="chat-page">
    <!-- 顶部导航栏（固定） -->
    <div class="chat-header">
      <button class="back-btn" @click="goBack">
        <span class="icon">←</span>
      </button>
      <div class="contact-info">
        <img
          :src="currentContact.avatar || defaultAvatar"
          :alt="currentContact.name"
          class="contact-avatar"
          @error="handleImageError"
        />
        <div class="contact-details">
          <span class="contact-name">{{ currentContact.name || '选择联系人' }}</span>
          <span v-if="currentContact.online" class="online-status">在线</span>
        </div>
      </div>
      <button class="more-btn" @click="showMoreOptions">
        <span class="icon">⋯</span>
      </button>
    </div>

    <!-- 消息列表区域 -->
    <div class="messages-container" ref="messagesContainer" @scroll="handleScroll">
      <!-- 加载中 -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <span>加载中...</span>
      </div>

      <!-- 空状态 -->
      <div v-else-if="messages.length === 0" class="empty-state">
        <div class="empty-icon">💬</div>
        <p>还没有消息</p>
        <span class="empty-hint">发送一条消息开始聊天吧</span>
      </div>

      <!-- 消息列表 -->
      <div v-else class="messages-list">
        <template v-for="(item, index) in groupedMessages" :key="index">
          <!-- 日期分隔线 -->
          <div v-if="item.type === 'date'" class="date-divider">
            <span class="date-label">{{ item.date }}</span>
          </div>

          <!-- 消息气泡 -->
          <div
            v-else
            class="message-item"
            :class="{ 'mine': item.isMine, 'theirs': !item.isMine }"
          >
            <!-- 对方消息显示头像 -->
            <img
              v-if="!item.isMine"
              :src="item.avatar || defaultAvatar"
              :alt="item.from_username"
              class="message-avatar"
              @error="handleImageError"
            />

            <div class="message-content">
              <div class="message-bubble">
                <p class="message-text">{{ item.content }}</p>
              </div>
              <span
                v-if="showTimestamp(index)"
                class="message-time"
              >
                {{ formatTime(item.created_at) }}
              </span>
            </div>
          </div>
        </template>
      </div>

      <!-- 滚动到底部按钮 -->
      <transition name="fade">
        <button
          v-if="showScrollButton"
          class="scroll-to-bottom"
          @click="scrollToBottom"
        >
          ↓
        </button>
      </transition>
    </div>

    <!-- 输入框区域（固定底部） -->
    <div class="input-area">
      <button class="attach-btn" @click="showAttachMenu" title="附件">
        <span class="icon">+</span>
      </button>

      <div class="input-wrapper">
        <textarea
          v-model="inputText"
          ref="messageInput"
          class="message-input"
          placeholder="输入消息..."
          rows="1"
          @input="adjustTextareaHeight"
          @keydown.enter.exact.prevent="sendMessage"
          @focus="inputFocused = true"
          @blur="inputFocused = false"
        ></textarea>
      </div>

      <button
        class="send-btn"
        :class="{ active: canSend }"
        :disabled="!canSend"
        @click="sendMessage"
      >
        <span class="icon">→</span>
      </button>
    </div>

    <!-- 附件菜单（可选） -->
    <transition name="slide-up">
      <div v-if="showAttachPanel" class="attach-panel">
        <button class="attach-option" @click="selectImage">
          <span class="option-icon">🖼️</span>
          <span class="option-label">图片</span>
        </button>
        <button class="attach-option" @click="selectFile">
          <span class="option-icon">📎</span>
          <span class="option-label">文件</span>
        </button>
        <button class="attach-option" @click="selectVoice">
          <span class="option-icon">🎤</span>
          <span class="option-label">语音</span>
        </button>
        <button class="attach-option" @click="showAttachPanel = false">
          <span class="option-icon">✕</span>
          <span class="option-label">取消</span>
        </button>
      </div>
    </transition>
  </div>
</template>

<script>
import { messageAPI } from '@/services/api.service';

export default {
  name: 'MessagesViewOptimized',
  data() {
    return {
      messages: [],
      loading: false,
      inputText: '',
      inputFocused: false,
      showScrollButton: false,
      showAttachPanel: false,
      
      currentContact: {
        id: 1,
        name: '联系人',
        avatar: '',
        online: true
      },
      
      currentUserId: null,
      
      defaultAvatar: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23E5E7EB"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" font-size="40" fill="%236B7280"%3E👤%3C/text%3E%3C/svg%3E'
    };
  },
  
  computed: {
    canSend() {
      return this.inputText.trim().length > 0;
    },
    
    groupedMessages() {
      const grouped = [];
      let lastDate = null;
      
      this.messages.forEach((msg) => {
        const msgDate = this.getDateLabel(msg.created_at);
        
        // 添加日期分隔线
        if (msgDate !== lastDate) {
          grouped.push({
            type: 'date',
            date: msgDate
          });
          lastDate = msgDate;
        }
        
        // 添加消息
        grouped.push({
          ...msg,
          type: 'message',
          isMine: msg.from_user_id === this.currentUserId,
          avatar: msg.from_user_id === this.currentUserId ? null : this.currentContact.avatar
        });
      });
      
      return grouped;
    }
  },
  
  created() {
    this.currentUserId = Number(localStorage.getItem('userId')) || 1;
    this.fetchMessages();
  },
  
  mounted() {
    this.scrollToBottom(true);
  },
  
  methods: {
    async fetchMessages() {
      this.loading = true;
      try {
        const userId = this.currentUserId;
        const data = await messageAPI.getMessages(userId);
        this.messages = Array.isArray(data) ? data : [];
        
        // 模拟联系人信息（实际应从API获取）
        if (this.messages.length > 0) {
          const firstMsg = this.messages[0];
          const otherUserId = firstMsg.from_user_id === userId ? firstMsg.to_user_id : firstMsg.from_user_id;
          const otherUsername = firstMsg.from_user_id === userId ? firstMsg.to_username : firstMsg.from_username;
          
          this.currentContact = {
            id: otherUserId,
            name: otherUsername || '用户',
            avatar: '',
            online: Math.random() > 0.5
          };
        }
        
        this.$nextTick(() => {
          this.scrollToBottom(true);
        });
      } catch (error) {
        console.error('获取私信失败:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async sendMessage() {
      if (!this.canSend) return;
      
      const content = this.inputText.trim();
      this.inputText = '';
      
      // 立即显示发送的消息（乐观更新）
      const tempMessage = {
        id: Date.now(),
        from_user_id: this.currentUserId,
        to_user_id: this.currentContact.id,
        from_username: localStorage.getItem('username') || '我',
        to_username: this.currentContact.name,
        content: content,
        created_at: new Date().toISOString(),
        status: 'sending'
      };
      
      this.messages.push(tempMessage);
      
      this.$nextTick(() => {
        this.scrollToBottom();
        this.resetTextareaHeight();
      });
      
      try {
        // 调用API发送消息
        await messageAPI.sendMessage({
          from_user_id: this.currentUserId,
          to_user_id: this.currentContact.id,
          content: content
        });
        
        // 更新消息状态
        tempMessage.status = 'sent';
      } catch (error) {
        console.error('发送消息失败:', error);
        tempMessage.status = 'failed';
      }
    },
    
    handleScroll(e) {
      const container = e.target;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      
      // 距离底部超过100px时显示"滚动到底部"按钮
      this.showScrollButton = (scrollHeight - scrollTop - clientHeight) > 100;
    },
    
    scrollToBottom(instant = false) {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          if (instant) {
            container.scrollTop = container.scrollHeight;
          } else {
            container.scrollTo({
              top: container.scrollHeight,
              behavior: 'smooth'
            });
          }
        }
      });
    },
    
    adjustTextareaHeight() {
      const textarea = this.$refs.messageInput;
      if (textarea) {
        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, 120); // 最大高度120px
        textarea.style.height = newHeight + 'px';
      }
    },
    
    resetTextareaHeight() {
      const textarea = this.$refs.messageInput;
      if (textarea) {
        textarea.style.height = 'auto';
      }
    },
    
    formatTime(dateString) {
      const date = new Date(dateString);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    },
    
    getDateLabel(dateString) {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.toDateString() === today.toDateString()) {
        return '今天';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return '昨天';
      } else {
        return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
      }
    },
    
    showTimestamp(index) {
      // 每隔5条消息显示一次时间，或者是最后一条消息
      const messages = this.groupedMessages.filter(item => item.type === 'message');
      const msgIndex = messages.findIndex(msg => 
        this.groupedMessages[index].id === msg.id
      );
      
      if (msgIndex === messages.length - 1) return true;
      if (msgIndex % 5 === 0) return true;
      
      return false;
    },
    
    handleImageError(e) {
      e.target.src = this.defaultAvatar;
    },
    
    showAttachMenu() {
      this.showAttachPanel = !this.showAttachPanel;
    },
    
    selectImage() {
      alert('图片功能即将开放');
      this.showAttachPanel = false;
    },
    
    selectFile() {
      alert('文件功能即将开放');
      this.showAttachPanel = false;
    },
    
    selectVoice() {
      alert('语音功能即将开放');
      this.showAttachPanel = false;
    },
    
    showMoreOptions() {
      alert('更多选项功能即将开放');
    },
    
    goBack() {
      this.$router.back();
    }
  }
};
</script>

<style scoped>
/* ===== 主容器 ===== */
.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

/* ===== 顶部导航栏 ===== */
.chat-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 12px;
  z-index: 1000;
}

.back-btn,
.more-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #374151;
  transition: all 0.2s;
}

.back-btn:hover,
.more-btn:hover {
  background: #f3f4f6;
}

.back-btn:active,
.more-btn:active {
  transform: scale(0.95);
}

.contact-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.contact-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.contact-name {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.2;
}

.online-status {
  font-size: 11px;
  color: #10b981;
  line-height: 1;
}

/* ===== 消息列表区域 ===== */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 56px 0 80px 0; /* 为顶部导航和底部输入框留空间 */
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

/* 消息列表 */
.messages-list {
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 日期分隔线 */
.date-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px 0;
}

.date-label {
  display: inline-block;
  padding: 4px 12px;
  background: #e5e7eb;
  color: #6b7280;
  font-size: 12px;
  border-radius: 12px;
}

/* 消息项 */
.message-item {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
  animation: messageSlideIn 0.3s ease;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 对方消息 */
.message-item.theirs {
  flex-direction: row;
  justify-content: flex-start;
}

/* 自己消息 */
.message-item.mine {
  flex-direction: row-reverse;
  justify-content: flex-start;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 75%;
}

.message-item.mine .message-content {
  align-items: flex-end;
}

.message-item.theirs .message-content {
  align-items: flex-start;
}

/* 消息气泡 */
.message-bubble {
  padding: 10px 14px;
  border-radius: 16px;
  word-wrap: break-word;
  word-break: break-word;
}

/* 对方消息气泡 */
.message-item.theirs .message-bubble {
  background: #f0f0f0;
  color: #0f172a;
  border-bottom-left-radius: 4px;
}

/* 自己消息气泡 */
.message-item.mine .message-bubble {
  background: #6366f1;
  color: #ffffff;
  border-bottom-right-radius: 4px;
}

.message-text {
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.message-time {
  font-size: 11px;
  color: #9ca3af;
  padding: 0 4px;
}

/* 滚动到底部按钮 */
.scroll-to-bottom {
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 40px;
  height: 40px;
  border: none;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  color: #6366f1;
  transition: all 0.2s;
  z-index: 100;
}

.scroll-to-bottom:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.scroll-to-bottom:active {
  transform: scale(0.95);
}

/* ===== 输入框区域 ===== */
.input-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  padding: 8px 12px;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  z-index: 1000;
}

.attach-btn,
.send-btn {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.attach-btn {
  background: #f3f4f6;
  color: #6b7280;
}

.attach-btn:hover {
  background: #e5e7eb;
}

.send-btn {
  background: #e5e7eb;
  color: #9ca3af;
}

.send-btn.active {
  background: #6366f1;
  color: #ffffff;
}

.send-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.send-btn.active:hover {
  background: #4f46e5;
}

.send-btn.active:active {
  transform: scale(0.95);
}

.input-wrapper {
  flex: 1;
  background: #f9fafb;
  border-radius: 20px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  min-height: 40px;
  max-height: 120px;
}

.message-input {
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  font-size: 15px;
  color: #0f172a;
  resize: none;
  line-height: 1.5;
  padding: 8px 0;
  max-height: 120px;
  overflow-y: auto;
  font-family: inherit;
}

.message-input::placeholder {
  color: #9ca3af;
}

/* ===== 附件面板 ===== */
.attach-panel {
  position: fixed;
  bottom: 64px;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  z-index: 999;
}

.attach-option {
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.2s;
}

.attach-option:hover {
  background: #f9fafb;
}

.attach-option:active {
  transform: scale(0.95);
}

.option-icon {
  font-size: 32px;
}

.option-label {
  font-size: 12px;
  color: #6b7280;
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
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
}

.slide-up-leave-to {
  transform: translateY(100%);
}

/* ===== 响应式设计 ===== */
@media (max-width: 480px) {
  .message-content {
    max-width: 80%;
  }
  
  .attach-panel {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 768px) {
  .chat-page {
    max-width: 640px;
    margin: 0 auto;
    border-left: 1px solid #e5e7eb;
    border-right: 1px solid #e5e7eb;
  }
}

/* 滚动条样式 */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
