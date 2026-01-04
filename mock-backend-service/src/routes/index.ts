import { Router } from 'express';
import * as userController from '../controllers/userController';
import * as postController from '../controllers/postController';
import * as commentController from '../controllers/commentController';
import * as searchController from '../controllers/searchController';
import * as notificationController from '../controllers/notificationController';
import * as messageController from '../controllers/messageController';
import * as topicController from '../controllers/topicController';
import * as voiceController from '../controllers/voiceController';

const router = Router();

// 用户路由
router.post('/users/login', userController.login);
router.post('/users/register', userController.register);
router.get('/users/:id', userController.getUserById);
router.put('/users/:id/avatar', userController.updateAvatar);

// 帖子路由
router.get('/posts', postController.getPosts);
router.get('/posts/:id', postController.getPostById);
router.post('/posts', postController.createPost);
router.post('/posts/:id/like', postController.likePost);
router.delete('/posts/:id/like', postController.unlikePost);

// 评论路由
router.get('/posts/:postId/comments', commentController.getCommentsByPostId);
router.post('/posts/:postId/comments', commentController.createComment);
router.delete('/comments/:commentId', commentController.deleteComment);

// 语音/声纹路由
router.post('/voices/enroll', voiceController.enroll);
router.post('/voices/upload', voiceController.uploadMedia);
router.get('/voices/files/:name', voiceController.serveVoiceFile);
router.get('/voices', voiceController.listVoices);
router.delete('/voices/:id', voiceController.deleteVoice);

// 搜索
router.get('/search', searchController.search);

// 通知
router.get('/notifications', notificationController.list);
router.post('/notifications', notificationController.create);

// 私信
router.get('/messages', messageController.list);
router.post('/messages', messageController.create);

// 话题
router.get('/topics', topicController.list);
router.post('/topics', topicController.create);

export default router;