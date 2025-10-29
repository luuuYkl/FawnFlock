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
  createPost(userId, content, mediaUrls = []) {
    return http.post(API_ENDPOINTS.POST_CREATE, {
      user_id: userId,
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