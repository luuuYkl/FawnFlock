import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(__dirname, '../data');
const messagesPath = path.join(dataDir, 'messages.json');

const readMessages = () => {
  try { return JSON.parse(fs.readFileSync(messagesPath, 'utf8') || '[]'); } catch (e) { return []; }
};
const writeMessages = (arr: any[]) => fs.writeFileSync(messagesPath, JSON.stringify(arr, null, 2));

export const list = (req: Request, res: Response) => {
  const { user_id } = req.query;
  const all = readMessages();
  if (user_id) {
    const uid = Number(user_id);
    return res.json(all.filter(m => Number(m.from_user_id) === uid || Number(m.to_user_id) === uid));
  }
  return res.json(all);
};

export const create = (req: Request, res: Response) => {
  const { from_user_id, from_username, to_user_id, to_username, content } = req.body || {};
  if (!content) return res.status(400).json({ error: 'content required' });
  const arr = readMessages();
  const entry = { id: arr.length + 1, from_user_id, from_username, to_user_id, to_username, content, created_at: new Date().toISOString() };
  arr.push(entry);
  writeMessages(arr);
  return res.status(201).json(entry);
};

export default { list, create };
