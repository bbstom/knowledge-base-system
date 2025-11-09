/**
 * 测试支付+佣金完整流程
 * 
 * 测试场景：
 * 1. 用户A邀请用户B注册
 * 2. 用户B充值¥100
 * 3. 验证用户B获得积分
 * 4. 验证用户A获得佣金
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const RechargeOrder = require('../models/RechargeOrder');
const BalanceLog = require('../models/BalanceLog');
const commissionService = require('../services/commissionService');
const rechargeService = require('../services/rechargeService');

async function testPaymentCommissionFlow() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 测试支付+佣金完整流程');
    console.log('='.repeat(60));

    // 连接数据库
    await mongoose.connect(process.env.USER_MONGO_URI);
    console.log('✅ 数据库连接成功\n');

    // 1. 创建测试用户A（推荐人）
    console.log('📝 步骤1: 创建推荐人（用户A）');
    let userA = await User.findOne({ username: 'test_referrer' });
    if (!userA) {
      userA = await User.create({
        username: 'test_referrer',
        email: 'referrer@test.com',
        password: 'password123',
        referralCode: 'REFA001',
        balance: 0,
        commission: 0,
        points: 0
      });
      console.log(`✅ 创建推荐人: ${userA.username} (${userA.referralCode})`);
    } else {
      console.log(`✅ 使用现有推荐人: ${userA.username} (${userA.referralCode})`);
    }
    console.log(`   余额: ¥${userA.balance.toFixed(2)}`);
    console.log(`   佣金: ¥${userA.commission.toFixed(2)}`);
    console.log(`   积分: ${userA.points}\n`);

    // 2. 创建测试用户B（被推荐人）
    console.log('📝 步骤2: 创建被推荐人（用户B）');
    let userB = await User.findOne({ username: 'test_referee' });
    if (userB) {
      await User.deleteOne({ _id: userB._id });
      console.log('   删除旧的测试用户B');
    }
    
    userB = await User.create({
      username: 'test_referee',
      email: 'referee@test.com',
      password: 'password123',
      referralCode: 'REFB001',
      referredBy: userA.referralCode,
      balance: 0,
      commission: 0,
      points: 0
    });
    console.log(`✅ 创建被推荐人: ${userB.username}`);
    console.log(`   推荐人: ${userB.referredBy}`);
    console.log(`   余额: ¥${userB.balance.toFixed(2)}`);
    console.log(`   积分: ${userB.points}\n`);

    // 3. 模拟充值
    console.log('📝 步骤3: 模拟用户B充值¥100');
    const rechargeAmount = 100;
    
    // 创建充值订单
    const order = await RechargeOrder.create({
      userId: userB._id,
      orderId: `TEST_ORDER_${Date.now()}`,
      amount: rechargeAmount,
      currency: 'CNY',
      type: 'points',
      status: 'pending',
      paymentMethod: 'bepusdt'
    });
    console.log(`✅ 创建订单: ${order.orderId}`);
    console.log(`   金额: ¥${order.amount}`);
    console.log(`   类型: ${order.type}\n`);

    // 4. 模拟支付成功
    console.log('📝 步骤4: 模拟支付成功');
    order.status = 'completed';
    order.completedAt = new Date();
    await order.save();
    
    // 增加积分（1元=10积分）
    const pointsToAdd = rechargeAmount * 10;
    userB.points += pointsToAdd;
    await userB.save();
    
    console.log(`✅ 支付成功，增加积分: ${pointsToAdd}`);
    
    // 记录余额日志
    await BalanceLog.create({
      userId: userB._id,
      type: 'recharge',
      currency: 'points',
      amount: pointsToAdd,
      balanceBefore: 0,
      balanceAfter: pointsToAdd,
      orderId: order.orderId,
      description: `充值¥${rechargeAmount}获得${pointsToAdd}积分`
    });
    console.log(`✅ 记录积分日志\n`);

    // 5. 计算并发放佣金
    console.log('📝 步骤5: 计算并发放佣金');
    const commissionResult = await commissionService.calculateCommission(
      userB._id,
      rechargeAmount,
      order.orderId
    );
    
    if (commissionResult.success) {
      console.log(`✅ 佣金计算成功`);
      console.log(`   总佣金: ¥${commissionResult.totalCommission.toFixed(2)}`);
      console.log(`   发放记录: ${commissionResult.records.length}条\n`);
      
      commissionResult.records.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.level}级佣金:`);
        console.log(`      推荐人: ${record.referrerUsername}`);
        console.log(`      金额: ¥${record.amount.toFixed(2)}`);
        console.log(`      比例: ${record.rate * 100}%`);
      });
    } else {
      console.log(`❌ 佣金计算失败: ${commissionResult.message}`);
    }

    // 6. 验证结果
    console.log('\n📝 步骤6: 验证最终结果');
    
    // 刷新用户数据
    userA = await User.findById(userA._id);
    userB = await User.findById(userB._id);
    
    console.log('\n👤 用户A（推荐人）:');
    console.log(`   余额: ¥${userA.balance.toFixed(2)}`);
    console.log(`   佣金: ¥${userA.commission.toFixed(2)}`);
    console.log(`   积分: ${userA.points}`);
    
    console.log('\n👤 用户B（被推荐人）:');
    console.log(`   余额: ¥${userB.balance.toFixed(2)}`);
    console.log(`   佣金: ¥${userB.commission.toFixed(2)}`);
    console.log(`   积分: ${userB.points}`);

    // 7. 查询佣金日志
    console.log('\n📝 步骤7: 查询佣金日志');
    const commissionLogs = await BalanceLog.find({
      userId: userA._id,
      type: 'commission'
    }).sort({ createdAt: -1 }).limit(5);
    
    console.log(`\n找到 ${commissionLogs.length} 条佣金记录:`);
    commissionLogs.forEach((log, index) => {
      console.log(`\n${index + 1}. ${log.description}`);
      console.log(`   金额: ¥${log.amount.toFixed(2)}`);
      console.log(`   时间: ${log.createdAt.toLocaleString('zh-CN')}`);
    });

    // 8. 测试总结
    console.log('\n' + '='.repeat(60));
    console.log('✅ 测试完成！');
    console.log('='.repeat(60));
    
    const expectedCommission = rechargeAmount * 0.15; // 15%佣金
    const actualCommission = userA.commission;
    
    console.log('\n📊 测试结果:');
    console.log(`   充值金额: ¥${rechargeAmount}`);
    console.log(`   获得积分: ${userB.points}`);
    console.log(`   预期佣金: ¥${expectedCommission.toFixed(2)}`);
    console.log(`   实际佣金: ¥${actualCommission.toFixed(2)}`);
    console.log(`   结果: ${Math.abs(actualCommission - expectedCommission) < 0.01 ? '✅ 通过' : '❌ 失败'}`);
    
    console.log('\n💡 提示:');
    console.log('   - 用户B充值¥100，获得1000积分');
    console.log('   - 用户A作为推荐人，获得¥15佣金（15%）');
    console.log('   - 佣金可以提现或转入余额兑换积分');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('✅ 数据库连接已关闭');
  }
}

// 运行测试
testPaymentCommissionFlow();
