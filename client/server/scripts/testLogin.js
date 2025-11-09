// 测试登录 API
const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testLogin() {
  try {
    console.log('🔐 测试登录...');
    console.log('邮箱: admin@example.com');
    console.log('密码: admin123\n');

    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });

    if (response.data.success) {
      console.log('✅ 登录成功!');
      console.log('\nToken:', response.data.data.token);
      console.log('\n用户信息:');
      console.log(JSON.stringify(response.data.data.user, null, 2));
      
      // 测试使用 token 访问受保护的 API
      console.log('\n\n🔒 测试访问受保护的 API...');
      const profileResponse = await axios.get(`${API_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${response.data.data.token}`
        }
      });
      
      if (profileResponse.data.success) {
        console.log('✅ 成功访问受保护的 API!');
        console.log('\n用户资料:');
        console.log(JSON.stringify(profileResponse.data.user, null, 2));
      }
    } else {
      console.log('❌ 登录失败:', response.data.message);
    }
  } catch (error) {
    console.log('❌ 错误:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.log('\n响应数据:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testLogin();
