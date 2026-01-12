FROM node:18-alpine

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm install --legacy-peer-deps

# 复制源代码
COPY . .

# 编译 TypeScript
RUN npm run build 2>/dev/null || true

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/posts', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# 启动应用
CMD ["npm", "run", "dev"]
