const mongoose = require('mongoose');
const { userConnection } = require('../config/database');

const rateLimitSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['email', 'ip'],
    required: true
  },
  action: {
    type: String,
    enum: ['send_code', 'verify_code', 'reset_password'],
    required: true
  },
  count: {
    type: Number,
    default: 1
  },
  windowStart: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后过期
  }
});

// 复合索引
rateLimitSchema.index({ identifier: 1, type: 1, action: 1 });
// TTL索引，自动删除过期文档
rateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// 检查是否超过限制
rateLimitSchema.statics.checkLimit = async function(identifier, type, action, limits) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - limits.window);

  // 查找或创建记录
  let record = await this.findOne({
    identifier,
    type,
    action,
    windowStart: { $gte: windowStart }
  });

  if (!record) {
    // 创建新记录
    record = new this({
      identifier,
      type,
      action,
      count: 1,
      windowStart: now
    });
    await record.save();
    return { allowed: true, remaining: limits.max - 1 };
  }

  // 检查是否超过限制
  if (record.count >= limits.max) {
    const resetTime = new Date(record.windowStart.getTime() + limits.window);
    const minutesLeft = Math.ceil((resetTime - now) / 60000);
    return {
      allowed: false,
      remaining: 0,
      resetIn: minutesLeft,
      message: `请求过于频繁，请在 ${minutesLeft} 分钟后重试`
    };
  }

  // 增加计数
  record.count += 1;
  await record.save();

  return {
    allowed: true,
    remaining: limits.max - record.count
  };
};

// 重置限制（用于测试或管理员操作）
rateLimitSchema.statics.resetLimit = async function(identifier, type, action) {
  await this.deleteMany({ identifier, type, action });
};

const RateLimit = userConnection.model('RateLimit', rateLimitSchema);

module.exports = RateLimit;
