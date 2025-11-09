const mongoose = require('mongoose');
const { userConnection } = require('../config/database');

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['article', 'announcement', 'faq', 'help', 'terms', 'privacy'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  category: {
    type: String,
    default: ''
  },
  tags: [{
    type: String
  }],
  views: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// 索引
contentSchema.index({ type: 1, status: 1 });
contentSchema.index({ author: 1 });
contentSchema.index({ publishedAt: -1 });

const Content = userConnection.model('Content', contentSchema);

module.exports = Content;
