# Mock 后端性能诊断和优化指南

## 问题分析

### 可能的性能瓶颈

1. **文件 I/O 操作未优化**
   - 每次请求都从磁盘读取 JSON 文件
   - 没有内存缓存机制
   - 文件体积随数据增加而变大

2. **没有响应延迟模拟**
   - 虽然没有人为延迟，但文件 I/O 本身就慢
   - 生产环境会有网络延迟，mock 应该模拟

3. **没有分页实现**
   - 可能返回大量数据
   - 前端加载所有数据

4. **CORS 预检请求**
   - 每个请求前有 OPTIONS 预检
   - 可以优化预检缓存

5. **HTTP 超时设置**
   - 超时时间设置为 10000ms（10秒）
   - 对 mock 服务过长

## 快速诊断

### 检查点 1：Mock 服务是否启动

```bash
# 在另一个终端检查
curl -I http://localhost:7878/health
# 应该返回 200 OK
```

### 检查点 2：查看网络请求时间

在浏览器 DevTools → Network 面板中查看：
- **Time**：总耗时
- **Waterfall**：显示各阶段耗时
  - Queuing：排队
  - Stalled：停滞（DNS/TCP）
  - Initial connection / SSL：连接建立
  - Request sent：发送请求
  - Waiting (TTFB)：等待响应（服务器处理时间）
  - Content Download：下载内容

### 检查点 3：打开浏览器 DevTools → Performance

记录页面加载过程，查看：
- JavaScript 执行时间
- 网络瀑布图
- 主线程阻塞情况

## 优化方案

### 方案 A：加快 Mock 服务（推荐）

#### 1. 在内存中缓存数据

```typescript
// mock-backend-service/src/services/DataCache.ts
import fs from 'fs';
import path from 'path';

class DataCache {
  private cache: Map<string, any> = new Map();
  private lastModified: Map<string, number> = new Map();
  private readonly checkInterval = 1000; // 每 1 秒检查一次文件变化

  constructor() {
    setInterval(() => this.checkFileChanges(), this.checkInterval);
  }

  load(filePath: string): any {
    const absolutePath = path.resolve(filePath);
    const now = Date.now();
    const lastMod = this.lastModified.get(absolutePath) || 0;

    // 检查文件是否变化
    try {
      const stat = fs.statSync(absolutePath);
      if (stat.mtimeMs > lastMod) {
        const data = JSON.parse(fs.readFileSync(absolutePath, 'utf-8'));
        this.cache.set(absolutePath, data);
        this.lastModified.set(absolutePath, stat.mtimeMs);
      }
    } catch (error) {
      console.error('Cache load error:', error);
    }

    return this.cache.get(absolutePath) || [];
  }

  save(filePath: string, data: any): void {
    const absolutePath = path.resolve(filePath);
    fs.writeFileSync(absolutePath, JSON.stringify(data, null, 2));
    
    const stat = fs.statSync(absolutePath);
    this.cache.set(absolutePath, data);
    this.lastModified.set(absolutePath, stat.mtimeMs);
  }

  private checkFileChanges(): void {
    for (const [filePath, lastMod] of this.lastModified.entries()) {
      try {
        const stat = fs.statSync(filePath);
        if (stat.mtimeMs > lastMod) {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          this.cache.set(filePath, data);
          this.lastModified.set(filePath, stat.mtimeMs);
        }
      } catch (error) {
        // 文件不存在或读取失败，忽略
      }
    }
  }

  clear(): void {
    this.cache.clear();
    this.lastModified.clear();
  }
}

export default new DataCache();
```

#### 2. 更新控制器使用缓存

```typescript
// postController.ts
import dataCache from '../services/DataCache';

const dataPath = path.join(__dirname, '../data/posts.json');

export const getPosts = (req: Request, res: Response) => {
  const posts = dataCache.load(dataPath);
  res.json(posts);
};

export const getPostById = (req: Request, res: Response) => {
  const { id } = req.params;
  const posts = dataCache.load(dataPath);
  const post = posts.find((p: any) => p.post_id === parseInt(id));
  
  if (!post) {
    return res.status(404).json({ error: '帖子不存在' });
  }
  
  res.json(post);
};

export const createPost = (req: Request, res: Response) => {
  const { user_id, title, content, author, media_urls } = req.body;
  const posts = dataCache.load(dataPath);
  
  const newPost = {
    post_id: posts.length > 0 ? Math.max(...posts.map((p: any) => p.post_id)) + 1 : 1,
    user_id,
    title: title || '无标题',
    content,
    author: author || '匿名用户',
    media_urls: media_urls || [],
    like_count: 0,
    comment_count: 0,
    created_at: new Date().toISOString()
  };
  
  posts.unshift(newPost);
  dataCache.save(dataPath, posts);
  
  res.status(201).json(newPost);
};
```

#### 3. 实现分页

```typescript
// postController.ts
export const getPosts = (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  
  const posts = dataCache.load(dataPath);
  const total = posts.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  const paginatedPosts = posts.slice(start, end);
  
  // 设置分页响应头
  res.set('X-Total-Count', total.toString());
  res.set('X-Page', page.toString());
  res.set('X-PageSize', pageSize.toString());
  
  res.json(paginatedPosts);
};
```

