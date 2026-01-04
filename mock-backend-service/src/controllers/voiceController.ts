import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(__dirname, '../data');
const voicesDataPath = path.join(dataDir, 'voices.json');
const voicesFilesDir = path.join(dataDir, 'voices_files');

// ensure directories exist
if (!fs.existsSync(voicesFilesDir)) {
  fs.mkdirSync(voicesFilesDir, { recursive: true });
}

const readVoices = (): any[] => {
  try {
    const raw = fs.readFileSync(voicesDataPath, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
};

const writeVoices = (arr: any[]) => {
  fs.writeFileSync(voicesDataPath, JSON.stringify(arr, null, 2));
};

// Helper to save base64 audio to file
const saveBase64File = (base64: string, filename: string) => {
  const buffer = Buffer.from(base64, 'base64');
  const safeName = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const filePath = path.join(voicesFilesDir, safeName);
  fs.writeFileSync(filePath, buffer);
  return `/api/voices/files/${safeName}`; // return a URL path for reference
};

// enroll: receive user_id, filename, audio_base64
export const enroll = (req: Request, res: Response) => {
  const { user_id, filename, audio_base64 } = req.body || {};
  if (!audio_base64) return res.status(400).json({ error: 'audio_base64 required' });

  try {
    const url = saveBase64File(audio_base64, filename || 'voice.webm');
    const voices = readVoices();
    const entry = {
      id: voices.length + 1,
      user_id: user_id || null,
      filename: filename || 'voice.webm',
      file_url: url,
      created_at: new Date().toISOString(),
      type: 'enroll'
    };
    voices.push(entry);
    writeVoices(voices);

    return res.status(201).json({ success: true, entry });
  } catch (e) {
    console.error('save voice failed', e);
    return res.status(500).json({ error: '保存失败' });
  }
};

// upload media (same format)
export const uploadMedia = (req: Request, res: Response) => {
  const { user_id, filename, audio_base64 } = req.body || {};
  if (!audio_base64) return res.status(400).json({ error: 'audio_base64 required' });
  try {
    const url = saveBase64File(audio_base64, filename || 'media.bin');
    const voices = readVoices();
    const entry = {
      id: voices.length + 1,
      user_id: user_id || null,
      filename: filename || 'media.bin',
      file_url: url,
      created_at: new Date().toISOString(),
      type: 'media'
    };
    voices.push(entry);
    writeVoices(voices);
    return res.status(201).json({ success: true, entry });
  } catch (e) {
    console.error('save media failed', e);
    return res.status(500).json({ error: '保存失败' });
  }
};

// serve static voice files under /api/voices/files/:name
export const serveVoiceFile = (req: Request, res: Response) => {
  const { name } = req.params;
  const full = path.join(voicesFilesDir, name);
  if (!fs.existsSync(full)) return res.status(404).end();
  res.sendFile(full);
};

// list voices, optional ?user_id=ID
export const listVoices = (req: Request, res: Response) => {
  const { user_id } = req.query;
  const voices = readVoices();
  if (user_id) {
    const uid = Number(user_id);
    return res.json(voices.filter(v => Number(v.user_id) === uid));
  }
  return res.json(voices);
};

// delete voice by id
export const deleteVoice = (req: Request, res: Response) => {
  const { id } = req.params;
  const voices = readVoices();
  const idx = voices.findIndex(v => String(v.id) === String(id));
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  const [removed] = voices.splice(idx, 1);
  writeVoices(voices);
  // remove file if exists
  try {
    if (removed && removed.file_url) {
      const parts = String(removed.file_url).split('/');
      const name = parts[parts.length - 1];
      const full = path.join(voicesFilesDir, name);
      if (fs.existsSync(full)) fs.unlinkSync(full);
    }
  } catch (e) {
    console.warn('failed to remove file', e);
  }
  return res.json({ success: true });
};

export default { enroll, uploadMedia, serveVoiceFile };
