const axios = require('axios');

async function testLoginAPI() {
  try {
    console.log('🔐 测试登录API...\n');

    const baseURL = 'http://localhost:3001';
    
    console.log('1️⃣ 测试服务器是否运行:');
    try {
      const healthCheck = await axios.get(`${baseURL}/api/health`, { timeout: 5000 });
      console.log('   ✅ 服务器正在运行');
    } catch (err) {
      console.log('   ❌ 服务器未运行或无法访问');
      console.log('   请先启动服务器: npm start');
      process.exit(1);
    }

    console.log('\n2️⃣ 测试登录API:');
    const loginData = {
      email: 'admin@example.com',
      password: 'admin123'
    };

    console.log('   发送登录请求...');
    console.log('   邮箱:', loginData.email);
    console.log('   密码:', loginData.password);

    try {
      const response = await axios.post(`${baseURL}/api/auth/login`, loginData, {
        timeout: 10000,
        validateStatus: () => true // 接受所有状态码
      });

      console.log('\n   响应状态:', response.status);
      console.log('   响应数据:', JSON.stringify(response.data, null, 2));

      if (response.data.success) {
        console.log('\n   ✅ 登录成功!');
        console.log('   Token:', response.data.data.token.substring(0, 20) + '...');
        console.log('   用户:', response.data.data.user.username);
      } else {
        console.log('\n   ❌ 登录失败:', response.data.message);
      }
    } catch (err) {
      console.log('\n   ❌ 请求失败:', err.message);
      if (err.response) {
        console.log('   响应状态:', err.response.status);
        console.log('   响应数据:', err.response.data);
      }
    }

    console.log('\n✅ 测试完成');
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    process.exit(1);
  }
}

testLoginAPI();
