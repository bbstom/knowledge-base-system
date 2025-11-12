const mongoose = require('mongoose');
const { userConnection } = require('../config/database');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 0
  },
  commission: {
    type: Number,
    default: 0,
    index: true
  },
  vipStatus: {
    type: String,
    enum: ['none', 'bronze', 'silver', 'gold', 'platinum', 'diamond'],
    default: 'none'
  },
  vipExpireAt: {
    type: Date,
    default: null
  },
  isVip: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true  // 允许多个null值，只对非null值强制唯一
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  referralStats: {
    totalReferrals: {
      type: Number,
      default: 0
    },
    validReferrals: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    }
  },
  totalRecharged: {
    type: Number,
    default: 0
  },
  totalConsumed: {
    type: Number,
    default: 0
  },
  lastDailyClaimAt: {
    type: Date,
    default: null
  },
  referralCount: {
    type: Number,
    default: 0
  },
  avatar: {
    type: String,
    default: ''
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

// 检查VIP是否过期
userSchema.methods.checkVipStatus = function() {
  if (this.vipExpireAt && this.vipExpireAt < new Date()) {
    this.isVip = false;
    return false;
  }
  return this.isVip;
};

// 延长VIP时间
userSchema.methods.extendVip = function(days) {
  const now = new Date();
  if (this.vipExpireAt && this.vipExpireAt > now) {
    // 如果VIP未过期，在现有基础上延长
    this.vipExpireAt = new Date(this.vipExpireAt.getTime() + days * 24 * 60 * 60 * 1000);
  } else {
    // 如果VIP已过期或首次开通，从现在开始计算
    this.vipExpireAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  }
  this.isVip = true;
};

const User = userConnection.model('User', userSchema);

module.exports = User;
