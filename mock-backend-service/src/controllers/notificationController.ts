import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(__dirname, '../data');
const notificationsPath = path.join(dataDir, 'notifications.json');

const readNotifications = () => {
  try { return JSON.parse(fs.readFileSync(notificationsPath, 'utf8') || '[]'); } catch (e) { return []; }
};
const writeNotifications = (arr: any[]) => fs.writeFileSync(notificationsPath, JSON.stringify(arr, null, 2));

export const list = (req: Request, res: Response) => {
  const { user_id } = req.query;
  const all = readNotifications();
  if (user_id) return res.json(all.filter(n => Number(n.user_id) === Number(user_id)));
  return res.json(all);
};

export const create = (req: Request, res: Response) => {
  const { user_id, message } = req.body || {};
  if (!message) return res.status(400).json({ error: 'message required' });
  const arr = readNotifications();
  const entry = { id: arr.length + 1, user_id: user_id || null, message, created_at: new Date().toISOString() };
  arr.push(entry);
  writeNotifications(arr);
  return res.status(201).json(entry);
};

export default { list, create };
