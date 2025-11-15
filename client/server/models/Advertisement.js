const mongoose = require('mongoose');
const { userConnection } = require('../config/database');

const advertisementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: false,  // 轮播广告不需要content
    default: ''
  },
  // 广告类型：html（普通HTML）或 carousel（轮播）
  type: {
    type: String,
    enum: ['html', 'carousel'],
    default: 'html'
  },
  // 轮播广告配置
  carouselImages: [{
    type: String  // 图片URL数组
  }],
  carouselLinks: [{
    type: String  // 对应的链接URL数组
  }],
  carouselInterval: {
    type: Number,
    default: 5000  // 自动切换间隔（毫秒）
  },
  carouselHeight: {
    type: String,
    default: '400px'  // 轮播高度
  },
  showControls: {
    type: Boolean,
    default: true  // 是否显示左右箭头
  },
  showIndicators: {
    type: Boolean,
    default: true  // 是否显示指示器
  },
  position: {
    type: String,
    enum: ['search', 'home', 'databases', 'sidebar'],
    default: 'search'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// 索引
advertisementSchema.index({ position: 1, isActive: 1, order: 1 });
advertisementSchema.index({ startDate: 1, endDate: 1 });

const Advertisement = userConnection.model('Advertisement', advertisementSchema);

module.exports = Advertisement;
