// 测试通知功能
// 在浏览器控制台运行此脚本

async function testNotification() {
  try {
    console.log('🔍 测试通知API...');
    
    // 获取token
    const token = document.cookie.split('token=')[1]?.split(';')[0];
    if (!token) {
      console.error('❌ 未找到token，请先登录');
      return;
    }
    
    console.log('✅ Token已找到');
    
    // 调用获取活动通知API
    const response = await fetch('/api/notifications/active', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    console.log('📊 API响应:', data);
    
    if (data.success) {
      console.log(`✅ 成功获取 ${data.data.length} 条通知`);
      data.data.forEach((notification, index) => {
        console.log(`\n通知 ${index + 1}:`);
        console.log(`  标题: ${notification.title}`);
        console.log(`  内容: ${notification.content}`);
        console.log(`  优先级: ${notification.priority}`);
        console.log(`  状态: ${notification.status}`);
        console.log(`  目标用户: ${notification.targetUsers}`);
        console.log(`  开始时间: ${notification.startDate}`);
        console.log(`  结束时间: ${notification.endDate || '无'}`);
      });
    } else {
      console.error('❌ API返回失败:', data.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testNotification();
