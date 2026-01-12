#!/bin/bash

# FawnFlock 声纹功能快速启动脚本
# 用于开发环境启动所有必要的服务

set -e

echo "=========================================="
echo "🎤 FawnFlock 声纹功能开发环境启动"
echo "=========================================="

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查必要的工具
check_command() {
  if ! command -v $1 &> /dev/null; then
    echo -e "${RED}✗ 缺少必要工具: $1${NC}"
    return 1
  else
    echo -e "${GREEN}✓ 已找到: $1${NC}"
  fi
}

echo -e "\n${BLUE}1. 检查环境...${NC}"
check_command "node" || exit 1
check_command "npm" || exit 1
check_command "python3" || exit 1

echo -e "\n${BLUE}2. 准备 Python 虚拟环境...${NC}"
if [ ! -d "voice-ai-service/venv" ]; then
  echo "创建虚拟环境..."
  python3 -m venv voice-ai-service/venv
fi

source voice-ai-service/venv/bin/activate
echo -e "${GREEN}✓ 虚拟环境已激活${NC}"

echo -e "\n${BLUE}3. 安装 Python 依赖...${NC}"
pip install -q -r voice-ai-service/requirements.txt
echo -e "${GREEN}✓ Python 依赖已安装${NC}"

echo -e "\n${BLUE}4. 安装 Node.js 依赖...${NC}"
npm install --legacy-peer-deps > /dev/null 2>&1 || npm install > /dev/null 2>&1
npm install --legacy-peer-deps -C mock-backend-service > /dev/null 2>&1 || npm install -C mock-backend-service > /dev/null 2>&1
echo -e "${GREEN}✓ Node.js 依赖已安装${NC}"

echo -e "\n${BLUE}5. 启动服务...${NC}"

# 启动 Python AI 服务
echo -e "${YELLOW}启动 Python AI 服务 (端口 5000)...${NC}"
cd voice-ai-service
python app.py > /tmp/voice-ai.log 2>&1 &
VOICE_AI_PID=$!
cd ..
echo -e "${GREEN}✓ Python AI 服务启动 (PID: $VOICE_AI_PID)${NC}"

sleep 2

# 启动 Mock 后端
echo -e "${YELLOW}启动 Mock 后端 (端口 3000)...${NC}"
cd mock-backend-service
export VOICE_AI_SERVICE_URL=http://localhost:5000
npm run dev > /tmp/mock-backend.log 2>&1 &
MOCK_BACKEND_PID=$!
cd ..
echo -e "${GREEN}✓ Mock 后端启动 (PID: $MOCK_BACKEND_PID)${NC}"

sleep 2

# 启动前端
echo -e "${YELLOW}启动前端开发服务器 (端口 8080)...${NC}"
npm run serve > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓ 前端启动 (PID: $FRONTEND_PID)${NC}"

echo -e "\n=========================================="
echo -e "${GREEN}✓ 所有服务已启动！${NC}"
echo -e "=========================================="
echo ""
echo "📋 服务地址："
echo -e "  前端：        ${BLUE}http://localhost:8080${NC}"
echo -e "  Mock 后端：   ${BLUE}http://localhost:3000${NC}"
echo -e "  Python AI：   ${BLUE}http://localhost:5000${NC}"
echo ""
echo "📝 日志文件："
echo "  /tmp/voice-ai.log"
echo "  /tmp/mock-backend.log"
echo "  /tmp/frontend.log"
echo ""
echo "🛑 停止服务："
echo "  kill $VOICE_AI_PID  # Python AI"
echo "  kill $MOCK_BACKEND_PID  # Mock 后端"
echo "  kill $FRONTEND_PID  # 前端"
echo ""
echo "⚠️  按 Ctrl+C 停止所有服务"
echo "=========================================="

# 保存 PID 以便后续关闭
echo "$VOICE_AI_PID" > /tmp/fawnflock-pids.txt
echo "$MOCK_BACKEND_PID" >> /tmp/fawnflock-pids.txt
echo "$FRONTEND_PID" >> /tmp/fawnflock-pids.txt

# 等待信号
wait_for_signal() {
  trap "
    echo ''
    echo -e '${YELLOW}正在关闭服务...${NC}'
    kill $VOICE_AI_PID 2>/dev/null || true
    kill $MOCK_BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    deactivate 2>/dev/null || true
    echo -e '${GREEN}✓ 所有服务已关闭${NC}'
    exit 0
  " SIGINT SIGTERM
  
  # 检查进程是否还在运行
  while kill -0 $VOICE_AI_PID 2>/dev/null || kill -0 $MOCK_BACKEND_PID 2>/dev/null || kill -0 $FRONTEND_PID 2>/dev/null; do
    sleep 1
  done
}

wait_for_signal
