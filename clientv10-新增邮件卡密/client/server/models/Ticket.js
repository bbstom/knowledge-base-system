const mongoose = require('mongoose');
const { userConnection } = require('../config/database');

const ticketMessageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attachments: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'technical', 'billing', 'account', 'other'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'replied', 'closed'],
    default: 'open'
  },
  messages: [ticketMessageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  closedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// 生成工单编号
ticketSchema.statics.generateTicketNumber = async function() {
  const count = await this.countDocuments();
  const number = (count + 1).toString().padStart(6, '0');
  return `TK${number}`;
};

// 索引
ticketSchema.index({ userId: 1, createdAt: -1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ ticketNumber: 1 });

const Ticket = userConnection.model('Ticket', ticketSchema);

module.exports = Ticket;
