/**
 * 测试数据库连接
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function testConnection(name, uri) {
  console.log(`\n🔍 测试 ${name} 连接...`);
  console.log(`URI: ${uri.replace(/:[^:@]+@/, ':***@')}`);
  
  try {
    const connection = await mongoose.createConnection(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000
    }).asPromise();
    
    console.log(`✅ ${name} 连接成功`);
    
    // 测试基本操作
    const collections = await connection.db.listCollections().toArray();
    console.log(`   集合数量: ${collections.length}`);
    console.log(`   集合列表: ${collections.map(c => c.name).join(', ')}`);
    
    await connection.close();
    return true;
  } catch (error) {
    console.error(`❌ ${name} 连接失败:`);
    console.error(`   错误: ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error(`   原因: 无法连接到数据库服务器`);
      console.error(`   建议: 检查数据库服务是否启动，IP地址是否正确`);
    } else if (error.message.includes('Authentication failed')) {
      console.error(`   原因: 认证失败`);
      console.error(`   建议: 检查用户名和密码是否正确`);
    } else if (error.message.includes('timed out')) {
      console.error(`   原因: 连接超时`);
      console.error(`   建议: 检查网络连接，防火墙设置`);
    }
    
    return false;
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('🔍 数据库连接测试');
  console.log('='.repeat(60));
  
  const userResult = await testConnection('用户数据库', process.env.USER_MONGO_URI);
  const queryResult = await testConnection('查询数据库', process.env.QUERY_MONGO_URI);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试结果');
  console.log('='.repeat(60));
  console.log(`用户数据库: ${userResult ? '✅ 正常' : '❌ 失败'}`);
  console.log(`查询数据库: ${queryResult ? '✅ 正常' : '❌ 失败'}`);
  console.log('='.repeat(60));
  
  if (!userResult || !queryResult) {
    console.log('\n💡 建议:');
    console.log('1. 检查 MongoDB 服务是否启动');
    console.log('2. 检查 .env 文件中的数据库配置');
    console.log('3. 检查网络连接和防火墙设置');
    console.log('4. 尝试使用 MongoDB Compass 连接测试');
  }
  
  process.exit(userResult && queryResult ? 0 : 1);
}

runTests();
