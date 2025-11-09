const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function saveQueryDatabaseConfig() {
  try {
    console.log('💾 保存查询数据库配置\n');
    console.log('='.repeat(60));

    // 连接用户数据库
    console.log('📋 步骤1: 连接用户数据库');
    console.log('-----------------------------------');
    await mongoose.connect(process.env.USER_MONGO_URI);
    console.log('✅ 用户数据库连接成功');

    // 使用实际的 SystemConfig 模型
    const SystemConfig = require('../models/SystemConfig');

    // 加密密码
    const { encryptPassword } = require('../utils/encryption');

    console.log('\n📋 步骤2: 准备配置数据');
    console.log('-----------------------------------');

    // 从环境变量解析查询数据库配置
    const queryUri = process.env.QUERY_MONGO_URI;
    console.log(`QUERY_MONGO_URI: ${queryUri ? '已配置' : '未配置'}`);

    if (!queryUri) {
      console.log('❌ 环境变量中没有 QUERY_MONGO_URI');
      console.log('\n💡 请在 server/.env 文件中添加：');
      console.log('QUERY_MONGO_URI=mongodb://username:password@host:port/database?authSource=admin');
      return;
    }

    // 解析 URI
    const uriMatch = queryUri.match(/mongodb:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)(\?authSource=(.+))?/);
    
    if (!uriMatch) {
      console.log('❌ 无法解析 QUERY_MONGO_URI');
      console.log('格式应该是: mongodb://username:password@host:port/database?authSource=admin');
      return;
    }

    const [, username, password, host, port, database, , authSource] = uriMatch;

    console.log('解析结果:');
    console.log(`  用户名: ${username}`);
    console.log(`  主机: ${host}`);
    console.log(`  端口: ${port}`);
    console.log(`  数据库: ${database}`);
    console.log(`  认证源: ${authSource || 'admin'}`);

    // 加密密码
    const encryptedPassword = encryptPassword(decodeURIComponent(password));
    console.log(`  密码: 已加密`);

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

    console.log('\n📋 步骤3: 保存配置到数据库');
    console.log('-----------------------------------');

    // 查找或创建 SystemConfig
    let config = await SystemConfig.findOne();
    
    if (!config) {
      console.log('创建新的 SystemConfig...');
      config = new SystemConfig({
        databases: {
          query: [queryDbConfig]
        }
      });
    } else {
      console.log('更新现有的 SystemConfig...');
      if (!config.databases) {
        config.databases = {};
      }
      config.databases.query = [queryDbConfig];
    }

    await config.save();
    console.log('✅ 配置已保存到数据库');

    // 验证保存
    console.log('\n📋 步骤4: 验证保存结果');
    console.log('-----------------------------------');
    
    const savedConfig = await SystemConfig.findOne();
    if (savedConfig && savedConfig.databases?.query && savedConfig.databases.query.length > 0) {
      console.log('✅ 验证成功！');
      console.log(`   查询数据库数量: ${savedConfig.databases.query.length}`);
      savedConfig.databases.query.forEach((db, index) => {
        console.log(`\n   ${index + 1}. ${db.name}`);
        console.log(`      ID: ${db.id}`);
        console.log(`      主机: ${db.host}:${db.port}`);
        console.log(`      数据库: ${db.database}`);
        console.log(`      启用: ${db.enabled ? '是' : '否'}`);
      });
    } else {
      console.log('❌ 验证失败：配置未正确保存');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 完成！');
    console.log('\n💡 下一步:');
    console.log('   1. 重启服务器: npm start');
    console.log('   2. 查看启动日志，确认查询数据库已初始化');
    console.log('   3. 测试搜索功能');
    
  } catch (error) {
    console.error('\n❌ 保存失败:', error);
    console.error('错误详情:', error.stack);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

saveQueryDatabaseConfig();
