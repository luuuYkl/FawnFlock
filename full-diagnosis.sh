#!/bin/bash
echo "======================================"
echo "  FawnFlock 完整项目诊断"
echo "======================================"
echo ""

echo "=== 1. 项目结构 ==="
tree -a -L 3 -I 'node_modules|dist|.git' . 2>/dev/null || ls -laR | head -200

echo ""
echo "=== 2. Git 状态 ==="
git status --porcelain

echo ""
echo "=== 3. 关键文件内容 ==="
echo "--- src/main.js ---"
cat src/main.js 2>/dev/null || echo "文件不存在"

echo ""
echo "--- src/App.vue ---"
cat src/App.vue 2>/dev/null || echo "文件不存在"

echo ""
echo "--- src/router/index.js ---"
cat src/router/index.js 2>/dev/null || echo "文件不存在"

echo ""
echo "--- src/config/api.config.js ---"
cat src/config/api.config.js 2>/dev/null || echo "文件不存在"

echo ""
echo "--- .env.local ---"
cat .env.local 2>/dev/null || echo "文件不存在"

echo ""
echo "--- devcontainer.json ---"
cat devcontainer.json 2>/dev/null || echo "文件不存在"

echo ""
echo "--- vue.config.js ---"
cat vue.config.js 2>/dev/null || echo "文件不存在"

echo ""
echo "=== 4. 服务状态 ==="
echo "端口监听:"
ss -ltnp | grep -E '7878|8080' || echo "无相关端口监听"

echo ""
echo "进程:"
ps aux | grep -E 'vue-cli-service|ts-node-dev|node.*mock' | grep -v grep || echo "无相关进程"

echo ""
echo "Mock 后端日志 (最后 50 行):"
tail -n 50 /tmp/mock.log 2>/dev/null || echo "无日志文件"

echo ""
echo "=== 5. 环境变量 ==="
echo "CODESPACE_NAME=${CODESPACE_NAME:-未设置}"
echo "NODE_ENV=${NODE_ENV:-未设置}"

echo ""
echo "======================================"
echo "  诊断完成"
echo "======================================"
