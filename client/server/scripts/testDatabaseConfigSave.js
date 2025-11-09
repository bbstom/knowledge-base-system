/**
 * 测试数据库配置保存功能
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testDatabaseConfigSave() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 测试数据库配置保存功能');
  console.log('='.repeat(60));

  try {
    const { userConnection } = require('../config/database');
    
    // 等待数据库连接完成
    console.log('等待数据库连接...');
    await new Promise((resolve) => {
      if (userConnection.readyState === 1) {
        resolve();
      } else {
        userConnection.once('connected', resolve);
        setTimeout(() => resolve(), 10000); // 10秒超时
      }
    });
    
    if (userConnection.readyState !== 1) {
      throw new Error('数据库连接超时');
    }
    
    console.log('✅ 数据库已连接');
    
    const SystemConfigSchema = require('../models/SystemConfig').schema;
    const SystemConfig = userConnection.model('SystemConfig', SystemConfigSchema);

    // 测试1: 创建或获取配置
    console.log('\n📝 测试1: 获取或创建配置');
    console.log('-'.repeat(60));
    
    let config = await SystemConfig.findOne();
    if (!config) {
      console.log('创建新配置...');
      config = new SystemConfig({});
    } else {
      console.log('✅ 找到现有配置');
    }

    // 测试2: 保存数据库配置
    console.log('\n📝 测试2: 保存数据库配置');
    console.log('-'.repeat(60));

    const testDatabaseConfig = {
      user: {
        name: '测试用户数据库',
        type: 'mongodb',
        host: 'localhost',
        port: 27017,
        username: 'testuser',
        password: 'testpass',
        database: 'testdb',
        connectionPool: 10,
        timeout: 30000,
        enabled: true
      },
      query: [
        {
          id: 'test_query_1',
          name: '测试查询数据库1',
          type: 'mongodb',
          host: 'localhost',
          port: 27017,
          username: '',
          password: '',
          database: 'query_test',
          connectionPool: 5,
          timeout: 30000,
          enabled: true,
          description: '测试查询数据库'
        }
      ]
    };

    config.databases = testDatabaseConfig;
    
    console.log('保存配置...');
    await config.save();
    console.log('✅ 配置保存成功');

    // 测试3: 读取配置验证
    console.log('\n📝 测试3: 读取配置验证');
    console.log('-'.repeat(60));

    const savedConfig = await SystemConfig.findOne();
    console.log('用户数据库配置:');
    console.log(`  名称: ${savedConfig.databases.user.name}`);
    console.log(`  主机: ${savedConfig.databases.user.host}`);
    console.log(`  端口: ${savedConfig.databases.user.port}`);
    console.log(`  数据库: ${savedConfig.databases.user.database}`);
    console.log(`  启用: ${savedConfig.databases.user.enabled}`);

    console.log('\n查询数据库配置:');
    if (savedConfig.databases.query && savedConfig.databases.query.length > 0) {
      savedConfig.databases.query.forEach((db, index) => {
        console.log(`  ${index + 1}. ${db.name}`);
        console.log(`     主机: ${db.host}:${db.port}`);
        console.log(`     数据库: ${db.database}`);
        console.log(`     启用: ${db.enabled}`);
      });
    } else {
      console.log('  无查询数据库');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 所有测试完成');
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行测试
testDatabaseConfigSave();
