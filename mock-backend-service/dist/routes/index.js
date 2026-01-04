"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController = __importStar(require("../controllers/userController"));
const postController = __importStar(require("../controllers/postController"));
const commentController = __importStar(require("../controllers/commentController"));
const router = (0, express_1.Router)();
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
exports.default = router;
//# sourceMappingURL=index.js.map