require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// 中间件
// CORS配置 - 允许多个来源
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

// 动态添加局域网IP的前端地址
const os = require('os');
const interfaces = os.networkInterfaces();
for (const name of Object.keys(interfaces)) {
  for (const iface of interfaces[name]) {
    if (iface.family === 'IPv4' && !iface.internal) {
      allowedOrigins.push(`http://${iface.address}:5173`);
    }
  }
}

app.use(cors({
  origin: function(origin, callback) {
    // 允许没有origin的请求（比如移动应用、Postman等）
    if (!origin) return callback(null, true);
    
    // 检查origin是否在允许列表中
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // 开发环境允许所有来源
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// 数据库连接
require('./config/database');

// 路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const rechargeRoutes = require('./routes/recharge');
const searchRoutes = require('./routes/search');
const withdrawRoutes = require('./routes/withdraw');
const siteConfigRoutes = require('./routes/siteConfig');
const commissionRoutes = require('./routes/commission');
const contentRoutes = require('./routes/content');
const notificationRoutes = require('./routes/notification');
const systemConfigRoutes = require('./routes/systemConfig');
const databaseRoutes = require('./routes/database');
const faqRoutes = require('./routes/faq');
const topicRoutes = require('./routes/topic');
const advertisementRoutes = require('./routes/advertisement');
const shopRoutes = require('./routes/shop');
const exchangeRateRoutes = require('./routes/exchangeRate');
const rechargeCardRoutes = require('./routes/rechargeCard');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/recharge', rechargeRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/withdraw', withdrawRoutes);
app.use('/api/site-config', siteConfigRoutes);
app.use('/api/commission', commissionRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/system-config', systemConfigRoutes);
app.use('/api/databases', databaseRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/exchange-rate', exchangeRateRoutes);
app.use('/api/recharge-card', rechargeCardRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    bepusdt: {
      url: process.env.BEPUSDT_URL,
      merchantId: process.env.BEPUSDT_MERCHANT_ID
    }
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// 启动订单清理服务
const orderCleanupService = require('./services/orderCleanupService');
orderCleanupService.start();

// 启动服务器
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0'; // 监听所有网络接口

// 获取本机IP地址（os模块已在文件开头引入）
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // 跳过内部和非IPv4地址
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const server = app.listen(PORT, HOST, () => {
  const localIP = getLocalIP();
  
  console.log('\n' + '='.repeat(60));
  console.log('🚀 知识库系统后端服务器启动成功');
  console.log('='.repeat(60));
  console.log(`📡 本地访问: http://localhost:${PORT}`);
  console.log(`📡 局域网访问: http://${localIP}:${PORT}`);
  console.log(`🌍 环境: ${process.env.NODE_ENV}`);
  console.log(`💳 BEpusdt: ${process.env.BEPUSDT_URL}`);
  console.log(`🏪 商户ID: ${process.env.BEPUSDT_MERCHANT_ID}`);
  console.log(`🔗 前端地址: ${process.env.FRONTEND_URL}`);
  console.log('='.repeat(60));
  console.log('📋 可用端点:');
  console.log('  认证相关:');
  console.log('    - POST /api/auth/register');
  console.log('    - POST /api/auth/login');
  console.log('    - GET  /api/auth/me');
  console.log('    - POST /api/auth/claim-daily-points');
  console.log('  用户相关:');
  console.log('    - GET  /api/user/profile');
  console.log('    - PUT  /api/user/profile');
  console.log('    - GET  /api/user/balance-logs');
  console.log('    - GET  /api/user/referral-stats');
  console.log('  充值相关:');
  console.log('    - POST /api/recharge/create');
  console.log('    - GET  /api/recharge/query/:orderId');
  console.log('    - GET  /api/recharge/history/:userId');
  console.log('    - POST /api/recharge/webhook');
  console.log('  其他:');
  console.log('    - GET  /health');
  console.log('='.repeat(60));
  console.log('\n💡 提示:');
  console.log(`  - 局域网内其他设备可通过 http://${localIP}:${PORT} 访问`);
  console.log(`  - BEpusdt Webhook可配置为: http://${localIP}:${PORT}/api/recharge/webhook`);
  console.log('='.repeat(60));
  console.log('\n✅ 服务器就绪，等待请求...\n');
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
