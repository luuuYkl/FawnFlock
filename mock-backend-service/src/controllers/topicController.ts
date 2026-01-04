import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(__dirname, '../data');
const topicsPath = path.join(dataDir, 'topics.json');

const readTopics = () => {
  try { return JSON.parse(fs.readFileSync(topicsPath, 'utf8') || '[]'); } catch (e) { return []; }
};
const writeTopics = (arr: any[]) => fs.writeFileSync(topicsPath, JSON.stringify(arr, null, 2));

export const list = (_req: Request, res: Response) => {
  const all = readTopics();
  return res.json(all);
};

export const create = (req: Request, res: Response) => {
  const { name, description } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });
  const arr = readTopics();
  const entry = { id: arr.length + 1, name, description: description || '' };
  arr.push(entry);
  writeTopics(arr);
  return res.status(201).json(entry);
};

export default { list, create };
