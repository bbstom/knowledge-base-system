const mongoose = require('mongoose');
const { userConnection } = require('../config/database');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'html', 'system', 'announcement', 'promotion', 'warning', 'info'],
    default: 'text'
  },
  imageUrl: {
    type: String,
    default: ''
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'normal', 'urgent'],
    default: 'medium'
  },
  targetUsers: {
    type: String,
    enum: ['all', 'vip', 'new', 'active', 'specific'],
    default: 'all'
  },
  specificUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'expired', 'cancelled'],
    default: 'draft'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  viewCount: {
    type: Number,
    default: 0
  },
  link: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// 索引
notificationSchema.index({ status: 1, startDate: -1 });
notificationSchema.index({ targetUsers: 1 });
notificationSchema.index({ createdBy: 1 });

const Notification = userConnection.model('Notification', notificationSchema);

module.exports = Notification;
