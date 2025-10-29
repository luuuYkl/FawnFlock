# FawnFlock 项目验证指南

## ✅ 当前状态

### 后端 (Mock)
- 端口: 7878
- 状态: ✅ 运行中
- URL: https://terrible-spooky-incantation-7vjrvrwjqjrqcxwr4-7878.app.github.dev

### 前端 (Vue)
- 端口: 8080
- 状态: ✅ 运行中
- URL: https://terrible-spooky-incantation-7vjrvrwjqjrqcxwr4-8080.app.github.dev

## 🔧 关键修复

1. **API 配置优先级** - 现在运行时检测的 Codespace 域名优先于环境变量
2. **Mock 后端根路径** - 返回 200 OK 和 API 文档
3. **错误处理** - 端口占用时给出明确提示

## 📝 浏览器验证步骤

1. 打开前端页面: https://terrible-spooky-incantation-7vjrvrwjqjrqcxwr4-8080.app.github.dev

2. 按 F12 打开开发者工具，在 Console 执行:
```javascript
window.__logApiBase()
```

**期望输出**: 
```
[API Base URL] https://terrible-spooky-incantation-7vjrvrwjqjrqcxwr4-7878.app.github.dev
```

3. 如果仍显示 `http://localhost:7878`，刷新页面:
```javascript
location.reload();
```

4. 测试注册功能，在 Network 面板查看请求应指向:
```
https://terrible-spooky-incantation-7vjrvrwjqjrqcxwr4-7878.app.github.dev/api/users/register
```

## 🚨 重要提示

### 确保端口 7878 为 Public
在 VS Code 左侧 Ports 面板:
- 找到 7878 行
- 点击右键 → "Make Public" 或 "Change Port Visibility" → "Public"

### 如果请求仍被拒绝
1. 清除浏览器 localStorage:
```javascript
localStorage.clear();
location.reload();
```

2. 检查 Network 面板中请求的完整 URL
3. 确认 Ports 面板中 7878 的 Visibility 为 "Public"

## 📊 调试命令

### 容器内检查
```bash
# 查看端口监听
ss -ltnp | grep -E '7878|8080'

# 查看进程
ps aux | grep -E 'vue-cli|ts-node'

# 测试后端
curl -I http://127.0.0.1:7878/

# 查看日志
tail -f /tmp/mock.log
tail -f /tmp/frontend.log
```

### 浏览器 Console
```javascript
// 查看当前 API baseURL
window.__logApiBase()

// 查看当前域名
console.log(window.location.hostname)

// 强制刷新 API 配置
localStorage.clear(); location.reload();
```

## 🎯 下一步

修复完成后，测试注册功能应该可以正常工作了！
