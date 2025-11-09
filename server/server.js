// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');


// 加载环境变量
dotenv.config();

// 导入并初始化双数据库连接
// 这一步会执行 config/db.js 中的连接逻辑
require('./config/db'); 

const app = express();

// ------------------
// 中间件配置
// ------------------

// 跨域资源共享 (CORS) 配置
const CLIENT_URL = process.env.CLIENT_URL; // 从 .env 获取前端 URL

const corsOptions = {
    // 限制只允许前端 URL 访问。如果您本地测试前端，可能需要修改为您前端的端口，例如 http://localhost:5173
    origin: CLIENT_URL, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};
// 生产环境应严格限制，开发环境如果您遇到问题，可以暂时改为 app.use(cors())
app.use(cors(corsOptions)); 

// 解析 JSON 格式的请求体
app.use(express.json()); 

// ------------------
// 路由定义
// ------------------

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user'); // 需要创建
const adminRoutes = require('./routes/admin'); // 新增

app.use('/api/auth', authRoutes); // 认证相关的路由 (注册、登录、验证邮箱)
app.use('/api/user', userRoutes); // 用户仪表盘、搜索、佣金等私有数据路由

app.use('/api/admin', adminRoutes); // 新增管理员路由

// 基础测试路由
app.get('/', (req, res) => {
    res.json({
        message: 'Data Platform Backend API is running!',
        environment: process.env.NODE_ENV || 'development'
    });
});

// ------------------
// 错误处理中间件 (可选但推荐)
// ------------------
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Internal Server Error',
        error: err.message
    });
});

// ------------------
// 启动服务器
// ------------------

// 优先使用 .env 中的 PORT，否则使用 5000
const PORT = process.env.PORT || 5000; 

app.listen(PORT, console.log(`Server running on port ${PORT}. Client URL allowed: ${CLIENT_URL}`));