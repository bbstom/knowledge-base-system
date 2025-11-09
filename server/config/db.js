// config/db.js
const mongoose = require('mongoose');

// Mongoose 的配置选项
const commonOptions = {
    // useNewUrlParser: true, // 在 Mongoose 6+ 中已默认，无需手动设置
    // useUnifiedTopology: true,
};

// 1. 用户数据连接
const userDbConnection = mongoose.createConnection(
    process.env.MONGO_URI_USER, 
    { ...commonOptions, dbName: 'user_data_db' } // 明确指定 dbName
);

userDbConnection.on('connected', () => {
    console.log('MongoDB User Data Connected.');
});

userDbConnection.on('error', (err) => {
    console.error('User Data DB Connection Error:', err);
});

// 2. 查询数据连接
const queryDbConnection = mongoose.createConnection(
    process.env.MONGO_URI_QUERY, 
    { ...commonOptions, dbName: 'query_data_db' } // 明确指定 dbName
);

queryDbConnection.on('connected', () => {
    console.log('MongoDB Query Data Connected.');
});

queryDbConnection.on('error', (err) => {
    console.error('Query Data DB Connection Error:', err);
});

// 导出所有连接对象
module.exports = {
    userDbConnection,
    queryDbConnection,
    mongoose // 也导出 Mongoose 库本身
};