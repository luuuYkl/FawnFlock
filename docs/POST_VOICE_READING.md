# 帖子语音朗读功能文档

## 功能概述

为 FawnFlock 的帖子添加了"语音朗读"功能，用户可以点击帖子的"朗读"按钮，让系统使用文本转语音（TTS）技术朗读帖子内容。

## 功能特性

### 1. 用户交互
- **按钮位置**：在帖子操作栏中，位于"点赞"、"评论"、"分享"按钮之间
- **按钮图标**：
  - 默认状态：🎙️ 朗读
  - 播放中：🎵 播放中
- **点击效果**：
  - 首次点击：开始播放帖子内容
  - 播放中点击：停止播放
  - 其他帖子播放中再点击新帖子：停止旧帖子，播放新帖子

### 2. 语音参数
- **语言**：中文（zh-CN）
- **语速**：1.0x（正常速度）
- **音调**：1.0（正常音调）
- **音量**：100%

### 3. 可读取内容
```javascript
// 组织的朗读文本：标题 + 内容
const textToSpeak = `${post.title || ''}。${post.content || ''}`;
```

## 技术实现

### 1. Web Speech API
使用浏览器原生的 Web Speech API（SpeechSynthesis）进行文本转语音：

```javascript
const SpeechSynthesisUtterance = window.SpeechSynthesisUtterance;
const speechSynthesis = window.speechSynthesis;

const utterance = new SpeechSynthesisUtterance(textToSpeak);
utterance.lang = 'zh-CN';
utterance.rate = 1;
utterance.pitch = 1;
utterance.volume = 1;

speechSynthesis.speak(utterance);
```

### 2. 状态管理
- **playingPostId**：跟踪当前播放的帖子 ID
- **synth**：Web Speech API 对象引用

### 3. 事件监听
```javascript
utterance.onstart = () => {
  // 开始播放时更新 UI
  this.playingPostId = post.post_id;
};

utterance.onend = () => {
  // 播放结束时清除状态
  this.playingPostId = null;
};

utterance.onerror = (event) => {
  // 处理播放错误
  this.playingPostId = null;
};
```

## 代码修改

### 修改文件：`src/components/HomePageOptimized.vue`

#### 1. 模板增加
在操作栏中添加朗读按钮：

```vue
<button 
  class="action-btn voice"
  :class="{ playing: playingPostId === post.post_id }"
  @click.stop="playPostVoice(post)"
  title="用声音朗读这条帖子"
>
  <span class="icon">{{ playingPostId === post.post_id ? '🎵' : '🎙️' }}</span>
  <span class="text">{{ playingPostId === post.post_id ? '播放中' : '朗读' }}</span>
</button>
```

#### 2. 数据对象增加
```javascript
data() {
  return {
    // ... 其他数据
    playingPostId: null,  // 当前播放的帖子 ID
    synth: null           // Web Speech API 对象
  };
}
```

#### 3. 方法增加
```javascript
playPostVoice(post) {
  // 1. 检查浏览器支持
  const SpeechSynthesisUtterance = window.SpeechSynthesisUtterance;
  const speechSynthesis = window.speechSynthesis;

  if (!SpeechSynthesisUtterance || !speechSynthesis) {
    alert('您的浏览器不支持语音合成功能');
    return;
  }

  // 2. 处理点击正在播放的帖子
  if (this.playingPostId === post.post_id) {
    speechSynthesis.cancel();
    this.playingPostId = null;
    return;
  }

  // 3. 停止其他帖子的播放
  if (this.playingPostId !== null) {
    speechSynthesis.cancel();
  }

  // 4. 准备文本
  const textToSpeak = `${post.title || ''}。${post.content || ''}`;

  if (!textToSpeak.trim()) {
    alert('此帖子没有可读取的内容');
    return;
  }

  // 5. 创建语音对象并设置参数
  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.lang = 'zh-CN';
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  // 6. 监听事件
  utterance.onstart = () => {
    this.playingPostId = post.post_id;
  };

  utterance.onend = () => {
    this.playingPostId = null;
  };

  utterance.onerror = (event) => {
    console.error('语音播放出错:', event);
    this.playingPostId = null;
    alert('语音播放出错，请稍后重试');
  };

  // 7. 开始播放
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}
```

#### 4. 样式增加
```css
.post-actions .action-btn.voice {
  color: #6366f1;  /* 蓝紫色 */
}

.post-actions .action-btn.voice.playing {
  color: #8b5cf6;  /* 更深的紫色 */
  animation: pulse-voice 1s ease-in-out infinite;
}

@keyframes pulse-voice {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
```

## 用户体验

### 典型使用流程

1. **浏览帖子**
   - 用户在主页看到帖子流
   - 每个帖子都有"朗读"按钮（🎙️）

