import http from '@/utils/http';
import { API_ENDPOINTS } from '@/config/api.config';

/**
 * 用户相关 API
 */
export const userAPI = {
  // 登录
  login(phoneNumber, password) {
    return http.post(API_ENDPOINTS.USER_LOGIN, {
      phone_number: phoneNumber,
      password: password
    });
  },
  
  // 注册
  register(username, phoneNumber, password) {
    return http.post(API_ENDPOINTS.USER_REGISTER, {
      username,
      phone_number: phoneNumber,
      password
    });
  },
  
  // 获取用户信息
  getUserInfo(userId) {
    return http.get(API_ENDPOINTS.USER_INFO(userId));
  },
  
  // 更新头像
  updateAvatar(userId, avatarUrl) {
    return http.put(API_ENDPOINTS.USER_UPDATE_AVATAR(userId), {
      avatar_url: avatarUrl
    });
  }
};

/**
 * 帖子相关 API
 */
export const postAPI = {
  // 获取帖子列表
  getPosts() {
    return http.get(API_ENDPOINTS.POSTS_LIST);
  },
  
  // 获取帖子详情
  getPostDetail(postId) {
    return http.get(API_ENDPOINTS.POST_DETAIL(postId));
  },
  
  // 创建帖子
  createPost(userId, title, content, mediaUrls = []) {
    return http.post(API_ENDPOINTS.POST_CREATE, {
      user_id: userId,
      title,
      content,
      media_urls: mediaUrls
    });
  },
  
  // 点赞
  likePost(postId) {
    return http.post(API_ENDPOINTS.POST_LIKE(postId));
  },
  
  // 取消点赞
  unlikePost(postId) {
    return http.delete(API_ENDPOINTS.POST_UNLIKE(postId));
  }
};

/**
 * 评论相关 API
 */
export const commentAPI = {
  // 获取评论列表
  getComments(postId) {
    return http.get(API_ENDPOINTS.COMMENTS_LIST(postId));
  },
  
  // 创建评论
  createComment(postId, userId, content) {
    return http.post(API_ENDPOINTS.COMMENT_CREATE(postId), {
      user_id: userId,
      content
    });
  }
};

/**
 * 语音 / 声纹相关
 */
export const voiceAPI = {
  // 使用 base64 字符串提交实时录音以进行声纹录入
  enrollVoice(userId, audioBase64, filename = 'voice.webm') {
    return http.post(API_ENDPOINTS.VOICE_ENROLL, {
      user_id: userId,
      filename,
      audio_base64: audioBase64
    });
  },

  // 上传媒体文件（例如 mp3/mp4/wav）以供声纹录入
  uploadMedia(userId, audioBase64, filename) {
    return http.post(API_ENDPOINTS.VOICE_UPLOAD_MEDIA, {
      user_id: userId,
      filename,
      audio_base64: audioBase64
    });
  }
  ,
  getVoices(userId) {
    const params = userId ? { params: { user_id: userId } } : undefined;
    return http.get(API_ENDPOINTS.VOICES_LIST, params);
  },
  deleteVoice(id) {
    return http.delete(API_ENDPOINTS.VOICE_DELETE(id));
  }
};

/**
 * 功能增强 API：搜索、通知、私信、话题
 */
export const searchAPI = {
  search(q) {
    return http.get(API_ENDPOINTS.SEARCH, { params: { q } });
  }
};

export const notificationAPI = {
  getNotifications(userId) {
    const params = userId ? { params: { user_id: userId } } : undefined;
    return http.get(API_ENDPOINTS.NOTIFICATIONS_LIST, params);
  },
  createNotification(payload) {
    return http.post(API_ENDPOINTS.NOTIFICATION_CREATE, payload);
  }
};

export const messageAPI = {
  getMessages(userId) {
    const params = userId ? { params: { user_id: userId } } : undefined;
    return http.get(API_ENDPOINTS.MESSAGES_LIST, params);
  },
  sendMessage(payload) {
    return http.post(API_ENDPOINTS.MESSAGE_CREATE, payload);
  }
};

export const topicAPI = {
  getTopics() {
    return http.get(API_ENDPOINTS.TOPICS_LIST);
  },
  createTopic(payload) {
    return http.post(API_ENDPOINTS.TOPIC_CREATE, payload);
  }
};