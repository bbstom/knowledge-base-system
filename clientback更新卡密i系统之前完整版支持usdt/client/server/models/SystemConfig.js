const mongoose = require('mongoose');
const { userConnection } = require('../config/database');

const systemConfigSchema = new mongoose.Schema({
  // 搜索类型配置
  searchTypes: [{
    id: String,
    label: String,
    enabled: Boolean,
    order: Number
  }],
  
  // 数据库配置
  databases: {
    user: {
      name: String,
      type: String,
      host: String,
      port: Number,
      username: String,
      password: String,
      database: String,
      connectionPool: Number,
      timeout: Number
    },
    query: [{
      id: String,
      name: String,
      type: String,
      host: String,
      port: Number,
      username: String,
      password: String,
      database: String,
      connectionPool: Number,
      timeout: Number,
      enabled: Boolean
    }]
  },
  
  // 邮件配置
  email: {
    smtpHost: String,
    smtpPort: Number,
    smtpSecure: Boolean,
    smtpUser: String,
    smtpPassword: String,
    fromName: String,
    fromEmail: String,
    templates: [{
      id: String,
      name: String,
      subject: String,
      content: String,
      enabled: Boolean
    }]
  },
  
  // 积分配置
  points: {
    searchCost: { type: Number, default: 10 },
    enableSearchCost: { type: Boolean, default: true },
    exchangeRate: { type: Number, default: 10 }, // 余额兑换积分汇率：1元 = 10积分
    dailyCheckIn: { type: Number, default: 10 },
    consecutiveBonus: {
      day7: { type: Number, default: 50 },
      day30: { type: Number, default: 200 }
    },
    enableDailyCheckIn: { type: Boolean, default: true },
    referralReward: { type: Number, default: 100 },
    referredUserReward: { type: Number, default: 50 },
    enableReferralReward: { type: Boolean, default: true },
    registerReward: { type: Number, default: 100 },
    enableRegisterReward: { type: Boolean, default: true },
    commissionRate: { type: Number, default: 15 },
    commissionSettlement: { type: String, default: 'instant' },
    minWithdrawAmount: { type: Number, default: 50 },
    withdrawFee: { type: Number, default: 5 },
    usdtRate: { type: Number, default: 0.14 },
    withdrawApproval: { type: String, default: 'manual' },
    autoApprovalLimit: { type: Number, default: 100 },
    commissionLevels: { type: Number, default: 1 },
    secondLevelCommissionRate: { type: Number, default: 5 },
    thirdLevelCommissionRate: { type: Number, default: 2 },
    enableCommission: { type: Boolean, default: true },
    pointsExpireDays: { type: Number, default: 0 },
    maxPoints: { type: Number, default: 0 }
  },
  
  // 元数据
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// 确保只有一个配置文档
systemConfigSchema.statics.getConfig = async function() {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

const SystemConfig = userConnection.model('SystemConfig', systemConfigSchema);

module.exports = SystemConfig;