2. **点击朗读**
   - 用户点击"朗读"按钮
   - 按钮变为"播放中"（🎵），并带有脉冲动画

3. **听取内容**
   - 系统开始朗读帖子标题和内容
   - 用户可以继续浏览其他帖子

4. **停止播放**
   - 自动：朗读完成后自动停止
   - 手动：点击"播放中"按钮停止
   - 切换：点击其他帖子的"朗读"按钮自动停止当前播放

### 视觉反馈

- **未播放**：按钮为蓝紫色（#6366f1），图标为 🎙️
- **播放中**：按钮为更深的紫色（#8b5cf6），图标为 🎵，带有脉冲闪烁效果
- **悬停**：按钮背景变亮
- **点击**：按钮缩放至 95%

## 浏览器兼容性

### 支持的浏览器

| 浏览器 | 版本 | 支持度 |
|--------|------|--------|
| Chrome | 14+ | ✅ 完全支持 |
| Firefox | 49+ | ✅ 完全支持 |
| Safari | 14.1+ | ✅ 完全支持 |
| Edge | 79+ | ✅ 完全支持 |
| Opera | 27+ | ✅ 完全支持 |
| IE | 全部 | ❌ 不支持 |

### 中文支持

- 所有现代浏览器都支持中文文本转语音
- 不同浏览器使用的中文语音引擎可能不同
- Android / iOS 设备需要系统安装相应的语言包

## 错误处理

### 场景 1：浏览器不支持
```
用户看到: "您的浏览器不支持语音合成功能"
处理: 显示警告，不执行播放
```

### 场景 2：帖子无内容
```
用户看到: "此帖子没有可读取的内容"
处理: 显示警告，不执行播放
```

### 场景 3：播放出错
```
用户看到: "语音播放出错，请稍后重试"
处理: 清除播放状态，记录错误日志
```

## 可能的改进方向

### 短期改进
1. **语音选择**：允许用户选择男声/女声
2. **语速调整**：提供 0.5x / 1.0x / 1.5x / 2.0x 选项
3. **暂停/继续**：支持暂停后继续播放
4. **记住偏好**：保存用户的语言和语速设置

### 中期改进
1. **集成用户声音**：使用用户录制的声纹朗读帖子
2. **音频缓存**：缓存已生成的语音文件
3. **离线播放**：支持离线下载帖子语音
4. **字幕同步**：朗读时高亮显示对应文字

### 长期改进
1. **情感语音**：根据帖子情感调整语调
2. **多语言支持**：自动识别并切换语言
3. **自定义语音**：集成第三方 TTS 服务（如阿里云、科大讯飞）
4. **播放统计**：追踪哪些帖子被朗读得最多

## 技术局限

1. **文字长度限制**：某些浏览器对单次朗读的文本长度有限制（通常 > 10000 字）
2. **本地 TTS 限制**：质量和速度取决于操作系统的 TTS 引擎
3. **网络依赖**：某些浏览器/系统使用在线 TTS 服务，需要网络连接
4. **多语言混用**：混合中英文时可能出现发音不当

## 测试建议

### 基本功能测试
- [ ] 点击"朗读"按钮，能否成功播放
- [ ] 播放中点击相同按钮，能否停止
- [ ] 播放中点击其他帖子，能否切换

### 兼容性测试
- [ ] 在 Chrome 中测试
- [ ] 在 Firefox 中测试
- [ ] 在 Safari 中测试（Mac 和 iOS）
- [ ] 在移动设备上测试

### 边界情况测试
- [ ] 帖子只有标题，无内容
- [ ] 帖子只有内容，无标题
- [ ] 帖子为空字符串
- [ ] 帖子包含特殊字符/表情

### 性能测试
- [ ] 长文本朗读性能
- [ ] 多个帖子快速切换
- [ ] 内存使用情况

## 相关文件

- **主文件**：[src/components/HomePageOptimized.vue](../src/components/HomePageOptimized.vue)
- **相关功能**：声纹录入 ([VoiceEnrollmentOptimized.vue](../src/views/VoiceEnrollmentOptimized.vue))
- **API 服务**：[src/services/api.service.js](../src/services/api.service.js)

## 总结

帖子语音朗读功能使用了浏览器原生的 Web Speech API，为用户提供了便捷的音频内容获取方式。这个功能：

✅ **简单易用**：一键播放帖子内容  
✅ **跨浏览器**：支持所有现代浏览器  
✅ **中文支持**：原生支持中文朗读  
✅ **零成本**：使用浏览器内置引擎，无额外服务费用  
✅ **体验友好**：清晰的视觉反馈和错误处理  

这是一个实用的无障碍功能增强，特别适合在工作/学习期间快速了解帖子内容的用户。
