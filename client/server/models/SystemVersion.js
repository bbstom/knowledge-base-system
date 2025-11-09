const mongoose = require('mongoose');

const systemVersionSchema = new mongoose.Schema({
  version: {
    type: String,
    required: true,
    unique: true
  },
  releaseDate: {
    type: Date,
    default: Date.now
  },
  changelog: {
    type: String,
    default: ''
  },
  features: [{
    type: String
  }],
  bugfixes: [{
    type: String
  }],
  breaking: [{
    type: String
  }],
  isCurrent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 索引
systemVersionSchema.index({ version: 1 });
systemVersionSchema.index({ releaseDate: -1 });

// 导出模型工厂函数
module.exports = (connection) => {
  return connection.model('SystemVersion', systemVersionSchema);
};
