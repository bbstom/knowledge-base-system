const mongoose = require('mongoose');
const { userConnection } = require('../config/database');

const referralVisitSchema = new mongoose.Schema({
  referralCode: {
    type: String,
    required: true,
    index: true
  },
  fingerprint: {
    type: String,
    required: true,
    index: true
  },
  ip: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  firstVisit: {
    type: Date,
    default: Date.now
  },
  lastVisit: {
    type: Date,
    default: Date.now
  },
  visitCount: {
    type: Number,
    default: 1
  },
  converted: {
    type: Boolean,
    default: false
  },
  convertedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后过期
    index: true
  }
}, {
  timestamps: true
});

// 复合索引：用于快速查找
referralVisitSchema.index({ fingerprint: 1, referralCode: 1 });
referralVisitSchema.index({ ip: 1, referralCode: 1 });

// 优化查询：按指纹和转化状态查找
referralVisitSchema.index({ fingerprint: 1, converted: 1, expiresAt: 1 });

// 优化查询：按IP和转化状态查找
referralVisitSchema.index({ ip: 1, converted: 1, expiresAt: 1 });

// 优化转化标记查询
referralVisitSchema.index({ referralCode: 1, converted: 1 });

// 自动删除过期记录
referralVisitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const ReferralVisit = userConnection.model('ReferralVisit', referralVisitSchema);

module.exports = ReferralVisit;
