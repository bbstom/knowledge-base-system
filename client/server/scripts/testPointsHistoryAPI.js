const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🔍 测试积分历史API端点...\n');

    // 首先登录获取token
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'kailsay@gmail.com',
        password: 'Kail0109'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.log('❌ 登录失败:', loginData.message);
      return;
    }

    const token = loginData.data.token;
    console.log('✅ 登录成功');

    // 测试积分历史API
    const historyResponse = await fetch('http://localhost:3001/api/user/points-history?page=1&limit=10', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const historyData = await historyResponse.json();
    
    console.log('\n📦 API响应:');
    console.log(JSON.stringify(historyData, null, 2));

    if (historyData.success) {
      console.log('\n✅ API调用成功');
      console.log('总积分:', historyData.data.totalPoints);
      console.log('可用积分:', historyData.data.availablePoints);
      console.log('积分记录数量:', historyData.data.pointsHistory?.length || 0);
      
      if (historyData.data.pointsHistory && historyData.data.pointsHistory.length > 0) {
        console.log('\n最近的记录:');
        historyData.data.pointsHistory.slice(0, 3).forEach((record, index) => {
          console.log(`\n记录 ${index + 1}:`);
          console.log('  类型:', record.type);
          console.log('  金额:', record.amount);
          console.log('  描述:', record.description);
          console.log('  时间:', new Date(record.createdAt).toLocaleString());
        });
      }
    } else {
      console.log('❌ API调用失败:', historyData.message);
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testAPI();
