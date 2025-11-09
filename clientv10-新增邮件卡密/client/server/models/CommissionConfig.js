const mongoose = require('mongoose');
const { userConnection } = require('../config/database');

const commissionConfigSchema = new mongoose.Schema({
  // 推荐佣金配置
  referral: {
    enabled: {
      type: Boolean,
      default: true
    },
    firstLevelRate: {
      type: Number,
      default: 10,
      min: 0,
      max: 100
    },
    secondLevelRate: {
      type: Number,
      default: 5,
      min: 0,
      max: 100
    },
    thirdLevelRate: {
      type: Number,
      default: 2,
      min: 0,
      max: 100
    }
  },
  
  // 消费返佣配置
  consumption: {
    enabled: {
      type: Boolean,
      default: true
    },
    rate: {
      type: Number,
      default: 5,
      min: 0,
      max: 100
    },
    minAmount: {
      type: Number,
      default: 10
    }
  },
  
  // 充值返佣配置
  recharge: {
    enabled: {
      type: Boolean,
      default: true
    },
    rate: {
      type: Number,
      default: 3,
      min: 0,
      max: 100
    },
    minAmount: {
      type: Number,
      default: 50
    }
  },
  
  // 提现配置
  withdrawal: {
    enabled: {
      type: Boolean,
      default: true
    },
    minAmount: {
      type: Number,
      default: 100
    },
    maxAmount: {
      type: Number,
      default: 10000
    },
    fee: {
      type: Number,
      default: 1,
      min: 0,
      max: 100
    },
    dailyLimit: {
      type: Number,
      default: 3
    }
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
commissionConfigSchema.statics.getConfig = async function() {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

const CommissionConfig = userConnection.model('CommissionConfig', commissionConfigSchema);

module.exports = CommissionConfig;
