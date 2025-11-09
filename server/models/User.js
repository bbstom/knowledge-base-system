// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// 导入用户数据连接
const { userDbConnection } = require('../config/db'); 

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        trim: true,
        // 如果用户未设置，则默认使用邮箱前半部分
        default: function() { return this.email.split('@')[0]; } 
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        select: false, // 默认不返回密码
    },
    isEmailVerified: { // 邮箱验证状态
        type: Boolean,
        default: false,
    },
    emailVerificationToken: String, // 邮箱验证 token
    verificationTokenExpires: Date,
    
    // 权限和状态
    role: { // 'user', 'admin'
        type: String,
        default: 'user',
    },
    vipStatus: { // 'none', 'bronze', 'gold', 'platinum'
        type: String,
        default: 'none',
    },
    vipExpires: Date,

    // 财务和推荐
    points: { // 积分总额
        type: Number,
        default: 0,
    },
    commissionBalance: { // 可提现佣金
        type: Number,
        default: 0,
    },
    totalCommissionEarned: { // 历史总佣金
        type: Number,
        default: 0,
    },
    referralCode: { // 推荐码
        type: String,
        unique: true,
        uppercase: true,
        // 自动生成一个默认推荐码
        default: () => Math.random().toString(36).substring(2, 8).toUpperCase(), 
    },
    referredBy: { // 推荐人 ID
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    usdtWalletAddress: { // 提现钱包地址 (USDT)
        type: String,
        default: null,
    }
}, { 
    timestamps: true,
    collection: 'users' // 明确指定集合名称
});

// 预处理钩子：保存用户前，对密码进行哈希加密
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// 实例方法：比较输入的密码和存储的哈希密码
userSchema.methods.matchPassword = async function (enteredPassword) {
    // 确保 this.password 已经被查询时显式包含 (例如 .select('+password'))
    return await bcrypt.compare(enteredPassword, this.password);
};

// 核心修改：使用 userDbConnection 的 .model() 方法创建模型
module.exports = userDbConnection.model('User', userSchema);