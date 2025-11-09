const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function saveConfig() {
  try {
    console.log('💾 保存查询数据库配置\n');

    // 连接数据库
    await mongoose.connect(process.env.USER_MONGO_URI);
    console.log('✅ 连接成功');

    // 加密密码
    const { encryptPassword } = require('../utils/encryption');

    // 从环境变量解析
    const queryUri = process.env.QUERY_MONGO_URI;
    const match = queryUri.match(/mongodb:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)(\?authSource=(.+))?/);
    
    if (!match) {
      console.log('❌ 无法解析 QUERY_MONGO_URI');
      return;
    }

    const [, username, password, host, port, database, , authSource] = match;
    const encryptedPassword = encryptPassword(decodeURIComponent(password));

    // 准备配置
    const queryDbConfig = {
      id: 'query_' + Date.now(),
      name: '查询数据库',
      type: 'mongodb',
      host: host,
      port: parseInt(port),
      username: username,
      password: encryptedPassword,
      database: database,
      authSource: authSource || 'admin',
      connectionPool: 10,
      timeout: 30000,
      enabled: true,
      description: '主查询数据库'
    };

    console.log(`\n配置信息:`);
    console.log(`  主机: ${host}:${port}`);
    console.log(`  数据库: ${database}`);

    // 直接使用 MongoDB 操作
    const db = mongoose.connection.db;
    const collection = db.collection('systemconfigs');

    // 更新或插入
    const result = await collection.updateOne(
      {},
      {
        $set: {
          'databases.query': [queryDbConfig],
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    console.log('\n✅ 保存成功！');
    console.log(`   操作: ${result.upsertedCount > 0 ? '新建' : '更新'}`);

    // 验证
    const saved = await collection.findOne({});
    if (saved && saved.databases?.query && saved.databases.query.length > 0) {
      console.log('\n✅ 验证成功！');
      console.log(`   查询数据库: ${saved.databases.query[0].name}`);
      console.log(`   主机: ${saved.databases.query[0].host}:${saved.databases.query[0].port}`);
    }

    console.log('\n💡 下一步: 重启服务器');
    console.log('   npm start');
    
  } catch (error) {
    console.error('\n❌ 失败:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

saveConfig();
