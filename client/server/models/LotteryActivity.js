const mongoose = require('mongoose');
const { userConnection } = require('../config/database');

const prizeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['points', 'vip', 'coupon', 'physical', 'thanks'],
    required: true
  },
  value: {
    type: Number,
    default: 0
  },
  quantity: {
    type: Number,
    default: -1  // -1 表示无限
  },
  probability: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  image: String,
  description: String
}, { _id: true });

const lotteryActivitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  costPoints: {
    type: Number,
    required: true,
    min: 0
  },
  dailyLimit: {
    type: Number,
    default: 0  // 0 表示无限制
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  prizes: [prizeSchema],
  totalDraws: {
    type: Number,
    default: 0
  },
  totalWinners: {
    type: Number,
    default: 0
  },
  animationType: {
    type: String,
    enum: ['slot', 'wheel', 'card'],
    default: 'slot'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// 索引
lotteryActivitySchema.index({ isActive: 1, startTime: 1, endTime: 1 });
lotteryActivitySchema.index({ createdAt: -1 });

const LotteryActivity = userConnection.model('LotteryActivity', lotteryActivitySchema);

module.exports = LotteryActivity;
