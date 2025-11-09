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
const { dbManager, initializeDatabase } = require('./config/database');

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
const ticketRoutes = require('./routes/tickets');
const emailTemplateRoutes = require('./routes/emailTemplates');
const referralRoutes = require('./routes/referral');
const systemRoutes = require('./routes/system');
const adminRoutes = require('./routes/admin');

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
app.use('/api/tickets', ticketRoutes);
app.use('/api/email-templates', emailTemplateRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/admin', adminRoutes);

// 静态文件服务 - 提供前端构建文件
const path = require('path');
const distPath = path.join(__dirname, '..', 'dist');

// 检查是否存在构建文件
const fs = require('fs');
if (fs.existsSync(distPath)) {
  console.log('✅ 找到前端构建文件，启用静态文件服务');
  
  // 提供静态文件
  app.use(express.static(distPath));
  
  // SPA路由处理 - 所有非API请求都返回index.html
  app.get('*', (req, res, next) => {
    // 跳过API请求和health检查
    if (req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.log('⚠️  未找到前端构建文件，仅提供API服务');
  console.log(`   期望路径: ${distPath}`);
  console.log('   请运行: npm run build');
}

// 健康检查（增强版）
app.get('/health', (req, res) => {
  const userConn = dbManager.getUserConnection();
  const queryConns = dbManager.getAllQueryConnections();
  
  // 检查用户数据库连接状态
  const userDbStatus = userConn ? {
    connected: userConn.readyState === 1,
    readyState: userConn.readyState,
    name: userConn.name,
    host: userConn.host,
    port: userConn.port
  } : {
    connected: false,
    message: '未配置用户数据库'
  };
  
  // 检查查询数据库连接状态
  const queryDbStatus = queryConns.map(conn => ({
    id: conn.id,
    name: conn.name,
    connected: conn.readyState === 1,
    readyState: conn.readyState,
    host: conn.host,
    port: conn.port
  }));
  
  // 整体健康状态
  const isHealthy = userDbStatus.connected && 
                   (queryConns.length === 0 || queryDbStatus.every(q => q.connected));
  
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    databases: {
      user: userDbStatus,
      query: queryDbStatus
    },
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

// 初始化备份、版本和升级服务
const backupService = require('./services/backupService');
const versionService = require('./services/versionService');
const upgradeService = require('./services/upgradeService');

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
  
  // 延迟初始化备份、版本和升级服务（等待数据库连接完成）
  setTimeout(async () => {
    try {
      await backupService.init();
      await upgradeService.init();
      await versionService.initVersion();
      console.log('✅ 备份、版本和升级服务初始化完成\n');
    } catch (error) {
      console.error('❌ 服务初始化失败:', error.message);
    }
  }, 3000); // 延迟3秒
});

// 优雅关闭
async function gracefulShutdown(signal) {
  console.log(`\n${signal} signal received: starting graceful shutdown`);
  
  // 1. 停止接受新请求
  server.close(async () => {
    console.log('✅ HTTP server closed');
    
    try {
      // 2. 关闭所有数据库连接
      console.log('🔄 Closing database connections...');
      await dbManager.closeAll();
      console.log('✅ All database connections closed');
      
      // 3. 停止订单清理服务
      if (orderCleanupService && orderCleanupService.stop) {
        orderCleanupService.stop();
        console.log('✅ Order cleanup service stopped');
      }
      
      console.log('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });
  
  // 如果10秒后还没关闭，强制退出
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
