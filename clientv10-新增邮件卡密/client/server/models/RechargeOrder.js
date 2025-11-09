const mongoose = require('mongoose');
const { userConnection } = require('../config/database');

const rechargeOrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['points', 'vip'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currencyType: {
    type: String,
    enum: ['CNY', 'USD'],
    default: 'USD'  // 新订单默认使用USD
  },
  actualAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    enum: ['USDT', 'TRX'],
    required: true
  },
  paymentAddress: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'expired', 'failed'],
    default: 'pending'
  },
  txHash: {
    type: String,
    default: null
  },
  blockNumber: {
    type: Number,
    default: null
  },
  // 积分充值相关
  points: {
    type: Number,
    default: 0
  },
  // VIP充值相关
  vipDays: {
    type: Number,
    default: 0
  },
  vipPackageName: {
    type: String,
    default: null
  },
  expireAt: {
    type: Date,
    required: true
  },
  paidAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 索引
rechargeOrderSchema.index({ userId: 1, createdAt: -1 });
rechargeOrderSchema.index({ orderId: 1 });
rechargeOrderSchema.index({ status: 1 });

const RechargeOrder = userConnection.model('RechargeOrder', rechargeOrderSchema);

module.exports = RechargeOrder;
