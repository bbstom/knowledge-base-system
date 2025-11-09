const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { userConnection } = require('../config/database');
const User = require('../models/User');
const BalanceLog = require('../models/BalanceLog');

async function testPointsHistory() {
  try {
    console.log('🔍 测试积分历史API数据结构...\n');

    // 查找一个有积分记录的用户
    const user = await User.findOne({ points: { $gt: 0 } });
    
    if (!user) {
      console.log('❌ 没有找到有积分的用户');
      return;
    }

    console.log('✅ 找到用户:', user.username);
    console.log('   积分:', user.points);
    console.log('   余额:', user.balance);

    // 查询积分相关的余额日志（修复后的查询）
    const logs = await BalanceLog.find({ 
      userId: user._id,
      currency: 'points'
    })
      .sort({ createdAt: -1 })
      .limit(10);

    console.log('\n📊 积分相关日志数量:', logs.length);
    
    if (logs.length > 0) {
      console.log('\n最近的记录:');
      logs.slice(0, 5).forEach((log, index) => {
        console.log(`\n记录 ${index + 1}:`);
        console.log('  类型:', log.type);
        console.log('  货币:', log.currency);
        console.log('  金额:', log.amount);
        console.log('  描述:', log.description);
        console.log('  时间:', log.createdAt);
      });
    }

    // 计算已使用的积分
    const usedPointsResult = await BalanceLog.aggregate([
      {
        $match: {
          userId: user._id,
          currency: 'points',
          amount: { $lt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const usedPoints = usedPointsResult.length > 0 ? Math.abs(usedPointsResult[0].total) : 0;

    // 类型映射
    const typeMapping = {
      'recharge': 'recharge',
      'recharge_card': 'recharge',
      'commission': 'referral',
      'search': 'purchase',
      'exchange': 'purchase',
      'vip': 'purchase',
      'refund': 'bonus'
    };

    // 模拟API返回的数据结构
    const apiResponse = {
      success: true,
      data: {
        totalPoints: user.points,
        availablePoints: user.points,
        usedPoints: usedPoints,
        pointsHistory: logs.map(log => ({
          type: typeMapping[log.type] || 'bonus',
          amount: log.amount,
          description: log.description || '积分变动',
          createdAt: log.createdAt
        })),
        canClaimDaily: true,
        dailyReward: 10
      }
    };

    console.log('\n📦 API返回的数据结构:');
    console.log(JSON.stringify(apiResponse, null, 2));

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await userConnection.close();
    process.exit(0);
  }
}

testPointsHistory();
