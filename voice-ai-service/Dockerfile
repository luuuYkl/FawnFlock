FROM python:3.10-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖（librosa 和 TTS 需要）
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libsndfile1 \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 复制 requirements.txt
COPY requirements.txt .

# 安装 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY app.py .
COPY config.py .

# 创建必要的目录
RUN mkdir -p /app/uploads /app/generated /app/logs

# 暴露端口
EXPOSE 5000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# 启动应用
CMD ["gunicorn", "--workers", "2", "--worker-class", "sync", "--bind", "0.0.0.0:5000", "--timeout", "120", "app:app"]