#### 4. 优化 HTTP 超时

```javascript
// src/utils/http.js
const http = axios.create({
  baseURL: effectiveBaseURL(),
  timeout: 5000,  // 改为 5 秒，足够 mock 服务
  // ...
});
```

### 方案 B：模拟网络延迟（可选）

如果想测试网络延迟下的表现：

```typescript
// mock-backend-service/src/middleware/delay.ts
import { Request, Response, NextFunction } from 'express';

// 模拟网络延迟（可配置）
const MOCK_DELAY = process.env.MOCK_DELAY || 300; // 默认 300ms

export const delayMiddleware = (req: Request, res: Response, next: NextFunction) => {
  setTimeout(() => {
    next();
  }, parseInt(MOCK_DELAY as string));
};
```

```typescript
// server.ts
import { delayMiddleware } from './middleware/delay';

// 只在需要时启用
if (process.env.ENABLE_MOCK_DELAY === 'true') {
  app.use('/api', delayMiddleware);
}

app.use('/api', routes);
```

用法：
```bash
ENABLE_MOCK_DELAY=true MOCK_DELAY=500 npm run dev
```

### 方案 C：前端优化

#### 1. 添加加载骨架屏

```vue
<div v-if="loading && posts.length === 0" class="skeleton-list">
  <div v-for="i in 3" :key="i" class="skeleton-card">
    <!-- 骨架屏内容 -->
  </div>
</div>
```

#### 2. 虚拟滚动（处理大列表）

```bash
npm install vue-virtual-scroller
```

#### 3. 懒加载图片

```vue
<img v-lazy="post.image" />
```

## 完整性能优化清单

### 后端（Mock 服务）
- [ ] ✅ 实现内存缓存
- [ ] ✅ 添加分页支持
- [ ] ✅ 文件变化监听
- [ ] ✅ 压缩响应
- [ ] ✅ 设置正确的 Cache-Control 头

### 前端
- [ ] ✅ 减少 HTTP 请求次数
- [ ] ✅ 添加加载状态反馈
- [ ] ✅ 虚拟滚动处理大列表
- [ ] ✅ 图片懒加载
- [ ] ✅ 代码分割和异步加载

### 网络
- [ ] ✅ GZIP 压缩
- [ ] ✅ HTTP 2 Push
- [ ] ✅ CDN 缓存
- [ ] ✅ 预连接

## 性能指标目标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| 首屏加载时间 | < 2s | Lighthouse 标准 |
| 最大内容绘制 (LCP) | < 2.5s | Core Web Vitals |
| 首输入延迟 (FID) | < 100ms | Core Web Vitals |
| 累积布局偏移 (CLS) | < 0.1 | Core Web Vitals |
| 单个 API 响应时间 | < 500ms | Mock 服务 |

## 快速修复步骤

### 立即可做的（5 分钟）

1. **检查 Mock 服务是否运行**
   ```bash
   # 终端 1：
   cd mock-backend-service
   npm install
   npm run dev
   
   # 终端 2：
   curl http://localhost:7878/health
   ```

2. **降低 HTTP 超时时间**
   ```javascript
   // src/utils/http.js
   timeout: 5000  // 改为 5 秒
   ```

3. **检查浏览器 DevTools**
   - 打开 Network 面板
   - 查看哪个请求最慢
   - 查看 Waterfall 图分析瓶颈

### 短期优化（15 分钟）

1. 实现内存缓存（DataCache 类）
2. 添加分页支持
3. 优化 HTTP 超时

### 中期优化（1 小时）

1. 添加加载骨架屏
2. 虚拟滚动处理大列表
3. 图片懒加载

## 诊断命令

```bash
# 检查 mock 服务健康状态
curl -w "\nTime: %{time_total}s\n" http://localhost:7878/health

# 测试 API 响应时间
curl -w "\nTime: %{time_total}s\n" http://localhost:7878/api/posts

# 查看服务器资源占用
top -p $(lsof -t -i:7878)

# 查看网络连接
lsof -i:7878
netstat -antp | grep 7878
```

## 常见问题

### Q: 为什么 mock 比真实 API 还慢？
A: 通常是因为：
1. Mock 服务未启动
2. 每次文件 I/O 读取（未缓存）
3. 浏览器与 mock 服务的连接不稳定
4. 前端代码性能问题（如大量 DOM 操作）

### Q: 如何判断是前端还是后端慢？
A: 
1. 打开 DevTools → Network 面板
2. 查看 Response time（服务器处理时间）
3. 查看 Download time（下载时间）

### Q: 可以跳过 Mock 直接用真实 API 吗？
A:
```bash
# 切换到真实 API 模式
localStorage.setItem('VUE_APP_API_MODE', 'real');
```

## 总结

**最可能的原因：**
1. Mock 服务未启动或连接不上
2. 文件 I/O 操作没有缓存
3. 返回数据过多（未分页）

**快速解决方案：**
1. 确保 mock 服务运行：`cd mock-backend-service && npm run dev`
2. 实现内存缓存（DataCache）
3. 添加分页支持
4. 检查浏览器 DevTools 的确切瓶颈

如果需要我实现上述优化，请告诉我！
