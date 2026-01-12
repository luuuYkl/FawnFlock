"""
FawnFlock 声纹 AI 微服务
集成 Resemblyzer（声纹提取）和 YourTTS（语音克隆）
"""

import os
import json
import logging
from pathlib import Path
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import numpy as np
import librosa
import soundfile as sf
from io import BytesIO
import base64
from datetime import datetime

# 声纹提取模型
from resemblyzer import VoiceEncoder, preprocess_wav

# TTS 模型
from TTS.api import TTS

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 加载环境变量
load_dotenv()

# 初始化 Flask
app = Flask(__name__)
CORS(app)

# 配置
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB 限制
UPLOAD_DIR = Path(os.getenv('UPLOAD_DIR', './uploads'))
GENERATED_DIR = Path(os.getenv('GENERATED_DIR', './generated'))
UPLOAD_DIR.mkdir(exist_ok=True)
GENERATED_DIR.mkdir(exist_ok=True)

# 全局模型实例（首次加载时初始化）
voice_encoder = None
tts_model = None


def get_voice_encoder():
    """获取或初始化声纹编码器"""
    global voice_encoder
    if voice_encoder is None:
        logger.info("初始化 VoiceEncoder...")
        try:
            voice_encoder = VoiceEncoder()
            logger.info("VoiceEncoder 初始化成功")
        except Exception as e:
            logger.error(f"VoiceEncoder 初始化失败: {e}")
            raise
    return voice_encoder


def get_tts_model():
    """获取或初始化 TTS 模型"""
    global tts_model
    if tts_model is None:
        logger.info("初始化 YourTTS 模型...")
        try:
            # 使用 YourTTS 模型（支持多说话人和零样本学习）
            tts_model = TTS(
                model_name="tts_models/multilingual/multi-dataset/your_tts",
                gpu=True,  # 如果有 GPU，启用 CUDA
                progress_bar=False
            )
            logger.info("YourTTS 模型初始化成功")
        except Exception as e:
            logger.warning(f"YourTTS 初始化失败（尝试 CPU 模式）: {e}")
            tts_model = TTS(
                model_name="tts_models/multilingual/multi-dataset/your_tts",
                gpu=False,
                progress_bar=False
            )
            logger.info("YourTTS 已在 CPU 模式下初始化")
    return tts_model


def load_audio_from_base64(audio_base64: str, sample_rate: int = 16000) -> tuple:
    """
    从 Base64 解码并加载音频
    
    返回: (audio_array, sample_rate)
    """
    try:
        # 解码 Base64
        audio_bytes = base64.b64decode(audio_base64)
        
        # 使用 librosa 加载音频
        audio, sr = librosa.load(BytesIO(audio_bytes), sr=sample_rate, mono=True)
        return audio, sr
    except Exception as e:
        logger.error(f"音频加载失败: {e}")
        raise ValueError(f"无法加载音频: {e}")


def audio_to_base64(audio_array: np.ndarray, sr: int = 16000) -> str:
    """
    将音频数组转换为 Base64
    """
    buffer = BytesIO()
    sf.write(buffer, audio_array, sr, format='WAV')
    buffer.seek(0)
    return base64.b64encode(buffer.read()).decode('utf-8')


# ============================================================================
# 路由定义
# ============================================================================

@app.route('/health', methods=['GET'])
def health():
    """健康检查端点"""
    return jsonify({"status": "ok", "service": "fawnflock-voice-ai"}), 200


@app.route('/api/voices/extract-embedding', methods=['POST'])
def extract_embedding():
    """
    声纹提取接口
    
    Request:
    {
        "audio_base64": "...",
        "user_id": 123
    }
    
    Response:
    {
        "success": true,
        "user_id": 123,
        "embedding": [0.123, -0.456, ...],
        "embedding_dim": 256,
        "audio_duration": 3.5,
        "timestamp": "2026-01-12T10:00:00Z"
    }
    """
    try:
        data = request.get_json()
        audio_base64 = data.get('audio_base64')
        user_id = data.get('user_id')
        
        if not audio_base64:
            return jsonify({"error": "缺少 audio_base64"}), 400
        
        logger.info(f"处理用户 {user_id} 的声纹提取请求...")
        
        # 加载音频
        audio, sr = load_audio_from_base64(audio_base64)
        duration = len(audio) / sr
        
        # 检查音频长度
        if duration < 10:
            return jsonify({
                "error": "音频过短",
                "message": f"音频时长 {duration:.2f}秒，最少需要 10 秒",
                "duration": duration
            }), 400
        
        if duration > 120:
            logger.warning(f"音频过长，截断至 120 秒")
            audio = audio[:120 * sr]
        
        # 提取声纹
        encoder = get_voice_encoder()
        wav = preprocess_wav(audio, sr)
        embedding = encoder.embed_utterance(wav)
        
        # 转换为列表（便于 JSON 序列化）
        embedding_list = embedding.tolist()
        
        # 保存音频文件
        timestamp = datetime.now().isoformat()
        audio_filename = f"user_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.wav"
        audio_path = UPLOAD_DIR / audio_filename
        sf.write(audio_path, audio, sr)
        
        response = {
            "success": True,
            "user_id": user_id,
            "embedding": embedding_list,
            "embedding_dim": len(embedding_list),
            "audio_duration": round(duration, 2),
            "audio_url": f"/api/voices/audio/{audio_filename}",
            "timestamp": timestamp
        }
        
        logger.info(f"声纹提取成功: 用户 {user_id}, 维度 {len(embedding_list)}")
        return jsonify(response), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"声纹提取异常: {e}")
        return jsonify({"error": f"处理失败: {e}"}), 500


