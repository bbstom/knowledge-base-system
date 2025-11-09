const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 生成测试token
const generateTestToken = (userId) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// 测试API
const testProfileAPI = async () => {
  try {
    // 使用admin用户的ID
    const adminUserId = '68f59aede90ce2a14891cb62';
    const token = generateTestToken(adminUserId);
    
    console.log('🔑 生成的测试Token:', token.substring(0, 50) + '...');
    console.log('');

    const response = await fetch('http://localhost:3001/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    console.log('📡 API响应状态:', response.status);
    console.log('📦 API响应数据:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success && data.user) {
      console.log('\n✅ API返回成功');
      console.log('👤 用户信息:');
      console.log(`  - 用户名: ${data.user.username}`);
      console.log(`  - 角色: ${data.user.role}`);
      console.log(`  - 积分: ${data.user.points}`);
      console.log(`  - 余额: ${data.user.balance}`);
      console.log(`  - 佣金: ${data.user.commission}`);
    } else {
      console.log('\n❌ API返回失败');
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
};

console.log('🧪 测试用户Profile API\n');
console.log('⚠️  请确保服务器正在运行 (npm run dev 或 node server.js)\n');

testProfileAPI();
