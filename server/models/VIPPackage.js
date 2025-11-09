// models/VIPPackage.js
const mongoose = require('mongoose');
const { userDbConnection } = require('../config/db'); 

const VIPPackageSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // 例如: 'bronze', 'gold'
    labelZh: { type: String, required: true }, // 中文名称: '黄金会员'
    labelEn: { type: String, required: true }, // 英文名称: 'Gold VIP'
    
    priceCNY: { type: Number, required: true, default: 99 }, // 价格 (RMB/CNY)
    durationDays: { type: Number, required: true, default: 30 }, // 持续时间（天）
    
    features: [{ type: String }], // 特权列表
    
    // VIP 特权设置 (避免硬编码在前端)
    discountRate: { type: Number, default: 0.9 }, // 搜索折扣 (9折)
    freeSearches: { type: Number, default: 0 }, // 赠送免费搜索次数
    higherCommissionRate: { type: Number, default: 0.15 }, // 专属更高佣金比例 (例如 15%)
    
    isActive: { type: Boolean, default: true },
}, { 
    timestamps: true,
    collection: 'vip_packages'
});

module.exports = userDbConnection.model('VIPPackage', VIPPackageSchema);