@app.route('/api/voices/clone-tts', methods=['POST'])
def clone_tts():
    """
    语音克隆接口（TTS）
    
    Request:
    {
        "user_id": 123,
        "embedding": [0.123, -0.456, ...],
        "text": "你好，这是我发布的帖子",
        "lang": "zh-CN",
        "speed": 1.0
    }
    
    Response:
    {
        "success": true,
        "audio_base64": "...",
        "duration": 3.2,
        "timestamp": "2026-01-12T10:00:00Z"
    }
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        embedding = data.get('embedding')
        text = data.get('text')
        lang = data.get('lang', 'zh-CN')
        speed = data.get('speed', 1.0)
        
        if not all([embedding, text]):
            return jsonify({"error": "缺少 embedding 或 text"}), 400
        
        # 文本长度限制
        if len(text) > 500:
            return jsonify({
                "error": "文本过长",
                "message": f"文本长度 {len(text)}, 最多 500 字符"
            }), 400
        
        logger.info(f"处理用户 {user_id} 的 TTS 请求: {text[:50]}...")
        
        # 转换嵌入为 numpy 数组
        embedding_array = np.array(embedding, dtype=np.float32)
        
        # 获取 TTS 模型
        tts = get_tts_model()
        
        # 生成语音
        # YourTTS 支持使用预定义的说话人嵌入
        wav = tts.tts(text=text, speaker_embeddings=embedding_array, language=lang.split('-')[0].lower())
        
        # 获取采样率（通常是 22050 或 44100）
        sr = tts.synthesizer.output_sample_rate
        
        # 计算时长
        duration = len(wav) / sr if isinstance(wav, np.ndarray) else len(wav) / sr
        
        # 转换为 Base64
        audio_base64 = audio_to_base64(wav, sr)
        
        # 保存文件
        timestamp = datetime.now().isoformat()
        audio_filename = f"tts_user_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.wav"
        audio_path = GENERATED_DIR / audio_filename
        sf.write(audio_path, wav, sr)
        
        response = {
            "success": True,
            "user_id": user_id,
            "audio_base64": audio_base64,
            "duration": round(duration, 2),
            "sample_rate": sr,
            "audio_url": f"/api/voices/generated/{audio_filename}",
            "timestamp": timestamp
        }
        
        logger.info(f"TTS 生成成功: 用户 {user_id}, 时长 {duration:.2f}秒")
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"TTS 生成异常: {e}")
        return jsonify({"error": f"处理失败: {e}"}), 500


@app.route('/api/voices/audio/<filename>', methods=['GET'])
def serve_audio(filename):
    """提供音频文件下载"""
    try:
        file_path = UPLOAD_DIR / filename
        if not file_path.exists():
            return jsonify({"error": "文件不存在"}), 404
        return send_file(file_path, mimetype='audio/wav')
    except Exception as e:
        logger.error(f"文件访问异常: {e}")
        return jsonify({"error": "文件访问失败"}), 500


@app.route('/api/voices/generated/<filename>', methods=['GET'])
def serve_generated(filename):
    """提供生成的音频文件下载"""
    try:
        file_path = GENERATED_DIR / filename
        if not file_path.exists():
            return jsonify({"error": "文件不存在"}), 404
        return send_file(file_path, mimetype='audio/wav')
    except Exception as e:
        logger.error(f"文件访问异常: {e}")
        return jsonify({"error": "文件访问失败"}), 500


@app.errorhandler(413)
def request_entity_too_large(error):
    """处理文件过大错误"""
    return jsonify({"error": "文件过大，最大 10MB"}), 413


@app.errorhandler(500)
def internal_error(error):
    """处理内部错误"""
    logger.error(f"内部错误: {error}")
    return jsonify({"error": "内部服务器错误"}), 500


# ============================================================================
# 启动
# ============================================================================

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug,
        use_reloader=False  # 多进程环境中禁用重新加载
    )
