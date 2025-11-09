const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const SystemConfig = require('../models/SystemConfig');

/**
 * 认证中间件
 */
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未登录'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const User = require('../models/User');
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: '认证失败'
    });
  }
};

/**
 * 获取兑换汇率
 * GET /api/shop/exchange-rate
 */
router.get('/exchange-rate', authMiddleware, async (req, res) => {
  try {
    const config = await SystemConfig.getConfig();
    
    res.json({
      success: true,
      data: {
        exchangeRate: config.points.exchangeRate || 10,
        description: `1元余额 = ${config.points.exchangeRate || 10}积分`
      }
    });
  } catch (error) {
    console.error('Get exchange rate error:', error);
    res.status(500).json({
      success: false,
      message: '获取兑换汇率失败'
    });
  }
});

module.exports = router;
