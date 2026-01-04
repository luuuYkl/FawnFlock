"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.createComment = exports.getCommentsByPostId = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const commentsPath = path_1.default.join(__dirname, '../data/comments.json');
const postsPath = path_1.default.join(__dirname, '../data/posts.json');
const readComments = () => {
    const data = fs_1.default.readFileSync(commentsPath, 'utf-8');
    return JSON.parse(data);
};
const saveComments = (comments) => {
    fs_1.default.writeFileSync(commentsPath, JSON.stringify(comments, null, 2));
};
const readPosts = () => {
    const data = fs_1.default.readFileSync(postsPath, 'utf-8');
    return JSON.parse(data);
};
const savePosts = (posts) => {
    fs_1.default.writeFileSync(postsPath, JSON.stringify(posts, null, 2));
};
// 获取指定帖子的评论列表
const getCommentsByPostId = (req, res) => {
    const { postId } = req.params;
    const comments = readComments();
    const postComments = comments.filter((c) => c.post_id === parseInt(postId));
    // 按时间倒序排序（最新的在前）
    postComments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(postComments);
};
exports.getCommentsByPostId = getCommentsByPostId;
// 创建评论
const createComment = (req, res) => {
    const { postId } = req.params;
    const { user_id, content, author } = req.body;
    if (!content || !content.trim()) {
        return res.status(400).json({ error: '评论内容不能为空' });
    }
    const comments = readComments();
    const posts = readPosts();
    // 检查帖子是否存在
    const postIndex = posts.findIndex((p) => p.post_id === parseInt(postId));
    if (postIndex === -1) {
        return res.status(404).json({ error: '帖子不存在' });
    }
    // 创建新评论
    const newComment = {
        comment_id: comments.length > 0 ? Math.max(...comments.map((c) => c.comment_id)) + 1 : 1,
        post_id: parseInt(postId),
        user_id: user_id || 1,
        author: author || '匿名用户',
        content: content.trim(),
        created_at: new Date().toISOString()
    };
    comments.push(newComment);
    saveComments(comments);
    // 更新帖子的评论数
    posts[postIndex].comment_count = (posts[postIndex].comment_count || 0) + 1;
    savePosts(posts);
    res.status(201).json({
        success: true,
        comment: newComment
    });
};
exports.createComment = createComment;
// 删除评论
const deleteComment = (req, res) => {
    const { commentId } = req.params;
    const comments = readComments();
    const commentIndex = comments.findIndex((c) => c.comment_id === parseInt(commentId));
    if (commentIndex === -1) {
        return res.status(404).json({ error: '评论不存在' });
    }
    const comment = comments[commentIndex];
    comments.splice(commentIndex, 1);
    saveComments(comments);
    // 更新帖子的评论数
    const posts = readPosts();
    const postIndex = posts.findIndex((p) => p.post_id === comment.post_id);
    if (postIndex !== -1) {
        posts[postIndex].comment_count = Math.max(0, (posts[postIndex].comment_count || 0) - 1);
        savePosts(posts);
    }
    res.json({ success: true });
};
exports.deleteComment = deleteComment;
//# sourceMappingURL=commentController.js.map