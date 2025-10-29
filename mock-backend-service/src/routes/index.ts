import { Router } from 'express';
import * as userController from '../controllers/userController';
import * as postController from '../controllers/postController';
import * as commentController from '../controllers/commentController';

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

export default router;