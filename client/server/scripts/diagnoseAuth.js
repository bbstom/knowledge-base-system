// 诊断认证问题
const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function diagnose() {
  console.log('🔍 开始诊断认证问题...\n');

  // 1. 测试服务器是否运行
  console.log('1️⃣ 检查服务器状态...');
  try {
    await axios.get(`${API_URL}/auth/login`);
  } catch (error) {
    if (error.response) {
      console.log('✅ 服务器正在运行\n');
    } else {
      console.log('❌ 服务器未运行或无法连接');
      console.log('请先启动服务器: npm run dev\n');
      return;
    }
  }

  // 2. 测试登录
  console.log('2️⃣ 测试管理员登录...');
  try {
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });

    if (loginResponse.data.success) {
      console.log('✅ 登录成功!');
      console.log('Token:', loginResponse.data.data.token.substring(0, 50) + '...');
      console.log('用户角色:', loginResponse.data.data.user.role);
      console.log('用户名:', loginResponse.data.data.user.username);
      console.log('邮箱:', loginResponse.data.data.user.email);
      
      const token = loginResponse.data.data.token;
      
      // 3. 测试访问管理员 API
      console.log('\n3️⃣ 测试访问管理员 API...');
      try {
        const adminResponse = await axios.get(`${API_URL}/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (adminResponse.data.success) {
          console.log('✅ 成功访问管理员 API!');
          console.log('用户信息:', {
            username: adminResponse.data.user.username,
            role: adminResponse.data.user.role,
            email: adminResponse.data.user.email
          });
        }
      } catch (error) {
        console.log('❌ 访问管理员 API 失败:', error.response?.data?.message || error.message);
      }
      
      // 4. 测试访问系统配置 API
      console.log('\n4️⃣ 测试访问系统配置 API...');
      try {
        const configResponse = await axios.get(`${API_URL}/system-config`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (configResponse.data.success) {
          console.log('✅ 成功访问系统配置 API!');
        }
      } catch (error) {
        console.log('❌ 访问系统配置 API 失败:', error.response?.data?.message || error.message);
      }
      
      console.log('\n✅ 所有测试通过!');
      console.log('\n📋 解决方案:');
      console.log('1. 清除浏览器缓存和 Cookies');
      console.log('2. 刷新页面 (F5)');
      console.log('3. 使用以下凭据重新登录:');
      console.log('   邮箱: admin@example.com');
      console.log('   密码: admin123');
      
    } else {
      console.log('❌ 登录失败:', loginResponse.data.message);
    }
  } catch (error) {
    console.log('❌ 登录失败:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n可能的原因:');
      console.log('1. 管理员账户不存在');
      console.log('2. 密码错误');
      console.log('\n解决方案:');
      console.log('运行以下命令创建管理员账户:');
      console.log('node server/scripts/createAdminSimple.js');
    }
  }
}

diagnose();
