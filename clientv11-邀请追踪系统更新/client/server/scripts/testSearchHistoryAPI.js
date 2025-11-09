const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const jwt = require('jsonwebtoken');

async function testSearchHistoryAPI() {
  try {
    console.log('✅ 测试搜索历史API\n');

    // 获取测试用户
    const { userConnection } = require('../config/database');
    const User = require('../models/User');
    
    const email = 'kail.say.one@gmail.com';
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`❌ 未找到用户: ${email}`);
      return;
    }

    console.log('用户信息:');
    console.log('==================');
    console.log('用户名:', user.username);
    console.log('用户ID:', user._id);

    // 生成token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    console.log('\nToken:', token.substring(0, 50) + '...');

    // 测试API
    const fetch = require('node-fetch');
    const PORT = process.env.PORT || 3001;
    const API_URL = `http://localhost:${PORT}/api/user/search-history?page=1&limit=10`;

    console.log('\n测试API请求:');
    console.log('==================');
    console.log('URL:', API_URL);

    const response = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    console.log('\nAPI响应:');
    console.log('==================');
    console.log('状态码:', response.status);
    console.log('响应数据:', JSON.stringify(data, null, 2));

    if (data.success && data.data.history) {
      console.log('\n✅ API测试成功！');
      console.log('返回记录数:', data.data.history.length);
      
      if (data.data.history.length > 0) {
        console.log('\n第一条记录:');
        const first = data.data.history[0];
        console.log('- 类型:', first.type);
        console.log('- 查询:', first.query);
        console.log('- 消耗积分:', first.pointsCost);
        console.log('- 结果数:', first.resultCount);
        console.log('- 时间:', first.createdAt);
      }
    } else {
      console.log('\n❌ API测试失败');
      console.log('错误信息:', data.message);
    }

    await userConnection.close();

  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error.stack);
  }
}

testSearchHistoryAPI();
