const mongoose = require('mongoose');
const { userConnection } = require('../config/database');

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['security', 'legal', 'tips', 'vip', 'announcement', 'general'],
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isHot: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  customUpdatedAt: {
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
topicSchema.index({ category: 1, isActive: 1 });
topicSchema.index({ isHot: 1, views: -1 });
topicSchema.index({ createdAt: -1 });

const Topic = userConnection.model('Topic', topicSchema);

module.exports = Topic;
