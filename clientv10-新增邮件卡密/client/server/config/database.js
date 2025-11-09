const mongoose = require('mongoose');

// 数据库连接选项
const connectionOptions = {
  serverSelectionTimeoutMS: 30000, // 服务器选择超时：30秒（增加超时时间）
  socketTimeoutMS: 45000,          // Socket超时：45秒
  connectTimeoutMS: 30000,         // 连接超时：30秒
  maxPoolSize: 10,                 // 最大连接池大小
  minPoolSize: 2,                  // 最小连接池大小
  retryWrites: true,               // 自动重试写操作
  retryReads: true,                // 自动重试读操作
  bufferCommands: false,           // 禁用命令缓冲，立即返回错误而不是等待
};

// 用户数据库连接
const userConnection = mongoose.createConnection(process.env.USER_MONGO_URI, connectionOptions);

userConnection.on('connected', () => {
  console.log('✅ 用户数据库连接成功');
});

userConnection.on('error', (err) => {
  console.error('❌ 用户数据库连接失败:', err.message);
});

userConnection.on('disconnected', () => {
  console.warn('⚠️  用户数据库连接断开');
});

// 查询数据库连接
const queryConnection = mongoose.createConnection(process.env.QUERY_MONGO_URI, connectionOptions);

queryConnection.on('connected', () => {
  console.log('✅ 查询数据库连接成功');
});

queryConnection.on('error', (err) => {
  console.error('❌ 查询数据库连接失败:', err.message);
});

queryConnection.on('disconnected', () => {
  console.warn('⚠️  查询数据库连接断开');
});

module.exports = {
  userConnection,
  queryConnection
};
