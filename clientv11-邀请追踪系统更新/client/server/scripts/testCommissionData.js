const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { userConnection } = require('../config/database');
const User = require('../models/User');
const BalanceLog = require('../models/BalanceLog');

async function testCommissionData() {
  try {
    console.log('🔍 测试佣金数据...\n');

    // 查找有佣金的用户
    const user = await User.findOne({ commission: { $gt: 0 } });
    
    if (!user) {
      console.log('❌ 没有找到有佣金的用户');
      return;
    }

    console.log('✅ 找到用户:', user.username);
    console.log('   当前佣金:', user.commission);
    console.log('   余额:', user.balance);
    console.log('   积分:', user.points);

    // 查询所有与佣金相关的记录
    const allCommissionLogs = await BalanceLog.find({ 
      userId: user._id,
      currency: 'commission'
    })
      .sort({ createdAt: -1 });

    console.log('\n📊 所有佣金相关记录（currency=commission）:', allCommissionLogs.length);

    // 查询type为commission的记录
    const commissions = await BalanceLog.find({ 
      userId: user._id,
      type: 'commission'
    })
      .sort({ createdAt: -1 })
      .limit(10);

    console.log('📊 type=commission的记录数量:', commissions.length);
    
    if (commissions.length > 0) {
      console.log('\n最近的佣金记录:');
      commissions.forEach((log, index) => {
        console.log(`\n记录 ${index + 1}:`);
        console.log('  类型:', log.type);
        console.log('  货币:', log.currency);
        console.log('  金额:', log.amount);
        console.log('  描述:', log.description);
        console.log('  关联用户:', log.relatedUserId);
        console.log('  订单ID:', log.orderId);
        console.log('  时间:', log.createdAt);
      });
    }

    // 计算总佣金
    const totalCommissionResult = await BalanceLog.aggregate([
      { 
        $match: { 
          userId: user._id,
          type: 'commission'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totalCommission = totalCommissionResult.length > 0 ? totalCommissionResult[0].total : 0;

    console.log('\n💰 佣金统计:');
    console.log('  总佣金（从记录计算）:', totalCommission);
    console.log('  当前可用佣金（用户表）:', user.commission);
    console.log('  已提现/转出:', totalCommission - user.commission);

    // 模拟API返回的数据结构
    const apiResponse = {
      success: true,
      data: {
        commissions: commissions.map(log => ({
          _id: log._id,
          amount: log.amount,
          description: log.description,
          relatedUserId: log.relatedUserId,
          createdAt: log.createdAt
        })),
        totalCommission: totalCommission,
        pendingCommission: 0
      }
    };

    console.log('\n📦 API返回的数据结构:');
    console.log(JSON.stringify(apiResponse, null, 2));

    // 检查数据一致性
    console.log('\n🔍 数据一致性检查:');
    if (user.commission > totalCommission) {
      console.log('⚠️  警告: 用户当前佣金大于总佣金记录，数据可能不一致');
    } else if (user.commission === totalCommission) {
      console.log('✅ 数据一致: 用户从未提现或转出佣金');
    } else {
      console.log('✅ 数据正常: 用户已提现或转出部分佣金');
    }

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await userConnection.close();
    process.exit(0);
  }
}

testCommissionData();
