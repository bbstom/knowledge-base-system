const mongoose = require('mongoose');
const { userConnection } = require('../config/database');

const siteConfigSchema = new mongoose.Schema({
  // 基本信息
  siteName: {
    type: String,
    default: 'InfoSearch'
  },
  siteDescription: {
    type: String,
    default: '专业的信息搜索平台'
  },
  logoUrl: {
    type: String,
    default: ''
  },
  faviconUrl: {
    type: String,
    default: ''
  },
  footerText: {
    type: String,
    default: '© 2024 InfoSearch. All rights reserved.'
  },
  
  // 联系信息
  contactEmail: {
    type: String,
    default: ''
  },
  contactPhone: {
    type: String,
    default: ''
  },
  contactAddress: {
    type: String,
    default: ''
  },
  
  // 社交链接
  socialLinks: {
    wechat: { type: String, default: '' },
    qq: { type: String, default: '' },
    weibo: { type: String, default: '' },
    twitter: { type: String, default: '' }
  },
  
  // 充值配置
  recharge: {
    bepusdtUrl: { type: String, default: '' },
    bepusdtApiKey: { type: String, default: '' },
    bepusdtMerchantId: { type: String, default: '' },
    supportedCurrencies: [{ type: String }],
    packages: [{
      id: String,
      points: Number,
      amount: Number,  // 现价（USD）
      originalAmount: Number,  // 原价（USD）
      enabled: Boolean
    }]
  },
  
  // VIP配置
  vip: {
    packages: [{
      id: String,
      name: String,
      days: Number,
      amount: Number,  // 现价（USD）
      originalAmount: Number,  // 原价（USD）
      features: [String],
      enabled: Boolean
    }]
  },
  
  // 元数据
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// 确保只有一个配置文档
siteConfigSchema.statics.getConfig = async function() {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

const SiteConfig = userConnection.model('SiteConfig', siteConfigSchema);

module.exports = SiteConfig;
