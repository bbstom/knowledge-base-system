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
    required: true
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
