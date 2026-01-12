# 帖子详情页面优化文档

## 功能概述

完全重新设计了帖子详情页面 (`PostDetailOptimized.vue`)，采用**纵向信息流 + 单一阅读主轴**的设计理念，核心创新是"用 TA 的声音朗读"的朗读区，将语音变成第二种阅读方式。

## 页面结构

```
┌──────── 顶部导航栏（固定） ────────┐
│ ← 详情 🔗                           │
└──────────────────────────────────┘

┌──────── 顶部作者区 ─────────────────┐
│ [头像]  昵称      · 2 小时前        │
│         @username                  │
└──────────────────────────────────┘

┌──────── 帖子内容区 ─────────────────┐
│ 标题（可选）                       │
│ 正文正文正文正文正文…             │
│ （支持多段，段落间距 12px）       │
│                                    │
│ [媒体库 - 图片网格]                │
└──────────────────────────────────┘

┌──────── 朗读控制区（核心亮点） ────┐
│ ▶ 用 TA 的声音朗读                 │
│  ▓▓▓▓░░░░░ 00:23 / 01:12           │
│  正在朗读                           │
└──────────────────────────────────┘

┌──────── 帖子互动区 ─────────────────┐
│ ❤️ 32   💬 8   ⭐ 收藏            │
└──────────────────────────────────┘

┌──────── 评论区 ─────────────────────┐
│ 发表评论                           │
│ [评论输入框]                       │
│ 全部评论 (N)                       │
│ [评论列表]                         │
└──────────────────────────────────┘
```

## 关键设计点

### 1. 视觉层级（极其重要）

```
权重排序：
1️⃣ 正文内容（最高）      - 15-16px，行高 1.7
2️⃣ 朗读区（核心亮点）    - 独立卡片，渐变背景
3️⃣ 作者信息（信任感）    - 44px 头像，15px 昵称
4️⃣ 互动按钮（弱化）      - 13px 灰色按钮
5️⃣ 评论区（标准）        - 次要内容
```

### 2. 顶部作者区

#### 设计规范
- **头像**：44px，圆形，渐变背景（#6366f1 → #8b5cf6）
- **昵称**：15px 加粗，#0f172a
- **@username**：13px，灰色（#64748b）
- **时间**：12px 灰色（#94a3b8），相对时间（"2小时前"）

#### 交互
- 点击头像→导航到用户主页
- 悬停头像→缩放 1.05 倍

```vue
<div class="author-header">
  <div class="avatar" @click="navigateToUserProfile">
    {{ getInitial(post.author) }}
  </div>
  <div class="author-info">
    <h2 class="author-name">{{ post.author || '匿名用户' }}</h2>
    <span class="author-handle">@{{ getUsername(post.author) }}</span>
  </div>
  <span class="post-time">{{ formatTime(post.created_at) }}</span>
</div>
```

### 3. 帖子内容区（纯粹阅读）

#### 排版规范
- **字号**：15px（移动端），16px（桌面）
- **行高**：1.7（优化阅读体验）
- **段落间距**：12px
- **行距**：紧凑，避免过松散
- **字色**：#1e293b

#### 段落解析
```javascript
parseParagraphs(content) {
  if (!content) return [];
  // 按双换行符分割（\n\n）
  return content.split('\n\n').filter(p => p.trim());
}
```

#### 标题（可选）
- **字号**：20px 加粗
- **颜色**：#0f172a
- **间距**：下方 16px
- 支持为空

### 4. 朗读控制区（**核心差异化设计**）

这是整个项目最值钱的设计点！

#### 卡片样式
```css
background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05));
border: 1px solid rgba(99, 102, 241, 0.1);
border-radius: 12px;
padding: 16px;
```

- 浅紫色渐变背景（5% 透明）
- 细边框，增强视觉边界
- 紧凑内边距，不抢戏

#### 朗读文案（非常重要）

✅ **推荐文案**：
- "用 TA 的声音朗读" ← **首选**，强调人+声音+内容的关系
- "聆听作者原声"

❌ **避免文案**：
- "播放音频" ← 过于技术性
- "语音朗读" ← 缺乏人味

#### 播放按钮
- **尺寸**：40px 圆形
- **渐变**：#6366f1 → #8b5cf6
- **默认**：▶ 播放
- **播放中**：⏸ 暂停 + 脉冲动画
- **加载中**：⏳ 加载中

```javascript
computed: {
  playButtonIcon() {
    if (this.loadingVoice) return '⏳';
    if (this.isVoicePlaying) return '⏸';
    return '▶';
  }
}
```

#### 脉冲动画
```css
@keyframes pulse-btn {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(99, 102, 241, 0);
  }
}
```

#### 进度条（简化设计）
- **高度**：4px（紧凑）
- **背景**：浅蓝（20% 透明）
- **填充**：渐变蓝紫色
- **时间显示**：`00:23 / 01:12`（字体单间距）

