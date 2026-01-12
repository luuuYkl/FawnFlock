import { Request, Response } from 'express';
import path from 'path';
import { dataCache } from '../services/DataCache';

const dataDir = path.join(__dirname, '../data');
const topicsPath = path.join(dataDir, 'topics.json');


export const list = (_req: Request, res: Response) => {
  const all = dataCache.load(topicsPath);
  return res.json(all);
};

export const create = (req: Request, res: Response) => {
  const { name, description } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });
  const arr = dataCache.load(topicsPath);
  const entry = { id: arr.length + 1, name, description: description || '' };
  arr.push(entry);
  dataCache.save(topicsPath, arr);
  return res.status(201).json(entry);
};

export default { list, create };
