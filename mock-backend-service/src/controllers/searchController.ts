import { Request, Response } from 'express';
import path from 'path';
import { dataCache } from '../services/DataCache';

const dataDir = path.join(__dirname, '../data');
const postsPath = path.join(dataDir, 'posts.json');
const usersPath = path.join(dataDir, 'users.json');


export const search = (req: Request, res: Response) => {
  const q = (req.query.q || '').toString().toLowerCase();
  if (!q) return res.json([]);
  const posts = dataCache.load(postsPath);
  const users = dataCache.load(usersPath);
  const postMatches = (posts || []).filter((p: any) => (p.title || '').toLowerCase().includes(q) || (p.content || '').toLowerCase().includes(q));
  const userMatches = (users || []).filter((u: any) => (u.username || '').toLowerCase().includes(q));
  return res.json({ posts: postMatches, users: userMatches });
};

export default { search };
