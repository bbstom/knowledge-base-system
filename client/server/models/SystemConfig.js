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
      name: { type: String },
      type: { type: String },  // 使用 { type: String } 明确指定
      host: { type: String },
      port: { type: Number },
      username: { type: String },
      password: { type: String },       // 加密存储
      database: { type: String },
      authSource: { type: String, default: 'admin' },  // 认证数据库
      connectionPool: { type: Number },
      timeout: { type: Number },
      enabled: { type: Boolean }        // 是否启用配置的数据库
    },
    query: [{
      id: { type: String },
      name: { type: String },
      type: { type: String },  // 使用 { type: String } 明确指定
      host: { type: String },
      port: { type: Number },
      username: { type: String },
      password: { type: String },       // 加密存储
      database: { type: String },
      authSource: { type: String, default: 'admin' },  // 认证数据库
      connectionPool: { type: Number },
      timeout: { type: Number },
      enabled: { type: Boolean },
      description: { type: String }     // 数据库描述
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
    minWithdrawAmountBalance: { type: Number, default: 1 },    // 提现到余额最低金额
    minWithdrawAmount: { type: Number, default: 10 },          // 提现到USDT最低金额
    withdrawFee: { type: Number, default: 5 },
    usdtRate: { type: Number, default: 0.14 },
    withdrawApproval: { type: String, default: 'manual' },
    autoApprovalLimit: { type: Number, default: 100 },
    commissionLevels: { type: Number, default: 1 },
    secondLevelCommissionRate: { type: Number, default: 5 },
    thirdLevelCommissionRate: { type: Number, default: 2 },
    enableCommission: { type: Boolean, default: true },
    pointsExpireDays: { type: Number, default: 0 },
    maxPoints: { type: Number, default: 0 },
    // 积分说明配置
    descriptions: {
      earnMethods: [{
        id: String,
        title: String,
        description: String,
        reward: String,
        icon: String,
        color: String,
        order: Number
      }],
      usageMethods: [{
        id: String,
        title: String,
        description: String,
        order: Number
      }]
    }
  },

  // 卡密购买配置
  rechargeCard: {
    enabled: { type: Boolean, default: true },
    title: { type: String, default: '充值卡密购买' },
    description: { type: String, default: '购买充值卡密，快速充值积分或开通VIP' },
    purchaseUrl: { type: String, default: '' },
    instructions: { type: String, default: '1. 点击购买链接\n2. 选择需要的卡密类型\n3. 完成支付后获取卡密\n4. 在充值页面输入卡密即可使用' }
  },

  // 时区配置
  timezone: {
    value: { type: String, default: 'Asia/Shanghai' },
    displayFormat: { type: String, default: 'YYYY-MM-DD HH:mm:ss' },
    enabled: { type: Boolean, default: true }
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
systemConfigSchema.statics.getConfig = async function () {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

const SystemConfig = userConnection.model('SystemConfig', systemConfigSchema);

module.exports = SystemConfig;
