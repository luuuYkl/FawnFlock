import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(__dirname, '../data/posts.json');

const readPosts = () => {
  const data = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(data);
};

const savePosts = (posts: any[]) => {
  fs.writeFileSync(dataPath, JSON.stringify(posts, null, 2));
};

export const getPosts = (req: Request, res: Response) => {
  const posts = readPosts();
  res.json(posts);
};

export const getPostById = (req: Request, res: Response) => {
  const { id } = req.params;
  const posts = readPosts();
  const post = posts.find((p: any) => p.post_id === parseInt(id));
  
  if (!post) {
    return res.status(404).json({ error: '帖子不存在' });
  }
  
  res.json(post);
};

export const createPost = (req: Request, res: Response) => {
  const { user_id, title, content, author, media_urls } = req.body;
  const posts = readPosts();
  
  const newPost = {
    post_id: posts.length > 0 ? Math.max(...posts.map((p: any) => p.post_id)) + 1 : 1,
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

export const likePost = (req: Request, res: Response) => {
  const { id } = req.params;
  const posts = readPosts();
  const postIndex = posts.findIndex((p: any) => p.post_id === parseInt(id));
  
  if (postIndex === -1) {
    return res.status(404).json({ error: '帖子不存在' });
  }
  
  posts[postIndex].like_count += 1;
  savePosts(posts);
  
  res.json({ success: true, like_count: posts[postIndex].like_count });
};

export const unlikePost = (req: Request, res: Response) => {
  const { id } = req.params;
  const posts = readPosts();
  const postIndex = posts.findIndex((p: any) => p.post_id === parseInt(id));
  
  if (postIndex === -1) {
    return res.status(404).json({ error: '帖子不存在' });
  }
  
  posts[postIndex].like_count = Math.max(0, posts[postIndex].like_count - 1);
  savePosts(posts);
  
  res.json({ success: true, like_count: posts[postIndex].like_count });
};