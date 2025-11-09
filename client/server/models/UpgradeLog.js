const mongoose = require('mongoose');

const upgradeLogSchema = new mongoose.Schema({
  fromVersion: {
    type: String,
    required: true
  },
  toVersion: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'rolled_back'],
    default: 'pending'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  backupId: {
    type: String,
    ref: 'Backup'
  },
  logs: [{
    timestamp: Date,
    level: String, // info, warning, error
    message: String
  }],
  error: {
    type: String
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// 索引
upgradeLogSchema.index({ startTime: -1 });
upgradeLogSchema.index({ status: 1 });

// 添加日志方法
upgradeLogSchema.methods.addLog = function(level, message) {
  this.logs.push({
    timestamp: new Date(),
    level,
    message
  });
  return this.save();
};

// 导出模型工厂函数
module.exports = (connection) => {
  return connection.model('UpgradeLog', upgradeLogSchema);
};