```vue
<div class="progress-section">
  <div class="progress-bar">
    <div class="progress-fill" :style="{ width: voiceProgress + '%' }"></div>
  </div>
  <span class="time-display">
    {{ formatVoiceTime(voiceCurrentTime) }} / {{ formatVoiceTime(voiceDuration) }}
  </span>
</div>
```

#### 状态提示
```
加载中    → "正在加载声音…"
播放中    → "正在朗读"
无声纹    → "作者暂未提供声音"
错误      → "声音加载失败"
```

### 5. 状态管理

```javascript
data() {
  return {
    hasAuthorVoice: false,        // 作者是否有声纹
    isVoicePlaying: false,        // 是否正在播放
    loadingVoice: false,          // 是否加载中
    voiceStatus: '',              // 状态文本
    voiceProgress: 0,             // 进度百分比
    voiceCurrentTime: 0,          // 当前时间
    voiceDuration: 0,             // 总时长
    authorVoiceId: null           // 作者声纹 ID
  };
}
```

### 6. 帖子互动区（弱化设计）

```
❤️ 32   💬 8   ⭐ 收藏
```

#### 特点
- **字号**：13px（小）
- **颜色**：灰色（#64748b）
- **间距**：紧凑（不抢戏）
- **边框**：上方分割线（1px 浅灰）
- **点击反馈**：轻微背景变化

#### 按钮样式
```css
.interaction-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.interaction-btn:hover {
  background: #f8fafc;
}

.interaction-btn.like-btn.active {
  color: #ef4444;
}
```

### 7. 评论区（标准设计）

#### 评论输入框
- **高度**：80px 最小
- **边框**：1px 灰色
- **聚焦**：蓝紫边 + 透明阴影
- **字数限制**：500 字
- **字数显示**：实时显示

#### 评论项
- **头像**：36px，渐变圆形
- **作者名**：13px 加粗
- **时间**：12px 灰色
- **内容**：14px，行高 1.6
- **间距**：下方分割线

```vue
<div class="comment-item">
  <div class="comment-avatar">{{ getInitial(comment.author) }}</div>
  <div class="comment-body">
    <div class="comment-header">
      <span class="comment-author">{{ comment.author }}</span>
      <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
    </div>
    <p class="comment-text">{{ comment.content }}</p>
  </div>
</div>
```

## 技术实现

### 1. 声纹检测

```javascript
async mounted() {
  await this.loadPostDetail();
  
  // 检查作者是否有声纹
  if (this.post.user_id) {
    try {
      const voiceProfile = await voiceAPI.getVoiceProfile(this.post.user_id);
      if (voiceProfile && voiceProfile.voices?.length > 0) {
        this.hasAuthorVoice = true;
        this.authorVoiceId = voiceProfile.voices[0].voice_id;
      }
    } catch (err) {
      this.hasAuthorVoice = false;
    }
  }
}
```

### 2. 朗读播放

```javascript
async playVoice() {
  try {
    this.loadingVoice = true;
    
    const textToSpeak = `${this.post.title || ''}。${this.post.content || ''}`;
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'zh-CN';
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onstart = () => {
      this.isVoicePlaying = true;
      this.voiceStatus = 'playing';
      this.loadingVoice = false;
    };
    
    utterance.onend = () => {
      this.stopVoicePlayback();
    };
    
    utterance.onerror = (event) => {
      this.voiceStatus = 'error';
      this.isVoicePlaying = false;
    };
    
    window.speechSynthesis.speak(utterance);
    
  } catch (error) {
    this.voiceStatus = 'error';
  }
}
```

### 3. 时间格式化

```javascript
formatTime(dateString) {
  if (!dateString) return '未知时间';
  
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  return date.toLocaleDateString('zh-CN');
}

formatVoiceTime(seconds) {
  if (!seconds || isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
```

## 响应式设计

### 桌面端（≥ 640px）
- 最大宽度：720px
- 内边距：20px
- 字号：16px

### 移动端（< 480px）
- 最大宽度：100%
- 内边距：12px
- 字号：14-15px
- 紧凑间距

```css
@media (max-width: 480px) {
  .post-container {
    padding: 12px;
    gap: 16px;
  }
  
  .content-section {
    padding: 16px;
  }
  
  .post-title {
    font-size: 18px;
  }
  
  .post-body {
    font-size: 14px;
  }
}
```

## 颜色方案

| 用途 | 颜色 | 说明 |
|------|------|------|
| 主色 | #6366f1 | 蓝紫色，用于按钮、链接 |
| 次色 | #8b5cf6 | 更深的紫色，用于渐变 |
| 背景 | #f8fafc | 极淡灰色 |
| 卡片 | #ffffff | 白色 |
| 主文本 | #0f172a | 深色 |
| 次文本 | #64748b | 中灰色 |
| 弱文本 | #94a3b8 | 浅灰色 |
| 点赞 | #ef4444 | 红色 |
| 朗读 | #6366f1 | 蓝紫色 |

