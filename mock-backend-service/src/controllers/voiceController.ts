import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { dataCache } from '../services/DataCache';

const dataDir = path.join(__dirname, '../data');
const voicesDataPath = path.join(dataDir, 'voices.json');
const voicesFilesDir = path.join(dataDir, 'voices_files');
const voiceProfilesPath = path.join(dataDir, 'voice_profiles.json');
const postsDataPath = path.join(dataDir, 'posts.json');

// Voice AI 微服务 URL
const VOICE_AI_SERVICE_URL = process.env.VOICE_AI_SERVICE_URL || 'http://localhost:5000';

// ensure directories exist
if (!fs.existsSync(voicesFilesDir)) {
  fs.mkdirSync(voicesFilesDir, { recursive: true });
}




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
    const voices = dataCache.load(voicesDataPath);
    const entry = {
      id: voices.length + 1,
      user_id: user_id || null,
      filename: filename || 'voice.webm',
      file_url: url,
      created_at: new Date().toISOString(),
      type: 'enroll'
    };
    voices.push(entry);
    dataCache.save(voicesDataPath, voices);

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
    const voices = dataCache.load(voicesDataPath);
    const entry = {
      id: voices.length + 1,
      user_id: user_id || null,
      filename: filename || 'media.bin',
      file_url: url,
      created_at: new Date().toISOString(),
      type: 'media'
    };
    voices.push(entry);
    dataCache.save(voicesDataPath, voices);
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
  const voices = dataCache.load(voicesDataPath);
  if (user_id) {
    const uid = Number(user_id);
    return res.json(voices.filter(v => Number(v.user_id) === uid));
  }
  return res.json(voices);
};

