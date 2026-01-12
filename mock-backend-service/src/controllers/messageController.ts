import { Request, Response } from 'express';
import path from 'path';
import { dataCache } from '../services/DataCache';

const dataDir = path.join(__dirname, '../data');
const messagesPath = path.join(dataDir, 'messages.json');


export const list = (req: Request, res: Response) => {
  const { user_id } = req.query;
  const all = dataCache.load(messagesPath);
  if (user_id) {
    const uid = Number(user_id);
    return res.json(all.filter(m => Number(m.from_user_id) === uid || Number(m.to_user_id) === uid));
  }
  return res.json(all);
};

export const create = (req: Request, res: Response) => {
  const { from_user_id, from_username, to_user_id, to_username, content } = req.body || {};
  if (!content) return res.status(400).json({ error: 'content required' });
  const arr = dataCache.load(messagesPath);
  const entry = { id: arr.length + 1, from_user_id, from_username, to_user_id, to_username, content, created_at: new Date().toISOString() };
  arr.push(entry);
  dataCache.save(messagesPath, arr);
  return res.status(201).json(entry);
};

export default { list, create };
