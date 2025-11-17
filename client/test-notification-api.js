/**
 * 测试通知API
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testPublicNotifications() {
  console.log('🧪 测试公开通知API...\n');
  
  try {
    const response = await axios.get(`${API_BASE}/api/notifications/public`);
    console.log('✅ API响应成功');
    console.log('状态码:', response.status);
    console.log('数据:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      const notifications = response.data.data || [];
      console.log(`\n📊 获取到 ${notifications.length} 条通知`);
      
      notifications.forEach((n, i) => {
        console.log(`\n通知 ${i + 1}:`);
        console.log(`  标题: ${n.title}`);
        console.log(`  显示时机: ${n.showTiming}`);
        console.log(`  状态: ${n.status}`);
        console.log(`  优先级: ${n.priority}`);
      });
    }
  } catch (error) {
    console.error('❌ API请求失败');
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      console.error('没有收到响应，可能是服务器未启动');
      console.error('请检查:');
      console.error('  1. 后端服务是否运行？ (pm2 status 或 npm run dev)');
      console.error('  2. 端口是否正确？ (默认3001)');
    } else {
      console.error('错误:', error.message);
    }
  }
}

// 运行测试
testPublicNotifications();
