const mongoose = require('mongoose');

// 用户数据库连接
const userConnection = mongoose.createConnection(process.env.USER_MONGO_URI);

userConnection.on('connected', () => {
  console.log('✅ 用户数据库连接成功');
});

userConnection.on('error', (err) => {
  console.error('❌ 用户数据库连接失败:', err);
});

// 查询数据库连接
const queryConnection = mongoose.createConnection(process.env.QUERY_MONGO_URI);

queryConnection.on('connected', () => {
  console.log('✅ 查询数据库连接成功');
});

queryConnection.on('error', (err) => {
  console.error('❌ 查询数据库连接失败:', err);
});

module.exports = {
  userConnection,
  queryConnection
};
