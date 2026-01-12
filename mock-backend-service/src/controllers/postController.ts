import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import dataCache from '../services/DataCache';

const dataPath = path.join(__dirname, '../data/posts.json');

export const getPosts = (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  
  const posts = dataCache.load(dataPath);
  const total = posts.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  const paginatedPosts = posts.slice(start, end);
  
  // 设置分页响应头
  res.set('X-Total-Count', total.toString());
  res.set('X-Page', page.toString());
  res.set('X-PageSize', pageSize.toString());
  
  res.json(paginatedPosts);
};

export const getPostById = (req: Request, res: Response) => {
  const { id } = req.params;
  const posts = dataCache.load(dataPath);
  const post = posts.find((p: any) => p.post_id === parseInt(id));
  
  if (!post) {
    return res.status(404).json({ error: '帖子不存在' });
  }
  
  res.json(post);
};

export const createPost = (req: Request, res: Response) => {
  const { user_id, title, content, author, media_urls } = req.body;
  const posts = dataCache.load(dataPath);
  
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
  dataCache.save(dataPath, posts);
  
  res.status(201).json(newPost);
};

export const likePost = (req: Request, res: Response) => {
  const { id } = req.params;
  const posts = dataCache.load(dataPath);
  const postIndex = posts.findIndex((p: any) => p.post_id === parseInt(id));
  
  if (postIndex === -1) {
    return res.status(404).json({ error: '帖子不存在' });
  }
  
  posts[postIndex].like_count += 1;
  dataCache.save(dataPath, posts);
  
  res.json({ success: true, like_count: posts[postIndex].like_count });
};

export const unlikePost = (req: Request, res: Response) => {
  const { id } = req.params;
  const posts = dataCache.load(dataPath);
  const postIndex = posts.findIndex((p: any) => p.post_id === parseInt(id));
  
  if (postIndex === -1) {
    return res.status(404).json({ error: '帖子不存在' });
  }
  
  posts[postIndex].like_count = Math.max(0, posts[postIndex].like_count - 1);
  dataCache.save(dataPath, posts);
  
  res.json({ success: true, like_count: posts[postIndex].like_count });
};