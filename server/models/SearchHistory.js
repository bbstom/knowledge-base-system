// models/SearchHistory.js (新增)
const mongoose = require('mongoose');
const { queryDbConnection } = require('../config/db'); // 导入查询数据连接

const searchHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // 引用 User 模型，虽然在不同 DB，但逻辑上相关
        index: true, // 经常通过 userId 查询，创建索引
    },
    queryText: { // 用户的搜索内容
        type: String,
        required: true,
        trim: true,
    },
    queryType: { // 搜索的类型：'id_card', 'phone', 'qq' 等
        type: String,
        required: true,
        default: 'unknown',
    },
    cost: { // 本次查询的费用 (积分或金额)
        type: Number,
        required: true,
    },
    isSuccess: { // 查询是否成功
        type: Boolean,
        default: true,
    },
    // 其他字段...
}, { timestamps: true });

// 核心：使用 queryDbConnection 的 .model() 方法
module.exports = queryDbConnection.model('SearchHistory', searchHistorySchema, 'search_history'); 
// 最后一个参数 'search_history' 是集合名称 (Collection Name)