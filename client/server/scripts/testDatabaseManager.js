/**
 * 测试数据库管理器
 * 用于验证数据库连接管理功能
 */

require('dotenv').config();
const dbManager = require('../config/databaseManager');
const { encryptPassword, decryptPassword, isEncrypted } = require('../utils/encryption');

async function testDatabaseManager() {
  console.log('='.repeat(60));
  console.log('🧪 开始测试数据库管理器');
  console.log('='.repeat(60));

  try {
    // 测试1: 加密解密功能
    console.log('\n📝 测试1: 密码加密解密');
    console.log('-'.repeat(60));
    const testPassword = 'mySecretPassword123';
    console.log('原始密码:', testPassword);
    
    const encrypted = encryptPassword(testPassword);
    console.log('加密后:', encrypted);
    console.log('是否已加密:', isEncrypted(encrypted));
    
    const decrypted = decryptPassword(encrypted);
    console.log('解密后:', decrypted);
    console.log('匹配:', testPassword === decrypted ? '✅' : '❌');

    // 测试2: 初始化数据库连接
    console.log('\n📝 测试2: 初始化数据库连接');
    console.log('-'.repeat(60));
    const initResult = await dbManager.initializeFromConfig();
    console.log('初始化结果:', initResult.success ? '✅ 成功' : '❌ 失败');
    if (!initResult.success) {
      console.error('错误:', initResult.error);
      process.exit(1);
    }

    // 测试3: 获取用户数据库连接
    console.log('\n📝 测试3: 获取用户数据库连接');
    console.log('-'.repeat(60));
    try {
      const userConn = dbManager.getUserConnection();
      console.log('连接状态:', userConn.readyState);
      console.log('数据库名:', userConn.name);
      console.log('主机:', userConn.host);
      console.log('端口:', userConn.port);
      console.log('✅ 用户数据库连接正常');
    } catch (error) {
      console.error('❌ 获取用户数据库连接失败:', error.message);
    }

    // 测试4: 测试数据库连接
    console.log('\n📝 测试4: 测试数据库连接');
    console.log('-'.repeat(60));
    const testConfig = {
      host: process.env.USER_MONGO_HOST || 'localhost',
      port: parseInt(process.env.USER_MONGO_PORT || '27017'),
      username: process.env.USER_MONGO_USER || '',
      password: process.env.USER_MONGO_PASSWORD || '',
      database: process.env.USER_MONGO_DATABASE || 'infosearch'
    };
    
    console.log('测试配置:', {
      host: testConfig.host,
      port: testConfig.port,
      database: testConfig.database,
      username: testConfig.username ? '***' : '(无)'
    });
    
    const testResult = await dbManager.testConnection(testConfig);
    console.log('测试结果:', testResult.success ? '✅ 成功' : '❌ 失败');
    if (!testResult.success) {
      console.log('错误信息:', testResult.message);
    }

    // 测试5: 查询数据库信息
    console.log('\n📝 测试5: 查询数据库信息');
    console.log('-'.repeat(60));
    const queryDBs = dbManager.getQueryDatabasesInfo();
    console.log('查询数据库数量:', queryDBs.length);
    if (queryDBs.length > 0) {
      queryDBs.forEach((db, index) => {
        console.log(`\n查询数据库 ${index + 1}:`);
        console.log('  ID:', db.id);
        console.log('  名称:', db.name);
        console.log('  状态:', db.readyState);
        console.log('  主机:', db.host);
        console.log('  端口:', db.port);
      });
    } else {
      console.log('ℹ️  未配置查询数据库');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 所有测试完成');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    console.error('错误堆栈:', error.stack);
  } finally {
    // 关闭所有连接
    console.log('\n🔄 关闭数据库连接...');
    await dbManager.closeAll();
    console.log('✅ 测试完成，退出程序');
    process.exit(0);
  }
}

// 运行测试
testDatabaseManager();
