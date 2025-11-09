// models/PointHistory.js
const mongoose = require('mongoose');
const { userDbConnection } = require('../config/db'); 

const pointHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        index: true,
    },
    type: { // 积分类型: 'earned' (获取), 'spent' (消费)
        type: String,
        enum: ['earned', 'spent'],
        required: true,
    },
    amount: { // 积分数量（正数）
        type: Number,
        required: true,
        min: 1,
    },
    source: { 
        type: String,
        enum: ['daily_claim', 'referral', 'purchase', 'search_cost', 'admin_adjust'],
        required: true,
    },
    relatedRecordId: { // 关联的记录ID (例如搜索记录ID，购买订单ID)
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },
    description: {
        type: String,
        default: null,
    }
}, { 
    timestamps: true,
    collection: 'point_history'
});

module.exports = userDbConnection.model('PointHistory', pointHistorySchema);