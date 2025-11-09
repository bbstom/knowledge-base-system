const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// 登录并获取 token
async function login() {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });

    if (response.data.success) {
      return response.data.data.token;
    }
    throw new Error('登录失败');
  } catch (error) {
    console.error('❌ 登录失败:', error.message);
    throw error;
  }
}

// 测试系统 API
async function testSystemAPI() {
  console.log('🧪 测试系统管理 API\n');
  console.log('=' .repeat(60));

  // 先登录
  console.log('🔐 正在登录...');
  let token;
  try {
    token = await login();
    console.log('✅ 登录成功\n');
  } catch (error) {
    console.log('❌ 登录失败，无法继续测试\n');
    return;
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // 测试 1: 获取当前版本
  console.log('\n📱 测试 1: 获取当前版本');
  console.log('-'.repeat(60));
  try {
    const response = await axios.get(`${API_BASE}/system/version`, { headers });
    if (response.data.success) {
      console.log('✅ 成功');
      console.log(`   版本: v${response.data.data.currentVersion}`);
      console.log(`   发布日期: ${new Date(response.data.data.releaseDate).toLocaleDateString()}`);
    }
  } catch (error) {
    console.log('❌ 失败:', error.response?.data?.message || error.message);
  }

  // 测试 2: 获取版本历史
  console.log('\n📱 测试 2: 获取版本历史');
  console.log('-'.repeat(60));
  try {
    const response = await axios.get(`${API_BASE}/system/version/history`, { headers });
    if (response.data.success) {
      console.log('✅ 成功');
      console.log(`   历史版本数: ${response.data.data.length}`);
    }
  } catch (error) {
    console.log('❌ 失败:', error.response?.data?.message || error.message);
  }

  // 测试 3: 获取系统信息
  console.log('\n📱 测试 3: 获取系统信息');
  console.log('-'.repeat(60));
  try {
    const response = await axios.get(`${API_BASE}/system/info`, { headers });
    if (response.data.success) {
      console.log('✅ 成功');
      console.log(`   版本: ${response.data.data.version}`);
      console.log(`   Node.js: ${response.data.data.nodeVersion}`);
      console.log(`   平台: ${response.data.data.platform}`);
      console.log(`   CPU: ${response.data.data.cpuCount} 核`);
    }
  } catch (error) {
    console.log('❌ 失败:', error.response?.data?.message || error.message);
  }

  // 测试 4: 获取备份列表
  console.log('\n📱 测试 4: 获取备份列表');
  console.log('-'.repeat(60));
  try {
    const response = await axios.get(`${API_BASE}/system/backups`, { headers });
    if (response.data.success) {
      console.log('✅ 成功');
      console.log(`   备份数量: ${response.data.data.length}`);
      if (response.data.data.length > 0) {
        const latest = response.data.data[0];
        console.log(`   最新备份: ${latest.backupId}`);
        console.log(`   状态: ${latest.status}`);
      }
    }
  } catch (error) {
    console.log('❌ 失败:', error.response?.data?.message || error.message);
  }

  // 测试 5: 创建备份（可选，会实际创建备份）
  console.log('\n📱 测试 5: 创建备份（跳过，避免创建实际备份）');
  console.log('-'.repeat(60));
  console.log('⏭️  已跳过');

  console.log('\n' + '='.repeat(60));
  console.log('✅ 测试完成\n');
}

// 运行测试
testSystemAPI().catch(console.error);
