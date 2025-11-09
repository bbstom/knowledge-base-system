/**
 * 测试数据库连接 API
 * 模拟前端请求测试数据库连接功能
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testDatabaseConnectionAPI() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 测试数据库连接 API');
  console.log('='.repeat(60));

  try {
    // 步骤1: 登录获取 Token
    console.log('\n📝 步骤1: 登录获取 Token');
    console.log('-'.repeat(60));
    
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    if (!loginResponse.data.success) {
      throw new Error('登录失败');
    }

    const token = loginResponse.data.token;
    console.log('✅ 登录成功');
    console.log(`Token: ${token.substring(0, 20)}...`);

    // 步骤2: 测试数据库连接（使用 .env 中的配置）
    console.log('\n📝 步骤2: 测试数据库连接（使用 .env 配置）');
    console.log('-'.repeat(60));

    const testConfig1 = {
      host: '172.16.254.15',
      port: 27017,
      username: 'chroot',
      password: 'Ubuntu123!',
      database: 'userdata',
      authSource: 'admin'
    };

    console.log('测试配置:', {
      host: testConfig1.host,
      port: testConfig1.port,
      username: testConfig1.username,
      password: '***',
      database: testConfig1.database,
      authSource: testConfig1.authSource
    });

    const testResponse1 = await axios.post(
      `${API_BASE}/system-config/databases/test`,
      testConfig1,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('测试结果:', testResponse1.data);
    
    if (testResponse1.data.success) {
      console.log('✅ 连接测试成功');
    } else {
      console.log('❌ 连接测试失败:', testResponse1.data.message);
    }

    // 步骤3: 测试无 authSource 的连接（应该失败）
    console.log('\n📝 步骤3: 测试无 authSource 的连接');
    console.log('-'.repeat(60));

    const testConfig2 = {
      host: '172.16.254.15',
      port: 27017,
      username: 'chroot',
      password: 'Ubuntu123!',
      database: 'userdata'
      // 没有 authSource
    };

    console.log('测试配置（无 authSource）:', {
      host: testConfig2.host,
      port: testConfig2.port,
      username: testConfig2.username,
      password: '***',
      database: testConfig2.database
    });

    const testResponse2 = await axios.post(
      `${API_BASE}/system-config/databases/test`,
      testConfig2,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('测试结果:', testResponse2.data);
    
    if (testResponse2.data.success) {
      console.log('✅ 连接测试成功（意外）');
    } else {
      console.log('❌ 连接测试失败（预期）:', testResponse2.data.message);
    }

    // 步骤4: 测试无认证的连接
    console.log('\n📝 步骤4: 测试无认证的连接');
    console.log('-'.repeat(60));

    const testConfig3 = {
      host: '172.16.254.15',
      port: 27017,
      database: 'userdata'
      // 没有用户名和密码
    };

    console.log('测试配置（无认证）:', {
      host: testConfig3.host,
      port: testConfig3.port,
      database: testConfig3.database
    });

    const testResponse3 = await axios.post(
      `${API_BASE}/system-config/databases/test`,
      testConfig3,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('测试结果:', testResponse3.data);
    
    if (testResponse3.data.success) {
      console.log('✅ 连接测试成功');
    } else {
      console.log('❌ 连接测试失败:', testResponse3.data.message);
    }

    // 步骤5: 测试查询数据库连接
    console.log('\n📝 步骤5: 测试查询数据库连接');
    console.log('-'.repeat(60));

    const testConfig4 = {
      host: '172.16.254.77',
      port: 27017,
      username: 'daroot',
      password: 'Ubuntu123!',
      database: 'dabase',
      authSource: 'admin'
    };

    console.log('测试配置（查询数据库）:', {
      host: testConfig4.host,
      port: testConfig4.port,
      username: testConfig4.username,
      password: '***',
      database: testConfig4.database,
      authSource: testConfig4.authSource
    });

    const testResponse4 = await axios.post(
      `${API_BASE}/system-config/databases/test`,
      testConfig4,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('测试结果:', testResponse4.data);
    
    if (testResponse4.data.success) {
      console.log('✅ 连接测试成功');
    } else {
      console.log('❌ 连接测试失败:', testResponse4.data.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 所有测试完成');
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行测试
testDatabaseConnectionAPI();
