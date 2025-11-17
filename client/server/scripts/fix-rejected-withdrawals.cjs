/**
 * 修复被拒绝但未退还佣金的提现订单
 * 
 * 使用方法：
 * node server/scripts/fix-rejected-withdrawals.cjs
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 数据库连接配置
const MONGODB_URI = process.env.USER_MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/info-query';

console.log('使用数据库URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));

// 定义Schema
const withdrawOrderSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  orderNo: String,
  type: String,
  amount: Number,
  fee: Number,
  actualAmount: Number,
  walletAddress: String,
  status: String,
  remark: String,
  processedBy: mongoose.Schema.Types.ObjectId,
  processedAt: Date,
  createdAt: Date,
  updatedAt: Date
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  commission: { type: Number, default: 0 }
}, { timestamps: true });

const balanceLogSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  type: String,
  currency: String,
  amount: Number,
  balanceBefore: Number,
  balanceAfter: Number,
  description: String,
  orderId: mongoose.Schema.Types.ObjectId,
  createdAt: Date
}, { timestamps: true });

async function fixRejectedWithdrawals() {
  try {
    console.log('连接数据库...');
    await mongoose.connect(MONGODB_URI);
    console.log('数据库连接成功');

    const WithdrawOrder = mongoose.model('WithdrawOrder', withdrawOrderSchema);
    const User = mongoose.model('User', userSchema);
    const BalanceLog = mongoose.model('BalanceLog', balanceLogSchema);

    // 查找所有被拒绝的佣金提现订单
    const rejectedOrders = await WithdrawOrder.find({
      status: 'rejected',
      type: 'commission'
    }).sort({ createdAt: 1 });

    console.log(`\n找到 ${rejectedOrders.length} 个被拒绝的佣金提现订单`);

    if (rejectedOrders.length === 0) {
      console.log('没有需要修复的订单');
      return;
    }

    let fixedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const order of rejectedOrders) {
      try {
        // 检查是否已经有退还记录
        const existingRefund = await BalanceLog.findOne({
          orderId: order._id,
          type: { $in: ['refund', 'commission_refund'] },
          currency: 'commission'
        });

        if (existingRefund) {
          console.log(`订单 ${order.orderNo} 已经有退还记录，跳过`);
          skippedCount++;
          continue;
        }

        // 获取用户信息
        const user = await User.findById(order.userId);
        if (!user) {
          console.log(`订单 ${order.orderNo} 的用户不存在，跳过`);
          errorCount++;
          continue;
        }

        // 退还佣金
        const commissionBefore = user.commission || 0;
        user.commission = commissionBefore + order.amount;
        await user.save();

        // 创建退还记录
        await BalanceLog.create({
          userId: user._id,
          type: 'commission_refund',
          currency: 'commission',
          amount: order.amount,
          balanceBefore: commissionBefore,
          balanceAfter: user.commission,
          description: `修复：提现被拒绝，退还佣金（订单：${order.orderNo}）`,
          orderId: order._id,
          createdAt: new Date()
        });

        console.log(`✓ 订单 ${order.orderNo} 已修复`);
        console.log(`  用户: ${user.username} (${user.email})`);
        console.log(`  退还金额: $${order.amount.toFixed(2)}`);
        console.log(`  佣金: $${commissionBefore.toFixed(2)} → $${user.commission.toFixed(2)}`);
        console.log('');

        fixedCount++;
      } catch (error) {
        console.error(`✗ 订单 ${order.orderNo} 修复失败:`, error.message);
        errorCount++;
      }
    }

    console.log('\n=== 修复完成 ===');
    console.log(`总订单数: ${rejectedOrders.length}`);
    console.log(`已修复: ${fixedCount}`);
    console.log(`已跳过: ${skippedCount}`);
    console.log(`失败: ${errorCount}`);

  } catch (error) {
    console.error('修复过程出错:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n数据库连接已关闭');
  }
}

// 运行修复
fixRejectedWithdrawals();
