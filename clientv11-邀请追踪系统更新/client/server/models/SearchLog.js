const mongoose = require('mongoose');
const { userConnection } = require('../config/database');

const searchLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  searchType: {
    type: String,
    required: true
  },
  searchQuery: {
    type: String,
    required: true
  },
  // 搜索指纹（用于判断重复搜索）
  searchFingerprint: {
    type: String,
    required: true,
    index: true
  },
  resultsCount: {
    type: Number,
    default: 0
  },
  pointsCharged: {
    type: Number,
    default: 0
  },
  searchTime: {
    type: Number,
    default: 0
  },
  databasesSearched: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// 复合索引用于快速查找历史搜索
searchLogSchema.index({ userId: 1, searchFingerprint: 1 });
searchLogSchema.index({ createdAt: -1 });

const SearchLog = userConnection.model('SearchLog', searchLogSchema);

module.exports = SearchLog;
