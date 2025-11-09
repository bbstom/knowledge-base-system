/**
 * 修复佣金数据
 * 清理重复或错误的提现记录
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const BalanceLog = require('../models/BalanceLog');

async function fixCommissionData(email) {
  console.log('🔧 修复佣金数据\n');
  
  try {
    await mongoose.connect(process.env.USER_MONGO_URI || process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ 用户不存在:', email);
      return;
    }
    
    console.log('👤 用户:', user.username, '(', user.email, ')\n');
    
    // 1. 查询所有佣金收入
    const commissionLogs = await BalanceLog.find({
      userId: user._id,
      type: 'referral_bonus',
      currency: 'points'
    }).sort({ createdAt: 1 });
    
    const totalCommission = commissionLogs.reduce((sum, log) => sum + log.amount, 0);
    console.log('💰 总佣金收入:', totalCommission.toFixed(2));
    console.log('   记录数:', commissionLogs.length);
    
    // 2. 查询所有提现记录（负数）
    const withdrawnLogs = await BalanceLog.find({
      userId: user._id,
      type: { $in: ['commission_to_balance', 'commission_withdraw', 'withdraw'] },
      currency: { $in: ['points', 'commission'] },
      amount: { $lt: 0 }
    }).sort({ createdAt: 1 });
    
    const totalWithdrawn = withdrawnLogs.reduce((sum, log) => sum + Math.abs(log.amount), 0);
    console.log('📤 总提现:', totalWithdrawn.toFixed(2));
    console.log('   记录数:', withdrawnLogs.length);
    
    // 3. 查询余额增加记录（正数）
    const balanceIncomeLogs = await BalanceLog.find({
      userId: user._id,
      type: 'balance_income',
      currency: 'balance',
      amount: { $gt: 0 }
    }).sort({ createdAt: 1 });
    
    const totalBalanceIncome = balanceIncomeLogs.reduce((sum, log) => sum + log.amount, 0);
    console.log('💵 余额增加:', totalBalanceIncome.toFixed(2));
    console.log('   记录数:', balanceIncomeLogs.length);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 数据分析');
    console.log('='.repeat(60));
    console.log(`佣金收入: ${totalCommission.toFixed(2)}`);
    console.log(`提现扣除: ${totalWithdrawn.toFixed(2)}`);
    console.log(`余额增加: ${totalBalanceIncome.toFixed(2)}`);
    console.log(`可用佣金: ${(totalCommission - totalWithdrawn).toFixed(2)}`);
    console.log('='.repeat(60));
    
    // 4. 检查数据一致性
    if (totalWithdrawn > totalCommission) {
      console.log('\n⚠️  警告：提现金额超过佣金收入！');
      console.log('   这可能是数据错误或重复记录');
      console.log('\n是否要清理多余的提现记录？');
      console.log('   (这将删除超出佣金收入的提现记录)');
      console.log('\n   如需清理，请手动在数据库中操作');
    } else if (totalWithdrawn !== totalBalanceIncome) {
      console.log('\n⚠️  警告：提现扣除与余额增加不匹配！');
      console.log(`   差额: ${Math.abs(totalWithdrawn - totalBalanceIncome).toFixed(2)}`);
    } else {
      console.log('\n✅ 数据一致性检查通过');
    }
    
    // 5. 显示最近的提现记录
    if (withdrawnLogs.length > 0) {
      console.log('\n📋 最近10条提现记录:');
      withdrawnLogs.slice(-10).reverse().forEach((log, index) => {
        console.log(`${index + 1}. ${log.amount.toFixed(2)} - ${log.type} - ${log.description}`);
        console.log(`   时间: ${log.createdAt.toLocaleString('zh-CN')}`);
        console.log(`   ID: ${log._id}`);
      });
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
  console.log('使用方法: node fixCommissionData.js <email>');
  console.log('示例: node fixCommissionData.js user@example.com');
  process.exit(1);
}

fixCommissionData(email);
