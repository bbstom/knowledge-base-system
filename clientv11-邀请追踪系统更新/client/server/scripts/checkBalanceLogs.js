/**
 * 检查积分日志数据
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const BalanceLog = require('../models/BalanceLog');

async function checkLogs() {
  try {
    await mongoose.connect(process.env.USER_MONGO_URI);
    console.log('✅ 数据库连接成功\n');

    // 查询最近10条积分日志
    const logs = await BalanceLog.find({ currency: 'points' })
      .sort({ createdAt: -1 })
      .limit(10);

    console.log(`📊 最近10条积分日志:\n`);
    
    logs.forEach((log, index) => {
      console.log(`${index + 1}. ${log.createdAt.toISOString()}`);
      console.log(`   类型: ${log.type}`);
      console.log(`   金额: ${log.amount}`);
      console.log(`   描述: ${log.description}`);
      console.log(`   订单ID: ${log.orderId || '无'}`);
      console.log('');
    });

    // 统计各类型数量
    const stats = await BalanceLog.aggregate([
      { $match: { currency: 'points' } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    console.log('📈 积分日志类型统计:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}条`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

checkLogs();
