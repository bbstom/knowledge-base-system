const mongoose = require('mongoose');

/**
 * 充值卡密模型
 */
const rechargeCardSchema = new mongoose.Schema({
  // 卡密码（唯一）
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  
  // 卡密类型
  type: {
    type: String,
    enum: ['balance', 'points', 'vip'],
    required: true
  },
  
  // 充值金额（余额类型）
  amount: {
    type: Number,
    default: 0
  },
  
  // 积分数量（积分类型）
  points: {
    type: Number,
    default: 0
  },
  
  // VIP天数（VIP类型）
  vipDays: {
    type: Number,
    default: 0
  },
  
  // VIP套餐名称
  vipPackageName: {
    type: String,
    default: ''
  },
  
  // 状态
  status: {
    type: String,
    enum: ['unused', 'used', 'expired', 'disabled'],
    default: 'unused'
  },
  
  // 使用者ID
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // 使用时间
  usedAt: {
    type: Date,
    default: null
  },
  
  // 过期时间
  expiresAt: {
    type: Date,
    default: null
  },
  
  // 批次号（方便批量管理）
  batchNumber: {
    type: String,
    default: ''
  },
  
  // 备注
  note: {
    type: String,
    default: ''
  },
  
  // 创建者
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // 创建时间
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // 更新时间
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 索引
rechargeCardSchema.index({ code: 1 });
rechargeCardSchema.index({ status: 1 });
rechargeCardSchema.index({ type: 1 });
rechargeCardSchema.index({ batchNumber: 1 });
rechargeCardSchema.index({ createdAt: -1 });

// 更新时间中间件
rechargeCardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 检查是否过期
rechargeCardSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// 检查是否可用
rechargeCardSchema.methods.isAvailable = function() {
  return this.status === 'unused' && !this.isExpired();
};

module.exports = mongoose.model('RechargeCard', rechargeCardSchema);
