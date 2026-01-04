import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(__dirname, '../data');
const postsPath = path.join(dataDir, 'posts.json');
const usersPath = path.join(dataDir, 'users.json');

const readJSON = (p: string) => {
  try { return JSON.parse(fs.readFileSync(p, 'utf8') || '[]'); } catch (e) { return []; }
};

export const search = (req: Request, res: Response) => {
  const q = (req.query.q || '').toString().toLowerCase();
  if (!q) return res.json([]);
  const posts = readJSON(postsPath);
  const users = readJSON(usersPath);
  const postMatches = (posts || []).filter((p: any) => (p.title || '').toLowerCase().includes(q) || (p.content || '').toLowerCase().includes(q));
  const userMatches = (users || []).filter((u: any) => (u.username || '').toLowerCase().includes(q));
  return res.json({ posts: postMatches, users: userMatches });
};

export default { search };
