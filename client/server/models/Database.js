const mongoose = require('mongoose');
const { userConnection } = require('../config/database');

const databaseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  source: {
    type: String,
    default: '官方数据'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['normal', 'maintenance', 'offline'],
    default: 'normal'
  },
  recordCount: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  supportedTypes: [{
    type: String
    // 移除enum限制，允许动态添加搜索类型
  }],
  // 数据库配置信息（可选）
  config: {
    apiEndpoint: String,
    apiKey: String,
    timeout: {
      type: Number,
      default: 30000
    }
  },
  // 统计信息
  stats: {
    totalSearches: {
      type: Number,
      default: 0
    },
    successRate: {
      type: Number,
      default: 0
    },
    avgResponseTime: {
      type: Number,
      default: 0
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// 索引
databaseSchema.index({ isActive: 1 });
databaseSchema.index({ name: 1 });
databaseSchema.index({ supportedTypes: 1 });

const Database = userConnection.model('Database', databaseSchema);

module.exports = Database;
