"""
FawnFlock 声纹 AI 微服务 - 配置文件
"""

import os
from pathlib import Path

# 基础目录
BASE_DIR = Path(__file__).parent.resolve()

# Flask 配置
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
TESTING = os.getenv('TESTING', 'False').lower() == 'true'

# 服务配置
PORT = int(os.getenv('PORT', 5000))
HOST = os.getenv('HOST', '0.0.0.0')
SERVICE_NAME = 'FawnFlock Voice AI Service'
SERVICE_VERSION = '1.0.0'

# 文件存储配置
UPLOAD_DIR = Path(os.getenv('UPLOAD_DIR', BASE_DIR / 'uploads'))
GENERATED_DIR = Path(os.getenv('GENERATED_DIR', BASE_DIR / 'generated'))
MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10MB

# 音频处理配置
AUDIO_SAMPLE_RATE = 16000  # Hz
AUDIO_MIN_DURATION = 10  # seconds
AUDIO_MAX_DURATION = 120  # seconds

# 文本限制配置
TTS_MAX_TEXT_LENGTH = 500  # characters

# 模型配置
VOICE_ENCODER_MODEL = 'resemblyzer'  # 声纹编码器
TTS_MODEL_NAME = 'tts_models/multilingual/multi-dataset/your_tts'  # TTS 模型
DEVICE = 'cuda' if os.getenv('USE_GPU', 'False').lower() == 'true' else 'cpu'

# CORS 配置
CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')

# 后端服务连接（如果需要调用 Rust 后端）
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:8000')
BACKEND_API_KEY = os.getenv('BACKEND_API_KEY', '')

# 日志配置
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
LOG_FILE = os.getenv('LOG_FILE', BASE_DIR / 'logs' / 'app.log')

# 确保目录存在
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
GENERATED_DIR.mkdir(parents=True, exist_ok=True)
Path(LOG_FILE).parent.mkdir(parents=True, exist_ok=True)
