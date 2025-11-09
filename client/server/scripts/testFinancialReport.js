const API_BASE = 'http://localhost:5000/api';

async function testFinancialReport() {
  console.log('\n🧪 测试财务报告API\n');
  console.log('============================================================');

  try {
    // 1. 登录获取token
    console.log('🔐 正在登录...');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });

    const loginData = await loginRes.json();
    if (!loginData.success) {
      throw new Error('登录失败: ' + loginData.message);
    }

    const token = loginData.token;
    console.log('✅ 登录成功\n');

    // 2. 测试不同时间范围的财务报告
    const periods = [7, 30, 90];

    for (const days of periods) {
      console.log(`📊 获取最近${days}天的财务报告...`);
      
      const reportRes = await fetch(`${API_BASE}/admin/financial-report?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const reportData = await reportRes.json();
      
      if (!reportData.success) {
        throw new Error('获取财务报告失败: ' + reportData.message);
      }

      console.log(`✅ 财务报告获取成功 (${days}天)`);
      console.log('\n📈 汇总数据:');
      console.log(`   总入账: ¥${reportData.data.summary.totalIncome}`);
      console.log(`   总出账: ¥${reportData.data.summary.totalExpense}`);
      console.log(`   净收入: ¥${reportData.data.summary.netProfit}`);
      console.log(`   日均入账: ¥${reportData.data.summary.avgDailyIncome}`);
      console.log(`   日均出账: ¥${reportData.data.summary.avgDailyExpense}`);

      console.log('\n📅 每日明细 (最近5天):');
      reportData.data.dailyData.slice(0, 5).forEach(day => {
        console.log(`\n   ${day.date}:`);
        console.log(`     充值: ¥${day.details.recharge}`);
        console.log(`     消费: ¥${day.details.consume}`);
        console.log(`     佣金: ¥${day.details.commission}`);
        console.log(`     提现: ¥${day.details.withdraw}`);
        console.log(`     退款: ¥${day.details.refund}`);
        console.log(`     入账: ¥${day.income} | 出账: ¥${day.expense} | 净收入: ¥${day.net}`);
      });

      console.log('\n' + '='.repeat(60) + '\n');
    }

    console.log('✅ 测试完成');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  }
}

testFinancialReport();
