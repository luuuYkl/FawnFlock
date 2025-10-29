#!/bin/bash
set -e

MODE="${1:-mock}"
ENV_FILE=".env.local"

case "$MODE" in
  mock)
    {
      echo "VUE_APP_API_MODE=mock"
      echo "VUE_APP_MOCK_API_URL=http://localhost:7878"
      echo "VUE_APP_REAL_API_URL=http://127.0.0.1:7878"
    } > "$ENV_FILE"
    echo "✅ 已切换到 Mock 模式"
    ;;
  real)
    {
      echo "VUE_APP_API_MODE=real"
      echo "VUE_APP_REAL_API_URL=http://127.0.0.1:7878"
      echo "VUE_APP_MOCK_API_URL=http://localhost:7878"
    } > "$ENV_FILE"
    echo "✅ 已切换到 Real 模式"
    ;;
  *)
    echo "❌ 无效模式: $MODE (使用 mock 或 real)"
    exit 1
    ;;
esac

echo "📝 当前配置:"
cat "$ENV_FILE"
echo ""
echo "🚀 请重启前端开发服务器: npm run serve"
