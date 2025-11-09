const mongoose = require('mongoose');
const { userConnection } = require('../config/database');

const activityLogSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['user', 'search', 'payment', 'withdraw', 'system', 'ticket', 'commission']
  },
  message: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 索引
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ type: 1, createdAt: -1 });

// 静态方法：记录活动
activityLogSchema.statics.log = async function(type, message, userId = null, metadata = {}) {
  try {
    await this.create({
      type,
      message,
      userId,
      metadata
    });
  } catch (error) {
    console.error('记录活动日志失败:', error);
  }
};

// 静态方法：获取最近活动
activityLogSchema.statics.getRecent = async function(limit = 5) {
  return await this.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

// 静态方法：清理旧日志（保留最近30天）
activityLogSchema.statics.cleanup = async function() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const result = await this.deleteMany({ createdAt: { $lt: thirtyDaysAgo } });
  console.log(`清理了 ${result.deletedCount} 条旧活动日志`);
  return result;
};

const ActivityLog = userConnection.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
