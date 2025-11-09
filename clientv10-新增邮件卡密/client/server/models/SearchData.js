const mongoose = require('mongoose');
const { queryConnection } = require('../config/database');

const searchDataSchema = new mongoose.Schema({
  // 所属数据库
  databaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Database',
    required: true,
    index: true
  },
  // 数据行内容（所有字段）
  data: {
    type: Map,
    of: String,
    required: true
  },
  // 可搜索字段（用于索引和快速查询）
  searchableFields: {
    idcard: { type: String, index: true, sparse: true },
    phone: { type: String, index: true, sparse: true },
    name: { type: String, index: true, sparse: true },
    qq: { type: String, index: true, sparse: true },
    weibo: { type: String, index: true, sparse: true },
    wechat: { type: String, index: true, sparse: true },
    email: { type: String, index: true, sparse: true },
    address: { type: String, index: true, sparse: true },
    company: { type: String, index: true, sparse: true }
  },
  // 是否启用
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// 复合索引用于搜索
searchDataSchema.index({ databaseId: 1, isActive: 1 });

const SearchData = queryConnection.model('SearchData', searchDataSchema);

module.exports = SearchData;
