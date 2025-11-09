// models/Config.js
const mongoose = require('mongoose');
const { userDbConnection } = require('../config/db'); 
// 配置属于全局数据，我们将其放在用户数据服务器中

const searchItemSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true }, // 例如: 'id_card', 'phone', 'qq'
    label: { type: String, required: true }, // 中文标签: '身份证'
    labelEn: { type: String, required: true }, // 英文标签: 'ID Card'
    pricePoints: { type: Number, required: true, default: 10 }, // 搜索所需积分
    isEnabled: { type: Boolean, default: true },
});

const ConfigSchema = new mongoose.Schema({
    // 唯一的配置文档标识符
    configId: {
        type: String,
        required: true,
        default: 'SYSTEM_CONFIG',
        unique: true,
    },
    
    // 1. 搜索配置
    searchItems: [searchItemSchema], // 可搜索的项目列表
    
    // 2. 佣金配置
    commission: {
        referralRate: { type: Number, default: 0.10 }, // 推荐人佣金比例 (10%)
        minWithdrawal: { type: Number, default: 50 }, // 最小提现金额
        inviteDescription: { type: String, default: '邀请描述' }, // 邀请页面描述
    },
    
    // 3. 积分与每日领取配置
    dailyClaim: {
        points: { type: Number, default: 5 }, // 每日领取积分数量
        isEnabled: { type: Boolean, default: true },
        lastClaimDate: { type: Date, default: null }, // 跟踪上次领取时间
    },

    // 4. 数据库列表（前端展示用）
    dbList: [{
        title: String,
        description: String,
        image: String,
        isEnabled: { type: Boolean, default: true },
    }],
    
    // 5. 网站基础内容 (fqa, topics, commonQuestions)
    contentSettings: {
        fqa: String,
        topics: String,
        commonQuestions: String,
        // ... 其他可编辑的HTML/Markdown内容
    },
    
    // 6. 网站设置（邮箱、认证等） - 仅限超级管理员修改
    websiteSettings: {
        siteName: String,
        language: { type: String, default: 'zh' },
        smtpConfigured: { type: Boolean, default: false },
        // ...
    }
    
}, { timestamps: true });

module.exports = userDbConnection.model('Config', ConfigSchema);