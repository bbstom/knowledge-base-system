// 测试每日签到积分显示
// 在浏览器控制台运行此脚本

async function testDailyCheckInPoints() {
  console.log('🔍 测试每日签到积分配置...\n');
  
  try {
    // 1. 测试公共配置API
    console.log('1️⃣ 测试公共配置API');
    const response = await fetch('/api/system-config/public-config');
    const data = await response.json();
    
    console.log('API响应:', data);
    
    if (data.success && data.data?.points?.dailyCheckIn) {
      console.log(`✅ 每日签到积分: ${data.data.points.dailyCheckIn}`);
    } else {
      console.error('❌ 未找到每日签到积分配置');
      return;
    }
    
    // 2. 检查页面显示
    console.log('\n2️⃣ 检查页面显示');
    const checkInText = document.querySelector('.text-white\\/80');
    if (checkInText) {
      console.log(`页面显示: ${checkInText.textContent}`);
      
      const expectedText = `签到领取 ${data.data.points.dailyCheckIn} 积分`;
      if (checkInText.textContent.includes(expectedText) || 
          checkInText.textContent.includes('今天已经签到过了')) {
        console.log('✅ 页面显示正确');
      } else {
        console.log('⚠️ 页面显示可能不正确');
        console.log(`期望包含: "${expectedText}"`);
        console.log(`实际显示: "${checkInText.textContent}"`);
      }
    } else {
      console.log('⚠️ 未找到签到文本元素（可能页面结构已变化）');
    }
    
    // 3. 测试管理员后台配置
    console.log('\n3️⃣ 如何修改每日签到积分:');
    console.log('   1. 登录管理员账号');
    console.log('   2. 进入 "系统设置" 页面');
    console.log('   3. 找到 "积分配置" 部分');
    console.log('   4. 修改 "每日签到" 的积分值');
    console.log('   5. 保存配置');
    console.log('   6. 刷新用户页面，查看新的积分值');
    
    console.log('\n✅ 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testDailyCheckInPoints();
