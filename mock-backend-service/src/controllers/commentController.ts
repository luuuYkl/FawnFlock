import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const commentsPath = path.join(__dirname, '../data/comments.json');
const postsPath = path.join(__dirname, '../data/posts.json');

const readComments = () => {
  const data = fs.readFileSync(commentsPath, 'utf-8');
  return JSON.parse(data);
};

const saveComments = (comments: any[]) => {
  fs.writeFileSync(commentsPath, JSON.stringify(comments, null, 2));
};

const readPosts = () => {
  const data = fs.readFileSync(postsPath, 'utf-8');
  return JSON.parse(data);
};

const savePosts = (posts: any[]) => {
  fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));
};

// 获取指定帖子的评论列表
export const getCommentsByPostId = (req: Request, res: Response) => {
  const { postId } = req.params;
  const comments = readComments();
  
  const postComments = comments.filter(
    (c: any) => c.post_id === parseInt(postId)
  );
  
  // 按时间倒序排序（最新的在前）
  postComments.sort((a: any, b: any) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  res.json(postComments);
};

// 创建评论
export const createComment = (req: Request, res: Response) => {
  const { postId } = req.params;
  const { user_id, content, author } = req.body;
  
  if (!content || !content.trim()) {
    return res.status(400).json({ error: '评论内容不能为空' });
  }
  
  const comments = readComments();
  const posts = readPosts();
  
  // 检查帖子是否存在
  const postIndex = posts.findIndex((p: any) => p.post_id === parseInt(postId));
  if (postIndex === -1) {
    return res.status(404).json({ error: '帖子不存在' });
  }
  
  // 创建新评论
  const newComment = {
    comment_id: comments.length > 0 ? Math.max(...comments.map((c: any) => c.comment_id)) + 1 : 1,
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

// 删除评论
export const deleteComment = (req: Request, res: Response) => {
  const { commentId } = req.params;
  const comments = readComments();
  
  const commentIndex = comments.findIndex(
    (c: any) => c.comment_id === parseInt(commentId)
  );
  
  if (commentIndex === -1) {
    return res.status(404).json({ error: '评论不存在' });
  }
  
  const comment = comments[commentIndex];
  comments.splice(commentIndex, 1);
  saveComments(comments);
  
  // 更新帖子的评论数
  const posts = readPosts();
  const postIndex = posts.findIndex((p: any) => p.post_id === comment.post_id);
  if (postIndex !== -1) {
    posts[postIndex].comment_count = Math.max(0, (posts[postIndex].comment_count || 0) - 1);
    savePosts(posts);
  }
  
  res.json({ success: true });
};
