const mongoose = require('mongoose');
const { userConnection } = require('../config/database');

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['account', 'search', 'payment', 'referral', 'vip', 'general'],
    default: 'general'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  helpful: {
    type: Number,
    default: 0
  },
  notHelpful: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// 索引
faqSchema.index({ category: 1, order: 1 });
faqSchema.index({ isActive: 1 });

const FAQ = userConnection.model('FAQ', faqSchema);

module.exports = FAQ;
