"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlikePost = exports.likePost = exports.createPost = exports.getPostById = exports.getPosts = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dataPath = path_1.default.join(__dirname, '../data/posts.json');
const readPosts = () => {
    const data = fs_1.default.readFileSync(dataPath, 'utf-8');
    return JSON.parse(data);
};
const savePosts = (posts) => {
    fs_1.default.writeFileSync(dataPath, JSON.stringify(posts, null, 2));
};
const getPosts = (req, res) => {
    const posts = readPosts();
    res.json(posts);
};
exports.getPosts = getPosts;
const getPostById = (req, res) => {
    const { id } = req.params;
    const posts = readPosts();
    const post = posts.find((p) => p.post_id === parseInt(id));
    if (!post) {
        return res.status(404).json({ error: '帖子不存在' });
    }
    res.json(post);
};
exports.getPostById = getPostById;
const createPost = (req, res) => {
    const { user_id, title, content, author, media_urls } = req.body;
    const posts = readPosts();
    const newPost = {
        post_id: posts.length > 0 ? Math.max(...posts.map((p) => p.post_id)) + 1 : 1,
        user_id,
        title: title || '无标题',
        content,
        author: author || '匿名用户',
        media_urls: media_urls || [],
        like_count: 0,
        comment_count: 0,
        created_at: new Date().toISOString()
    };
    posts.unshift(newPost);
    savePosts(posts);
    res.status(201).json(newPost);
};
exports.createPost = createPost;
const likePost = (req, res) => {
    const { id } = req.params;
    const posts = readPosts();
    const postIndex = posts.findIndex((p) => p.post_id === parseInt(id));
    if (postIndex === -1) {
        return res.status(404).json({ error: '帖子不存在' });
    }
    posts[postIndex].like_count += 1;
    savePosts(posts);
    res.json({ success: true, like_count: posts[postIndex].like_count });
};
exports.likePost = likePost;
const unlikePost = (req, res) => {
    const { id } = req.params;
    const posts = readPosts();
    const postIndex = posts.findIndex((p) => p.post_id === parseInt(id));
    if (postIndex === -1) {
        return res.status(404).json({ error: '帖子不存在' });
    }
    posts[postIndex].like_count = Math.max(0, posts[postIndex].like_count - 1);
    savePosts(posts);
    res.json({ success: true, like_count: posts[postIndex].like_count });
};
exports.unlikePost = unlikePost;
//# sourceMappingURL=postController.js.map