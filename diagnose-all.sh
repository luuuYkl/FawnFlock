#!/bin/bash
set +e

echo "======================================"
echo "  FawnFlock 项目全面诊断"
echo "======================================"
echo ""

echo "1. 项目结构:"
tree -L 2 -I 'node_modules|dist' .
echo ""

echo "2. 当前进程:"
ps aux | grep -E "vue-cli-service|node|ts-node" | grep -v grep
echo ""

echo "3. 端口占用:"
lsof -i:8080 -i:7878 2>/dev/null || echo "  无端口占用"
echo ""

echo "4. App.vue 完整内容:"
echo "--- BEGIN App.vue ---"
cat src/App.vue
echo "--- END App.vue ---"
echo ""

echo "5. 路由配置完整内容:"
echo "--- BEGIN router/index.js ---"
cat src/router/index.js
echo "--- END router/index.js ---"
echo ""

echo "6. main.js 完整内容:"
echo "--- BEGIN main.js ---"
cat src/main.js
echo "--- END main.js ---"
echo ""

echo "7. API 配置:"
if [ -f src/config/api.config.js ]; then
  echo "--- BEGIN api.config.js ---"
  cat src/config/api.config.js
  echo "--- END api.config.js ---"
else
  echo "  api.config.js 不存在"
fi
echo ""

echo "8. HTTP 客户端:"
if [ -f src/utils/http.js ]; then
  echo "--- BEGIN http.js ---"
  cat src/utils/http.js
  echo "--- END http.js ---"
else
  echo "  http.js 不存在"
fi
echo ""

echo "9. 环境配置:"
echo "  .env.local:"
cat .env.local 2>/dev/null || echo "    文件不存在"
echo "  .env.development:"
cat .env.development 2>/dev/null || echo "    文件不存在"
echo ""

echo "10. DevTools 组件:"
if [ -d src/components/DevTools ]; then
  ls -la src/components/DevTools/
  if [ -f src/components/DevTools/ApiModeSwitcher.vue ]; then
    echo "--- BEGIN ApiModeSwitcher.vue ---"
    cat src/components/DevTools/ApiModeSwitcher.vue
    echo "--- END ApiModeSwitcher.vue ---"
  fi
else
  echo "  DevTools 目录不存在"
fi
echo ""

echo "11. package.json scripts:"
cat package.json | grep -A 10 '"scripts"'
echo ""

echo "12. vue.config.js:"
if [ -f vue.config.js ]; then
  echo "--- BEGIN vue.config.js ---"
  cat vue.config.js
  echo "--- END vue.config.js ---"
else
  echo "  vue.config.js 不存在"
fi
echo ""

echo "13. 检查可能导致循环的代码:"
echo "  路由跳转:"
grep -rn "router.push\|router.replace" src/views/ src/components/ 2>/dev/null | head -20
echo ""
echo "  mounted/created 钩子:"
grep -rn "mounted()\|created()" src/views/ src/components/ 2>/dev/null | head -20
echo ""
echo "  watch 监听:"
grep -rn "watch:" src/views/ src/components/ 2>/dev/null | head -20
echo ""

echo "14. Mock 后端状态:"
if [ -d mock-backend-service ]; then
  echo "  Mock 后端目录存在"
  cd mock-backend-service
  echo "  package.json scripts:"
  cat package.json | grep -A 5 '"scripts"'
  cd ..
else
  echo "  Mock 后端目录不存在"
fi
echo ""

echo "======================================"
echo "  诊断完成"
echo "======================================"
