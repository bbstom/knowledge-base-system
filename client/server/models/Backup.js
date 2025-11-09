const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema({
  backupId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  version: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['auto', 'manual'],
    default: 'manual'
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending'
  },
  size: {
    type: Number,
    default: 0
  },
  filePath: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  error: {
    type: String
  }
}, {
  timestamps: true
});

// 索引
backupSchema.index({ createdAt: -1 });
backupSchema.index({ status: 1 });

// 导出模型工厂函数
module.exports = (connection) => {
  return connection.model('Backup', backupSchema);
};
