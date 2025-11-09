require('dotenv').config();
const { initializeDatabase } = require('../config/database');
const BalanceLog = require('../models/BalanceLog');

async function testFinancialReport() {
  console.log('\n🧪 测试财务报告数据统计\n');
  console.log('============================================================');

  try {
    // 连接数据库
    await initializeDatabase();
    console.log('✅ 数据库连接成功\n');

    const days = 90;
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    console.log(`📊 统计最近${days}天的财务数据`);
    console.log(`   开始日期: ${startDate.toISOString().split('T')[0]}`);
    console.log(`   结束日期: ${now.toISOString().split('T')[0]}\n`);

    // 获取所有相关的财务记录
    const balanceLogs = await BalanceLog.find({
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    console.log(`📝 找到 ${balanceLogs.length} 条财务记录`);
    
    // 显示记录类型统计
    const typeStats = {};
    balanceLogs.forEach(log => {
      typeStats[log.type] = (typeStats[log.type] || 0) + 1;
    });
    console.log('\n📊 记录类型统计:');
    Object.entries(typeStats).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} 条`);
    });
    console.log('');



    // 按日期分组统计
    const dailyStats = {};
    
    // 初始化每一天的数据
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      dailyStats[dateStr] = {
        date: dateStr,
        income: 0,
        expense: 0,
        net: 0,
        details: {
          recharge: 0,
          commission: 0,
          withdraw: 0,
          consume: 0,
          refund: 0
        }
      };
    }

    // 统计每天的财务数据
    balanceLogs.forEach(log => {
      const dateStr = log.createdAt.toISOString().split('T')[0];
      
      if (!dailyStats[dateStr]) return;

      const amount = Math.abs(log.amount);

      // 入账类型
      if (['recharge', 'recharge_card'].includes(log.type)) {
        dailyStats[dateStr].details.recharge += amount;
        dailyStats[dateStr].income += amount;
      } else if (['consume', 'search', 'vip'].includes(log.type)) {
        dailyStats[dateStr].details.consume += amount;
        dailyStats[dateStr].income += amount;
      }

      // 出账类型
      if (['commission', 'referral_bonus', 'referral_reward'].includes(log.type)) {
        dailyStats[dateStr].details.commission += amount;
        dailyStats[dateStr].expense += amount;
      } else if (['withdraw', 'commission_withdraw'].includes(log.type)) {
        dailyStats[dateStr].details.withdraw += amount;
        dailyStats[dateStr].expense += amount;
      } else if (log.type === 'refund') {
        dailyStats[dateStr].details.refund += amount;
        dailyStats[dateStr].expense += amount;
      }
    });

    // 计算净收入
    Object.keys(dailyStats).forEach(date => {
      dailyStats[date].net = dailyStats[date].income - dailyStats[date].expense;
    });

    // 转换为数组并按日期排序
    const dailyData = Object.values(dailyStats).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // 计算汇总数据
    const summary = {
      totalIncome: dailyData.reduce((sum, d) => sum + d.income, 0),
      totalExpense: dailyData.reduce((sum, d) => sum + d.expense, 0),
      netProfit: dailyData.reduce((sum, d) => sum + d.net, 0),
      avgDailyIncome: dailyData.reduce((sum, d) => sum + d.income, 0) / days,
      avgDailyExpense: dailyData.reduce((sum, d) => sum + d.expense, 0) / days
    };

    console.log('📈 汇总数据:');
    console.log(`   总入账: ¥${summary.totalIncome.toFixed(2)}`);
    console.log(`   总出账: ¥${summary.totalExpense.toFixed(2)}`);
    console.log(`   净收入: ¥${summary.netProfit.toFixed(2)}`);
    console.log(`   日均入账: ¥${summary.avgDailyIncome.toFixed(2)}`);
    console.log(`   日均出账: ¥${summary.avgDailyExpense.toFixed(2)}`);

    console.log('\n📅 每日明细 (只显示有数据的日期):');
    dailyData.filter(day => day.income > 0 || day.expense > 0).forEach(day => {
      console.log(`\n   ${day.date}:`);
      console.log(`     充值收入: ¥${day.details.recharge.toFixed(2)}`);
      console.log(`     消费收入: ¥${day.details.consume.toFixed(2)}`);
      console.log(`     佣金支出: ¥${day.details.commission.toFixed(2)}`);
      console.log(`     提现支出: ¥${day.details.withdraw.toFixed(2)}`);
      console.log(`     退款支出: ¥${day.details.refund.toFixed(2)}`);
      console.log(`     总入账: ¥${day.income.toFixed(2)}`);
      console.log(`     总出账: ¥${day.expense.toFixed(2)}`);
      console.log(`     净收入: ¥${day.net.toFixed(2)}`);
    });

    console.log('\n============================================================');
    console.log('✅ 测试完成');

    process.exit(0);

  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

testFinancialReport();
