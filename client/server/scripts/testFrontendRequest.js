/**
 * 模拟前端数据库连接测试请求
 * 用于调试数据库连接问题
 */

const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testFrontendRequest() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 模拟前端数据库连接测试请求');
  console.log('='.repeat(60));

  try {
    // 1. 先登录获取 token
    console.log('\n📝 步骤1: 管理员登录');
    console.log('-'.repeat(60));
    
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ 登录成功，获取到 token');
    
    // 2. 测试数据库连接（模拟你填写的信息）
    console.log('\n📝 步骤2: 测试数据库连接');
    console.log('-'.repeat(60));
    
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
    
    console.log('发送的配置信息:');
    console.log(JSON.stringify({
      ...testConfig,
      password: '***隐藏***'
    }, null, 2));
    
    const testResponse = await axios.post(
      'http://localhost:3001/api/system-config/databases/test',
      testConfig,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('\n✅ 测试连接响应:');
    console.log(JSON.stringify(testResponse.data, null, 2));
    
    // 3. 测试不同的 authSource 值
    console.log('\n📝 步骤3: 测试不同的 authSource 值');
    console.log('-'.repeat(60));
    
    const authSources = ['admin', 'userdata', undefined];
    
    for (const authSource of authSources) {
      console.log(`\n🔍 测试 authSource: ${authSource || '未设置'}`);
      
      const config = {
        ...testConfig,
        authSource: authSource
      };
      
      if (!authSource) {
        delete config.authSource;
      }
      
      try {
        const response = await axios.post(
          'http://localhost:3001/api/system-config/databases/test',
          config,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log(`  ✅ authSource=${authSource || '未设置'}: 连接成功`);
        console.log(`     响应: ${response.data.message}`);
        break; // 如果成功就停止测试
      } catch (error) {
        console.log(`  ❌ authSource=${authSource || '未设置'}: 连接失败`);
        if (error.response) {
          console.log(`     错误: ${error.response.data.message}`);
        } else {
          console.log(`     错误: ${error.message}`);
        }
      }
    }
    
    // 4. 测试直接使用 MongoDB 连接
    console.log('\n📝 步骤4: 直接测试 MongoDB 连接');
    console.log('-'.repeat(60));
    
    const mongoose = require('mongoose');
    
    const testUris = [
      'mongodb://chroot:Ubuntu123!@172.16.254.15:27017/userdata?authSource=admin',
      'mongodb://chroot:Ubuntu123%21@172.16.254.15:27017/userdata?authSource=admin', // URL 编码的 !
      'mongodb://chroot:Ubuntu123!@172.16.254.15:27017/userdata?authSource=userdata'
    ];
    
    for (const uri of testUris) {
      console.log(`\n🔍 测试 URI: ${uri.replace(/Ubuntu123[!%21]+/, 'Ubuntu123***')}`);
      
      try {
        const conn = await mongoose.createConnection(uri, {
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 5000
        }).asPromise();
        
        console.log('  ✅ 直接连接成功');
        await conn.close();
        break; // 如果成功就停止测试
      } catch (error) {
        console.log('  ❌ 直接连接失败:', error.message);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ 测试完成');
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
      console.error('响应状态:', error.response.status);
    }
    console.error('\n完整错误:', error);
  }
  
  process.exit(0);
}

// 运行测试
testFrontendRequest();
