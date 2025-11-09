/**
 * 检查用户佣金状态
 * 用于调试佣金提现问题
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const BalanceLog = require('../models/BalanceLog');

async function checkCommission(email) {
  console.log('🔍 检查用户佣金状态\n');
  
  try {
    await mongoose.connect(process.env.USER_MONGO_URI || process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');
    
    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ 用户不存在:', email);
      return;
    }
    
    console.log('👤 用户信息:');
    console.log(`   用户名: ${user.username}`);
    console.log(`   邮箱: ${user.email}`);
    console.log(`   user.commission 字段: ${user.commission || 0}`);
    console.log(`   user.balance 字段: ${user.balance || 0}`);
    console.log('');
    
    // 查询佣金收入记录
    const commissionLogs = await BalanceLog.find({
      userId: user._id,
      type: 'commission',
      currency: 'commission'
    }).sort({ createdAt: -1 });
    
    const totalCommission = commissionLogs.reduce((sum, log) => sum + log.amount, 0);
    
    console.log('💰 佣金收入:');
    console.log(`   记录数: ${commissionLogs.length}`);
    console.log(`   总收入: ${totalCommission.toFixed(2)}`);
    
    if (commissionLogs.length > 0) {
      console.log('\n   最近5条记录:');
      commissionLogs.slice(0, 5).forEach((log, index) => {
        console.log(`   ${index + 1}. ${log.amount.toFixed(2)} - ${log.description} (${log.createdAt.toLocaleString('zh-CN')})`);
      });
    }
    console.log('');
    
    // 查询提现记录（只计算负数记录，即扣除的佣金）
    const withdrawnLogs = await BalanceLog.find({
      userId: user._id,
      type: { $in: ['commission_to_balance', 'commission_withdraw', 'withdraw'] },
      currency: { $in: ['points', 'commission'] },
      amount: { $lt: 0 } // 只查询负数（扣除）记录
    }).sort({ createdAt: -1 });
    
    const totalWithdrawn = withdrawnLogs.reduce((sum, log) => sum + Math.abs(log.amount), 0);
    
    console.log('📤 提现记录:');
    console.log(`   记录数: ${withdrawnLogs.length}`);
    console.log(`   总提现: ${totalWithdrawn.toFixed(2)}`);
    
    if (withdrawnLogs.length > 0) {
      console.log('\n   最近5条记录:');
      withdrawnLogs.slice(0, 5).forEach((log, index) => {
        console.log(`   ${index + 1}. ${log.amount.toFixed(2)} - ${log.description} (${log.createdAt.toLocaleString('zh-CN')})`);
      });
    }
    console.log('');
    
    // 计算可用佣金
    const availableCommission = totalCommission - totalWithdrawn;
    
    console.log('=' .repeat(60));
    console.log('📊 佣金汇总:');
    console.log('=' .repeat(60));
    console.log(`总收入:   ${totalCommission.toFixed(2)}`);
    console.log(`已提现:   ${totalWithdrawn.toFixed(2)}`);
    console.log(`可用佣金: ${availableCommission.toFixed(2)}`);
    console.log('=' .repeat(60));
    
    if (availableCommission <= 0) {
      console.log('\n⚠️  可用佣金为 0，无法提现');
      console.log('   请确保有推荐用户注册并获得佣金');
    } else if (availableCommission < 1) {
      console.log('\n⚠️  可用佣金不足 1 元');
      console.log('   提现到余额最低 1 元');
      console.log('   提现到 USDT 最低 10 元');
    } else if (availableCommission < 10) {
      console.log('\n✅ 可以提现到余额');
      console.log('⚠️  提现到 USDT 需要至少 10 元');
    } else {
      console.log('\n✅ 可以提现到余额或 USDT');
    }
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 数据库连接已关闭');
  }
}

// 从命令行参数获取邮箱
const email = process.argv[2];

if (!email) {
  console.log('使用方法: node checkUserCommission.js <email>');
  console.log('示例: node checkUserCommission.js user@example.com');
  process.exit(1);
}

checkCommission(email);