## 动画和过渡

### 脉冲动画
```css
@keyframes pulse-btn {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(99, 102, 241, 0);
  }
}

.play-btn.playing {
  animation: pulse-btn 1s ease-in-out infinite;
}
```

### 平滑过渡
- 按钮悬停：0.2s
- 进度条更新：0.1s
- 背景颜色：0.2s

## 用户体验流程

### 1. 初始加载
```
显示骨架屏 → 获取帖子数据 → 检查作者声纹 → 渲染页面
```

### 2. 阅读帖子
```
扫一眼作者 → 浏览正文 → 查看媒体 → 考虑点赞
```

### 3. 听取朗读（新功能）
```
看到"用 TA 的声音朗读" 
  ↓
点击播放按钮（▶）
  ↓
按钮变为暂停（⏸）+ 脉冲
  ↓
进度条推进 + 时间显示
  ↓
朗读完成自动停止
  ↓
按钮恢复为播放（▶）
```

### 4. 发表评论
```
点击评论输入框 → 输入内容 → 实时字数显示 → 点击发送 → 成功提示 → 评论列表更新
```

## 与旧版本的对比

| 特性 | 旧版本 | 新版本 |
|------|--------|--------|
| 页面布局 | 卡片堆叠 | 单一主轴 |
| 作者区设计 | 简单展示 | 交互化设计 |
| 朗读功能 | 无 | ✅ 核心亮点 |
| 朗读文案 | - | "用 TA 的声音朗读" |
| 进度条 | - | ✅ 带时间显示 |
| 互动区 | 多个按钮 | 弱化统一设计 |
| 评论样式 | 基础样式 | 现代化卡片 |
| 动画效果 | 无 | ✅ 脉冲/渐变 |
| 响应式 | 基础 | ✅ 完全优化 |

## 文件信息

- **新文件**：[src/components/posts/PostDetailOptimized.vue](../src/components/posts/PostDetailOptimized.vue)
- **旧文件**：[src/components/posts/PostDetail.vue](../src/components/posts/PostDetail.vue)（保留备用）
- **路由配置**：[src/router/index.js](../src/router/index.js)

## 路由配置

```javascript
{
  path: '/post/:id',
  name: 'PostDetail',
  component: () => import('../components/posts/PostDetailOptimized.vue'),
  props: true
}
```

旧版本可通过以下路由访问：
```javascript
{
  path: '/post-old/:id',
  name: 'PostDetailOld',
  component: () => import('../components/posts/PostDetail.vue'),
  props: true
}
```

## 测试建议

### 功能测试
- [ ] 加载帖子详情页
- [ ] 显示作者信息
- [ ] 显示帖子标题和内容
- [ ] 检测作者声纹并显示朗读区
- [ ] 点击播放按钮，开始朗读
- [ ] 进度条正确更新
- [ ] 点击暂停停止播放
- [ ] 发表评论
- [ ] 评论列表正确显示

### 兼容性测试
- [ ] Chrome 桌面版
- [ ] Firefox 桌面版
- [ ] Safari 桌面版
- [ ] Chrome 移动版
- [ ] Safari iOS 版

### 边界情况测试
- [ ] 无标题的帖子
- [ ] 无内容的帖子
- [ ] 没有声纹的作者
- [ ] 长文本朗读
- [ ] 快速连续点击播放/暂停

## 未来改进方向

### 短期
1. **声纹集成**：使用真实的用户声纹而非 TTS
2. **语速控制**：提供 0.5x / 1.0x / 1.5x / 2.0x 选项
3. **章节跳转**：按段落分割，支持快进快退

### 中期
1. **字幕同步**：朗读时高亮对应段落
2. **音频下载**：离线播放已生成的音频
3. **播放统计**：追踪哪些帖子被朗读最多

### 长期
1. **情感语音**：根据内容调整语调
2. **多语言**：自动识别并切换语言
3. **自定义引擎**：集成第三方 TTS（阿里云、科大讯飞等）

## 总结

PostDetailOptimized.vue 是一次全面的体验升级：

✅ **单一主轴**：清晰的信息层级，聚焦阅读体验  
✅ **核心亮点**：朗读区设计独特，"用 TA 的声音朗读" 强调人性化  
✅ **视觉优雅**：渐变配色、脉冲动画、流畅过渡  
✅ **易用易读**：15-16px 字体，1.7 行高，完美的阅读体验  
✅ **现代化**：完全符合 2026 年移动应用设计标准  

这是一个将"语音朗读"变成核心卖点的设计，不仅是功能，更是文化！
