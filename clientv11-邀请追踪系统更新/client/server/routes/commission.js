const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const CommissionConfig = require('../models/CommissionConfig');

/**
 * 认证中间件
 */
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: '认证失败' });
  }
};

/**
 * 管理员权限中间件
 */
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: '需要管理员权限' });
  }
  next();
};

/**
 * 获取佣金配置
 * GET /api/commission/config
 */
router.get('/config', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const config = await CommissionConfig.getConfig();
    res.json({ success: true, data: config });
  } catch (error) {
    console.error('Get commission config error:', error);
    res.status(500).json({ success: false, message: '获取配置失败' });
  }
});

/**
 * 更新佣金配置
 * PUT /api/commission/config
 */
router.put('/config', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const config = await CommissionConfig.getConfig();
    
    // 更新配置
    Object.assign(config, req.body);
    config.updatedBy = req.user._id;
    
    await config.save();

    console.log(`✅ 管理员 ${req.user.username} 更新了佣金配置`);

    res.json({
      success: true,
      message: '配置已保存',
      data: config
    });
  } catch (error) {
    console.error('Update commission config error:', error);
    res.status(500).json({ success: false, message: '保存配置失败' });
  }
});

module.exports = router;
