const mongoose = require('mongoose');
const { userConnection } = require('../config/database');

const balanceLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['recharge', 'recharge_card', 'consume', 'refund', 'commission', 'vip', 'search', 'exchange', 'withdraw', 'commission_to_balance', 'register', 'referral_bonus', 'referral_reward', 'daily_claim'],
    required: true
  },
  currency: {
    type: String,
    enum: ['points', 'balance', 'commission'],
    default: 'points'
  },
  amount: {
    type: Number,
    required: true
  },
  balanceBefore: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  relatedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  orderId: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

// 索引
balanceLogSchema.index({ userId: 1, createdAt: -1 });
balanceLogSchema.index({ type: 1 });
balanceLogSchema.index({ currency: 1 });
balanceLogSchema.index({ relatedUserId: 1 });

const BalanceLog = userConnection.model('BalanceLog', balanceLogSchema);

module.exports = BalanceLog;
