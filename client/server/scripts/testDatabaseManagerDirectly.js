/**
 * 直接测试 DatabaseManager 的 testConnection 方法
 * 不通过 API，直接调用方法
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const dbManager = require('../config/databaseManager');

async function testDatabaseManager() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 直接测试 DatabaseManager.testConnection');
  console.log('='.repeat(60));

  // 测试配置（模拟前端发送的数据）
  const testConfig = {
    name: '用户数据库',
    type: 'mongodb',
    host: '172.16.254.15',
    port: 27017,
    username: 'chroot',
    password: 'Ubuntu123!',  // 明文密码
    database: 'userdata',
    authSource: 'admin',
    connectionPool: 10,
    timeout: 30000,
    enabled: true
  };

  console.log('\n📝 测试配置:');
  console.log(JSON.stringify({
    ...testConfig,
    password: '***隐藏***'
  }, null, 2));

  console.log('\n' + '-'.repeat(60));
  console.log('开始测试连接...');
  console.log('-'.repeat(60));

  try {
    const result = await dbManager.testConnection(testConfig);
    
    console.log('\n' + '='.repeat(60));
    if (result.success) {
      console.log('✅ 测试成功！');
    } else {
      console.log('❌ 测试失败！');
    }
    console.log('='.repeat(60));
    console.log('\n结果:', JSON.stringify(result, null, 2));
    
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error('\n❌ 测试过程出错:', error);
    console.error('错误堆栈:', error.stack);
    process.exit(1);
  }
}

// 运行测试
testDatabaseManager();
