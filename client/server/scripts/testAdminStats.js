const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testAdminStats() {
  console.log('🧪 测试管理员统计API\n');
  console.log('='.repeat(60));

  try {
    // 登录
    console.log('🔐 正在登录...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });

    if (!loginResponse.data.success) {
      throw new Error('登录失败');
    }

    const token = loginResponse.data.data.token;
    console.log('✅ 登录成功\n');

    // 获取统计数据
    console.log('📊 获取统计数据...');
    const statsResponse = await axios.get(`${API_BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (statsResponse.data.success) {
      const stats = statsResponse.data.data;
      
      console.log('✅ 统计数据获取成功\n');
      console.log('👥 用户统计:');
      console.log(`   总用户数: ${stats.totalUsers}`);
      console.log(`   活跃用户: ${stats.activeUsers}`);
      console.log(`   VIP用户: ${stats.vipUsers}`);
      console.log(`   今日新增: ${stats.newUsersToday}`);
      console.log(`   本月新增: ${stats.newUsersThisMonth}`);
      
      console.log('\n💰 财务统计:');
      console.log(`   总收入: $${stats.totalRevenue}`);
      console.log(`   本月收入: $${stats.monthlyRevenue}`);
      console.log(`   今日收入: $${stats.todayRevenue}`);
      console.log(`   总积分: ${stats.totalPoints}`);
      console.log(`   总佣金: $${stats.totalCommission}`);
      console.log(`   待处理提现: ${stats.pendingWithdrawals}`);
      console.log(`   已提现: $${stats.totalWithdrawn}`);
      
      console.log('\n🔍 搜索统计:');
      console.log(`   总搜索: ${stats.totalSearches}`);
      console.log(`   今日搜索: ${stats.todaySearches}`);
      console.log(`   本月搜索: ${stats.monthlySearches}`);
      console.log(`   成功率: ${stats.successRate}%`);
      
      console.log('\n👥 推荐统计:');
      console.log(`   总推荐: ${stats.totalReferrals}`);
      console.log(`   活跃推荐: ${stats.activeReferrals}`);
      console.log(`   转化率: ${stats.referralConversionRate}%`);
      
      console.log('\n💾 数据库统计:');
      console.log(`   总数据库: ${stats.totalDatabases}`);
      console.log(`   在线数据库: ${stats.activeDatabases}`);
      
      console.log('\n🔔 待处理事项:');
      console.log(`   待处理工单: ${stats.pendingReports}`);
      console.log(`   系统告警: ${stats.systemAlerts}`);
      
      console.log('\n⚙️  系统状态:');
      console.log(`   系统状态: ${stats.systemStatus}`);
      console.log(`   数据库状态: ${stats.databaseStatus}`);
      console.log(`   支付网关: ${stats.paymentGatewayStatus}`);
      console.log(`   邮件服务: ${stats.emailServiceStatus}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 测试完成\n');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.response?.data || error.message);
  }
}

testAdminStats();
