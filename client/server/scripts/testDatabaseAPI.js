/**
 * 测试数据库配置 API
 * 用于验证 API 端点是否正常工作
 */

require('dotenv').config();
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api';
let authToken = '';

// 测试配置
const testConfig = {
  user: {
    name: '用户数据库',
    type: 'mongodb',
    host: 'localhost',
    port: 27017,
    username: '',
    password: '',
    database: 'infosearch',
    connectionPool: 10,
    timeout: 30000,
    enabled: true
  },
  query: [
    {
      id: 'query_test_1',
      name: '测试查询数据库',
      type: 'mongodb',
      host: 'localhost',
      port: 27017,
      username: '',
      password: '',
      database: 'query_db',
      connectionPool: 5,
      timeout: 30000,
      enabled: false,
      description: '用于测试的查询数据库'
    }
  ]
};

async function login() {
  console.log('\n📝 步骤1: 登录获取 Token');
  console.log('-'.repeat(60));
  
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    const data = await response.json();
    
    if (data.success && data.token) {
      authToken = data.token;
      console.log('✅ 登录成功');
      console.log('Token:', authToken.substring(0, 20) + '...');
      return true;
    } else {
      console.error('❌ 登录失败:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ 登录请求失败:', error.message);
    return false;
  }
}

async function testConnection() {
  console.log('\n📝 步骤2: 测试数据库连接');
  console.log('-'.repeat(60));
  
  try {
    const response = await fetch(`${API_BASE}/system-config/databases/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(testConfig.user)
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ 连接测试成功');
      console.log('消息:', data.message);
    } else {
      console.log('❌ 连接测试失败');
      console.log('错误:', data.message);
    }
    
    return data.success;
  } catch (error) {
    console.error('❌ 测试请求失败:', error.message);
    return false;
  }
}

async function getConfig() {
  console.log('\n📝 步骤3: 获取当前配置');
  console.log('-'.repeat(60));
  
  try {
    const response = await fetch(`${API_BASE}/system-config`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ 获取配置成功');
      
      if (data.data.databases) {
        console.log('\n用户数据库配置:');
        if (data.data.databases.user) {
          console.log('  主机:', data.data.databases.user.host);
          console.log('  端口:', data.data.databases.user.port);
          console.log('  数据库:', data.data.databases.user.database);
          console.log('  密码:', data.data.databases.user.password);
          console.log('  启用:', data.data.databases.user.enabled);
        } else {
          console.log('  未配置');
        }
        
        console.log('\n查询数据库配置:');
        if (data.data.databases.query && data.data.databases.query.length > 0) {
          data.data.databases.query.forEach((db, index) => {
            console.log(`  数据库 ${index + 1}:`);
            console.log('    名称:', db.name);
            console.log('    主机:', db.host);
            console.log('    端口:', db.port);
            console.log('    数据库:', db.database);
            console.log('    密码:', db.password);
            console.log('    启用:', db.enabled);
          });
        } else {
          console.log('  未配置');
        }
      }
      
      return true;
    } else {
      console.error('❌ 获取配置失败:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ 获取配置请求失败:', error.message);
    return false;
  }
}

async function updateConfig() {
  console.log('\n📝 步骤4: 更新数据库配置');
  console.log('-'.repeat(60));
  
  try {
    const response = await fetch(`${API_BASE}/system-config/databases`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(testConfig)
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ 更新配置成功');
      console.log('消息:', data.message);
      
      if (data.data) {
        console.log('\n返回的配置:');
        console.log('  用户数据库密码:', data.data.user?.password);
        console.log('  查询数据库数量:', data.data.query?.length || 0);
      }
    } else {
      console.log('❌ 更新配置失败');
      console.log('错误:', data.message);
    }
    
    return data.success;
  } catch (error) {
    console.error('❌ 更新配置请求失败:', error.message);
    return false;
  }
}

async function getStatus() {
  console.log('\n📝 步骤5: 获取数据库连接状态');
  console.log('-'.repeat(60));
  
  try {
    const response = await fetch(`${API_BASE}/system-config/databases/status`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ 获取状态成功');
      
      console.log('\n用户数据库状态:');
      console.log('  连接:', data.data.user.connected ? '✅ 已连接' : '❌ 未连接');
      console.log('  状态码:', data.data.user.readyState);
      console.log('  数据库:', data.data.user.name);
      console.log('  主机:', data.data.user.host);
      console.log('  端口:', data.data.user.port);
      
      console.log('\n查询数据库状态:');
      if (data.data.query && data.data.query.length > 0) {
        data.data.query.forEach((db, index) => {
          console.log(`  数据库 ${index + 1}:`);
          console.log('    ID:', db.id);
          console.log('    名称:', db.name);
          console.log('    状态:', db.readyState === 1 ? '✅ 已连接' : '❌ 未连接');
        });
      } else {
        console.log('  无查询数据库连接');
      }
      
      return true;
    } else {
      console.error('❌ 获取状态失败:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ 获取状态请求失败:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('🧪 开始测试数据库配置 API');
  console.log('='.repeat(60));
  
  try {
    // 步骤1: 登录
    const loginSuccess = await login();
    if (!loginSuccess) {
      console.error('\n❌ 登录失败，无法继续测试');
      console.log('\n提示: 请确保:');
      console.log('  1. 服务器正在运行 (npm run dev)');
      console.log('  2. 管理员账号存在 (username: admin, password: admin123)');
      process.exit(1);
    }

    // 步骤2: 测试连接
    await testConnection();

    // 步骤3: 获取配置
    await getConfig();

    // 步骤4: 更新配置
    await updateConfig();

    // 步骤5: 获取状态
    await getStatus();

    console.log('\n' + '='.repeat(60));
    console.log('✅ 所有测试完成');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ 测试过程中出错:', error);
    console.error('错误堆栈:', error.stack);
  }
}

// 运行测试
runTests();
