#!/bin/bash
set -e

echo "🛑 停止现有服务..."
pkill -f vue-cli-service || true
pkill -f ts-node-dev || true
lsof -ti:7878 | xargs -r kill || true
sleep 2

echo "🧹 清理缓存..."
rm -rf node_modules/.cache

echo "🚀 启动 Mock 后端..."
cd /workspaces/FawnFlock/mock-backend-service
npm run dev > /tmp/mock.log 2>&1 &
MOCK_PID=$!
echo "Mock 后端 PID: $MOCK_PID"
echo $MOCK_PID > /tmp/mock.pid

echo "⏳ 等待后端启动..."
sleep 3

echo "✅ 验证后端..."
curl -s http://127.0.0.1:7878/ | head -20 || echo "后端未响应"

echo ""
echo "📊 端口状态:"
ss -ltnp | grep 7878 || echo "7878 未监听"

echo ""
echo "✨ 后端已启动，日志文件: /tmp/mock.log"
echo "📝 查看日志: tail -f /tmp/mock.log"
echo ""
echo "🎯 下一步: 在另一个终端运行 'npm run serve' 启动前端"
