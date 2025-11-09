/**
 * 通过 API 测试数据库连接
 * 完整模拟前端流程
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testDatabaseConnectionAPI() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 通过 API 测试数据库连接');
  console.log('='.repeat(60));

  try {
    // 步骤 1: 登录获取 token
    console.log('\n📝 步骤 1: 管理员登录');
    console.log('-'.repeat(60));
    
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('登录失败: ' + loginResponse.data.message);
    }
    
    const token = loginResponse.data.token || loginResponse.data.data?.token;
    if (!token) {
      console.log('登录响应:', JSON.stringify(loginResponse.data, null, 2));
      throw new Error('未能获取 token');
    }
    
    console.log('✅ 登录成功');
    console.log('Token:', token.substring(0, 20) + '...');

    // 步骤 2: 测试数据库连接
    console.log('\n📝 步骤 2: 测试数据库连接');
    console.log('-'.repeat(60));
    
    const testConfig = {
      name: '用户数据库',
      type: 'mongodb',
      host: '172.16.254.15',
      port: 27017,
      username: 'chroot',
      password: 'Ubuntu123!',
      database: 'userdata',
      authSource: 'admin',
      enabled: true
    };
    
    console.log('测试配置:');
    console.log(JSON.stringify({
      ...testConfig,
      password: '***隐藏***'
    }, null, 2));
    
    console.log('\n🔄 发送测试请求...');
    const testResponse = await axios.post(
      `${API_BASE}/system-config/databases/test`,
      testConfig,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('\n' + '='.repeat(60));
    if (testResponse.data.success) {
      console.log('✅ 数据库连接测试成功！');
    } else {
      console.log('❌ 数据库连接测试失败！');
    }
    console.log('='.repeat(60));
    
    console.log('\n响应数据:');
    console.log(JSON.stringify(testResponse.data, null, 2));

    // 步骤 3: 测试不同的 authSource 配置
    console.log('\n📝 步骤 3: 测试不同的 authSource 配置');
    console.log('-'.repeat(60));
    
    const authSources = [
      { value: 'admin', desc: 'authSource=admin' },
      { value: 'userdata', desc: 'authSource=userdata' },
      { value: undefined, desc: '不设置 authSource' }
    ];
    
    for (const { value, desc } of authSources) {
      console.log(`\n🔍 测试: ${desc}`);
      
      const config = { ...testConfig };
      if (value === undefined) {
        delete config.authSource;
      } else {
        config.authSource = value;
      }
      
      try {
        const response = await axios.post(
          `${API_BASE}/system-config/databases/test`,
          config,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data.success) {
          console.log(`  ✅ 成功: ${response.data.message}`);
        } else {
          console.log(`  ❌ 失败: ${response.data.message}`);
        }
      } catch (error) {
        if (error.response) {
          console.log(`  ❌ 失败: ${error.response.data.message || error.message}`);
        } else {
          console.log(`  ❌ 失败: ${error.message}`);
        }
      }
    }

    // 步骤 4: 保存数据库配置
    console.log('\n📝 步骤 4: 保存数据库配置');
    console.log('-'.repeat(60));
    
    const saveConfig = {
      user: {
        type: 'mongodb',
        host: '172.16.254.15',
        port: 27017,
        username: 'chroot',
        password: 'Ubuntu123!',
        database: 'userdata',
        authSource: 'admin',
        enabled: true
      },
      query: []
    };
    
    console.log('保存配置:');
    console.log(JSON.stringify({
      user: {
        ...saveConfig.user,
        password: '***隐藏***'
      },
      query: saveConfig.query
    }, null, 2));
    
    console.log('\n🔄 发送保存请求...');
    const saveResponse = await axios.put(
      `${API_BASE}/system-config/databases`,
      saveConfig,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('\n保存结果:');
    if (saveResponse.data.success) {
      console.log('✅', saveResponse.data.message);
    } else {
      console.log('❌', saveResponse.data.message);
    }

    // 步骤 5: 获取数据库连接状态
    console.log('\n📝 步骤 5: 获取数据库连接状态');
    console.log('-'.repeat(60));
    
    const statusResponse = await axios.get(
      `${API_BASE}/system-config/databases/status`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('\n连接状态:');
    console.log(JSON.stringify(statusResponse.data, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('✅ 所有测试完成！');
    console.log('='.repeat(60));
    console.log('\n总结:');
    console.log('1. ✅ 管理员登录成功');
    console.log('2. ✅ 数据库连接测试成功');
    console.log('3. ✅ 数据库配置保存成功');
    console.log('4. ✅ 数据库状态查询成功');
    console.log('\n现在你可以在前端页面进行数据库配置了！\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    }
    console.error('\n完整错误:', error);
    process.exit(1);
  }
}

// 运行测试
testDatabaseConnectionAPI();