// delete voice by id
export const deleteVoice = (req: Request, res: Response) => {
  const { id } = req.params;
  const voices = dataCache.load(voicesDataPath);
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

// ============================================================================
// 新增：声纹功能（与 Python AI 服务集成）
// ============================================================================

/**
 * 声纹提取与注册
 * POST /api/voices/enroll-with-embedding
 * 
 * Request:
 * {
 *   "user_id": 123,
 *   "audio_base64": "...",
 *   "filename": "voice.wav"
 * }
 */
export const enrollWithEmbedding = async (req: Request, res: Response) => {
  try {
    const { user_id, audio_base64, filename } = req.body;

    if (!user_id || !audio_base64) {
      return res.status(400).json({
        error: '缺少必需字段',
        required: ['user_id', 'audio_base64']
      });
    }

    console.log(`处理用户 ${user_id} 的声纹提取...`);

    // 1. 调用 Python AI 微服务提取声纹
    let embeddingResult;
    try {
      const response = await axios.post(
        `${VOICE_AI_SERVICE_URL}/api/voices/extract-embedding`,
        {
          user_id,
          audio_base64
        },
        { timeout: 60000 }
      );
      embeddingResult = response.data;
    } catch (error: any) {
      console.error('AI 服务调用失败:', error.message);
      return res.status(503).json({
        error: '声纹提取服务暂时不可用',
        details: error.message
      });
    }

    if (!embeddingResult.success) {
      return res.status(400).json({
        error: '声纹提取失败',
        details: embeddingResult.error
      });
    }

    // 2. 保存原始音频文件
    const audioUrl = saveBase64File(audio_base64, filename || 'voice.wav');

    // 3. 保存声纹信息到 JSON
    const profiles = dataCache.load(voiceProfilesPath);
    const existingProfileIndex = profiles.findIndex(p => p.user_id === user_id);

    const profile = {
      user_id,
      embedding: embeddingResult.embedding,
      embedding_dim: embeddingResult.embedding_dim,
      embedding_model: 'resemblyzer_v1',
      audio_sample_url: audioUrl,
      audio_duration: embeddingResult.audio_duration,
      voice_enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (existingProfileIndex >= 0) {
      profiles[existingProfileIndex] = profile;
    } else {
      profiles.push(profile);
    }

    dataCache.save(voiceProfilesPath, profiles);

    // 4. 同时保存到 voices 列表（兼容旧逻辑）
    const voices = dataCache.load(voicesDataPath);
    const entry = {
      id: voices.length + 1,
      user_id,
      filename: filename || 'voice.wav',
      file_url: audioUrl,
      embedding_id: user_id, // 关联到 voice_profile
      created_at: new Date().toISOString(),
      type: 'enrollment'
    };
    voices.push(entry);
    dataCache.save(voicesDataPath, voices);

    return res.status(201).json({
      success: true,
      user_id,
      embedding_dim: embeddingResult.embedding_dim,
      audio_duration: embeddingResult.audio_duration,
      audio_url: audioUrl,
      message: '声纹录入成功，可用于语音克隆'
    });
  } catch (error: any) {
    console.error('enrollWithEmbedding 异常:', error);
    return res.status(500).json({
      error: '声纹录入失败',
      details: error.message
    });
  }
};

/**
 * 获取用户声纹信息
 * GET /api/users/:user_id/voice-profile
 */
export const getUserVoiceProfile = (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const profiles = dataCache.load(voiceProfilesPath);
    const profile = profiles.find(p => p.user_id === Number(user_id));

    if (!profile) {
      return res.status(404).json({
        user_id: Number(user_id),
        has_voice_profile: false,
        voice_enabled: false
      });
    }

    // 不返回完整 embedding（安全考虑），仅返回元数据
    return res.json({
      user_id: profile.user_id,
      has_voice_profile: true,
      embedding_dim: profile.embedding_dim,
      embedding_model: profile.embedding_model,
      voice_enabled: profile.voice_enabled,
      audio_duration: profile.audio_duration,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    });
  } catch (error: any) {
    console.error('getUserVoiceProfile 异常:', error);
    return res.status(500).json({
      error: '获取声纹信息失败',
      details: error.message
    });
  }
};

/**
 * 语音克隆 - 生成基于用户声音的 TTS
 * POST /api/voices/generate-tts
 * 
 * Request:
 * {
 *   "post_id": 123,
 *   "user_id": 456,
 *   "text": "你好，这是我发布的帖子",
 *   "lang": "zh-CN"
 * }
 */
export const generateTTS = async (req: Request, res: Response) => {
  try {
    const { post_id, user_id, text, lang = 'zh-CN' } = req.body;

    if (!user_id || !text) {
      return res.status(400).json({
        error: '缺少必需字段',
        required: ['user_id', 'text']
      });
    }

    // 文本长度检查
    if (text.length > 500) {
      return res.status(400).json({
        error: '文本过长',
        message: `文本长度 ${text.length}，最多 500 字符`
      });
    }

    console.log(`为用户 ${user_id} 生成 TTS: ${text.substring(0, 30)}...`);

    // 1. 获取用户声纹信息
    const profiles = dataCache.load(voiceProfilesPath);
    const profile = profiles.find(p => p.user_id === user_id);

    if (!profile || !profile.voice_enabled) {
      return res.status(403).json({
        error: '用户没有启用语音克隆功能'
      });
    }

    // 2. 调用 Python AI 微服务生成语音
    let ttsResult;
    try {
      const response = await axios.post(
        `${VOICE_AI_SERVICE_URL}/api/voices/clone-tts`,
        {
          user_id,
          embedding: profile.embedding,
          text,
          lang
        },
        { timeout: 60000 }
      );
      ttsResult = response.data;
    } catch (error: any) {
      console.error('TTS 服务调用失败:', error.message);
      return res.status(503).json({
        error: 'TTS 服务暂时不可用',
        details: error.message
      });
    }

    if (!ttsResult.success) {
      return res.status(500).json({
        error: 'TTS 生成失败',
        details: ttsResult.error
      });
    }

    // 3. 保存生成的音频
    const generatedAudioUrl = saveBase64File(ttsResult.audio_base64, `tts_post_${post_id}.wav`);

    // 4. 更新 posts 信息
    if (post_id) {
      const posts = dataCache.load(postsDataPath);
      const postIndex = posts.findIndex((p: any) => p.post_id === Number(post_id));

      if (postIndex >= 0) {
        posts[postIndex] = {
          ...posts[postIndex],
          voice_url: generatedAudioUrl,
          voice_enabled: true,
          original_speaker_id: user_id,
          voice_generated_at: new Date().toISOString()
        };
        dataCache.save(postsDataPath, posts);
      }
    }

    return res.status(201).json({
      success: true,
      user_id,
      post_id,
      voice_url: generatedAudioUrl,
      duration: ttsResult.duration,
      sample_rate: ttsResult.sample_rate,
      message: 'TTS 生成成功'
    });
  } catch (error: any) {
    console.error('generateTTS 异常:', error);
    return res.status(500).json({
      error: 'TTS 生成失败',
      details: error.message
    });
  }
};

/**
 * 删除用户声纹信息
 * DELETE /api/users/:user_id/voice-profile
 */
export const deleteVoiceProfile = (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const profiles = dataCache.load(voiceProfilesPath);
    const idx = profiles.findIndex(p => p.user_id === Number(user_id));

    if (idx === -1) {
      return res.status(404).json({
        error: '声纹信息不存在'
      });
    }

    const removed = profiles[idx];
    profiles.splice(idx, 1);
    writeVoiceProfiles(profiles);

    // 删除相关的音频文件
    if (removed.audio_sample_url) {
      try {
        const parts = removed.audio_sample_url.split('/');
        const name = parts[parts.length - 1];
        const full = path.join(voicesFilesDir, name);
        if (fs.existsSync(full)) fs.unlinkSync(full);
      } catch (e) {
        console.warn('删除音频文件失败', e);
      }
    }

    return res.json({
      success: true,
      message: '声纹信息已删除'
    });
  } catch (error: any) {
    console.error('deleteVoiceProfile 异常:', error);
    return res.status(500).json({
      error: '删除失败',
      details: error.message
    });
  }
};

/**
 * 更新声纹使用权限
 * PATCH /api/users/:user_id/voice-profile
 * 
 * Request:
 * {
 *   "voice_enabled": false
 * }
 */
export const updateVoiceProfile = (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const { voice_enabled } = req.body;

    if (typeof voice_enabled !== 'boolean') {
      return res.status(400).json({
        error: 'voice_enabled 必须是 boolean 类型'
      });
    }

    const profiles = dataCache.load(voiceProfilesPath);
    const idx = profiles.findIndex(p => p.user_id === Number(user_id));

    if (idx === -1) {
      return res.status(404).json({
        error: '声纹信息不存在'
      });
    }

    profiles[idx].voice_enabled = voice_enabled;
    profiles[idx].updated_at = new Date().toISOString();
    writeVoiceProfiles(profiles);

    return res.json({
      success: true,
      message: `语音克隆已${voice_enabled ? '启用' : '禁用'}`,
      voice_enabled
    });
  } catch (error: any) {
    console.error('updateVoiceProfile 异常:', error);
    return res.status(500).json({
      error: '更新失败',
      details: error.message
    });
  }
};

export default {
  enroll,
  uploadMedia,
  serveVoiceFile,
  listVoices,
  deleteVoice,
  enrollWithEmbedding,
  getUserVoiceProfile,
  generateTTS,
  deleteVoiceProfile,
  updateVoiceProfile
};
