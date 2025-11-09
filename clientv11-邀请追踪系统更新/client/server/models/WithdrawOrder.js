const mongoose = require('mongoose');
const { userConnection } = require('../config/database');

const withdrawOrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNo: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['commission', 'balance'],
    default: 'commission'
  },
  amount: {
    type: Number,
    required: true
  },
  fee: {
    type: Number,
    default: 0
  },
  actualAmount: {
    type: Number,
    required: true
  },
  walletAddress: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'rejected', 'cancelled'],
    default: 'pending'
  },
  remark: {
    type: String,
    default: null
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  processedAt: {
    type: Date,
    default: null
  },
  txHash: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 索引
withdrawOrderSchema.index({ userId: 1, createdAt: -1 });
withdrawOrderSchema.index({ orderNo: 1 });
withdrawOrderSchema.index({ status: 1 });

const WithdrawOrder = userConnection.model('WithdrawOrder', withdrawOrderSchema);

module.exports = WithdrawOrder;
