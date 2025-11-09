/**
 * 清理错误的佣金提现记录
 * 删除超出佣金收入的提现记录
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const BalanceLog = require('../models/BalanceLog');

async function cleanCommissionRecords(email) {
  console.log('🧹 清理佣金提现记录\n');
  
  try {
    await mongoose.connect(process.env.USER_MONGO_URI || process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ 用户不存在:', email);
      return;
    }
    
    console.log('👤 用户:', user.username, '(', user.email, ')\n');
    
    // 1. 查询总佣金收入
    const commissionLogs = await BalanceLog.find({
      userId: user._id,
      type: 'referral_bonus',
      currency: 'points'
    });
    
    const totalCommission = commissionLogs.reduce((sum, log) => sum + log.amount, 0);
    console.log('💰 总佣金收入:', totalCommission.toFixed(2));
    
    // 2. 查询所有提现记录
    const withdrawnLogs = await BalanceLog.find({
      userId: user._id,
      type: { $in: ['commission_to_balance', 'commission_withdraw', 'withdraw'] },
      currency: { $in: ['points', 'commission'] },
      amount: { $lt: 0 }
    }).sort({ createdAt: 1 });
    
    console.log('📤 提现记录数:', withdrawnLogs.length);
    console.log('');
    
    // 3. 删除所有 commission_to_balance 类型的记录
    const deleteResult = await BalanceLog.deleteMany({
      userId: user._id,
      type: 'commission_to_balance'
    });
    
    console.log('🗑️  已删除记录数:', deleteResult.deletedCount);
    
    // 4. 重新计算
    const remainingLogs = await BalanceLog.find({
      userId: user._id,
      type: { $in: ['commission_withdraw', 'withdraw'] },
      currency: { $in: ['points', 'commission'] },
      amount: { $lt: 0 }
    });
    
    const remainingWithdrawn = remainingLogs.reduce((sum, log) => sum + Math.abs(log.amount), 0);
    const availableCommission = totalCommission - remainingWithdrawn;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 清理后的数据');
    console.log('='.repeat(60));
    console.log(`佣金收入: ${totalCommission.toFixed(2)}`);
    console.log(`剩余提现: ${remainingWithdrawn.toFixed(2)}`);
    console.log(`可用佣金: ${availableCommission.toFixed(2)}`);
    console.log('='.repeat(60));
    
    if (availableCommission > 0) {
      console.log('\n✅ 清理完成！现在可以正常提现了');
    } else {
      console.log('\n⚠️  可用佣金仍为 0');
    }
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 数据库连接已关闭');
  }
}

const email = process.argv[2];

if (!email) {
  console.log('使用方法: node cleanCommissionRecords.js <email>');
  console.log('示例: node cleanCommissionRecords.js user@example.com');
  console.log('\n⚠️  警告: 此操作将删除所有 commission_to_balance 类型的记录！');
  process.exit(1);
}

console.log('⚠️  警告: 此操作将删除所有 commission_to_balance 类型的记录！');
console.log('按 Ctrl+C 取消，或等待 5 秒后自动执行...\n');

setTimeout(() => {
  cleanCommissionRecords(email);
}, 5000);
