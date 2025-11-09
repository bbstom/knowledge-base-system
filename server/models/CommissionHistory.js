// models/CommissionHistory.js
const mongoose = require('mongoose');
const { userDbConnection } = require('../config/db'); 

const commissionHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        index: true,
    },
    type: { // 交易类型: 'earned' (收入), 'withdrawal_pending' (提现待处理), 'withdrawal_settled' (提现已结算), 'revert' (撤销)
        type: String,
        enum: ['earned', 'withdrawal_pending', 'withdrawal_settled', 'revert'],
        required: true,
    },
    amount: { // 佣金金额
        type: Number,
        required: true,
        default: 0,
    },
    source: { // 收入来源或提现目标：'referral_purchase', 'self_purchase', 'usdt_address'
        type: String,
        required: true,
    },
    relatedUserId: { // 产生收入的用户ID (如果是推荐收入)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    status: { // 状态：'settled', 'pending', 'rejected'
        type: String,
        default: 'settled',
    },
    adminNotes: { // 管理员备注（针对提现请求）
        type: String,
        default: null,
    },
    transactionId: { // 支付网关交易ID或系统流水号
        type: String,
        default: null,
        unique: true,
        sparse: true, // 允许null值不唯一
    }
}, { 
    timestamps: true,
    collection: 'commission_history'
});

module.exports = userDbConnection.model('CommissionHistory', commissionHistorySchema);