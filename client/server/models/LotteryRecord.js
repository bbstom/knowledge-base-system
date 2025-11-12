const mongoose = require('mongoose');
const { userConnection } = require('../config/database');

const lotteryRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LotteryActivity',
    required: true
  },
  prizeId: {
    type: String,
    required: true
  },
  prizeName: {
    type: String,
    required: true
  },
  prizeType: {
    type: String,
    enum: ['points', 'vip', 'coupon', 'physical', 'thanks'],
    required: true
  },
  prizeValue: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'claimed', 'expired', 'cancelled'],
    default: 'pending'
  },
  costPoints: {
    type: Number,
    required: true
  },
  claimedAt: Date,
  shippingInfo: {
    name: String,
    phone: String,
    address: String
  },
  note: String
}, {
  timestamps: true
});

// 索引
lotteryRecordSchema.index({ userId: 1, createdAt: -1 });
lotteryRecordSchema.index({ activityId: 1, createdAt: -1 });
lotteryRecordSchema.index({ status: 1, createdAt: -1 });

const LotteryRecord = userConnection.model('LotteryRecord', lotteryRecordSchema);

module.exports = LotteryRecord;
