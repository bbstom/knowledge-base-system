const mongoose = require('mongoose');
const { userConnection } = require('../config/database');

const verificationCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  code: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['password_reset', 'email_verification', 'login'],
    default: 'password_reset'
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10分钟后过期
  },
  used: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 创建索引
verificationCodeSchema.index({ email: 1, type: 1 });
verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL索引，自动删除过期文档

// 生成6位数字验证码
verificationCodeSchema.statics.generateCode = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 验证验证码
verificationCodeSchema.methods.verify = function(inputCode) {
  // 检查是否已使用
  if (this.used) {
    return { success: false, message: '验证码已使用' };
  }

  // 检查是否过期
  if (new Date() > this.expiresAt) {
    return { success: false, message: '验证码已过期' };
  }

  // 检查尝试次数
  if (this.attempts >= 5) {
    return { success: false, message: '验证码尝试次数过多，请重新获取' };
  }

  // 验证码匹配
  if (this.code === inputCode) {
    this.used = true;
    return { success: true, message: '验证成功' };
  } else {
    this.attempts += 1;
    return { success: false, message: '验证码错误' };
  }
};

const VerificationCode = userConnection.model('VerificationCode', verificationCodeSchema);

module.exports = VerificationCode;
