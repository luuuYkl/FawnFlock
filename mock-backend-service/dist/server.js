"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const morgan_1 = __importDefault(require("morgan"));
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 7878;
// CORS 配置 - 允许所有来源 (开发环境)
const corsOptions = {
    origin: true, // 允许所有来源
    credentials: true, // 允许携带凭证
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-api-mode', 'X-Api-Mode'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400 // 预检请求缓存时间 (24小时)
};
// Middleware
app.use((0, cors_1.default)(corsOptions));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
// Routes
app.use('/api', routes_1.default);
// Root path - API documentation
app.get('/', (req, res) => {
    res.json({
        name: 'FawnFlock Mock Backend API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: 'GET /health',
            users: {
                login: 'POST /api/users/login',
                register: 'POST /api/users/register'
            },
            posts: {
                list: 'GET /api/posts',
                detail: 'GET /api/posts/:id'
            }
        }
    });
});
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `路径 ${req.path} 不存在`,
        availableEndpoints: 'GET / 查看所有可用端点'
    });
});
const PORT_NUM = parseInt(String(PORT), 10);
app.listen(PORT_NUM, '0.0.0.0', () => {
    console.log(`🚀 Mock backend server running on http://localhost:${PORT_NUM}`);
    console.log(`📝 API endpoints available at http://localhost:${PORT_NUM}/api`);
    console.log(`📖 API documentation at http://localhost:${PORT_NUM}/`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ 端口 ${PORT_NUM} 已被占用，请执行: lsof -ti:${PORT_NUM} | xargs -r kill`);
        process.exit(1);
    }
    else {
        console.error('❌ 启动失败:', err);
    }
});
//# sourceMappingURL=server.js.map