const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SystemConfig = require('../models/SystemConfig');

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
 * 获取系统配置
 * GET /api/system-config
 */
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const config = await SystemConfig.getConfig();
    res.json({ success: true, data: config });
  } catch (error) {
    console.error('Get system config error:', error);
    res.status(500).json({ success: false, message: '获取配置失败' });
  }
});

/**
 * 更新系统配置
 * PUT /api/system-config
 */
router.put('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const config = await SystemConfig.getConfig();
    
    // 更新配置
    Object.assign(config, req.body);
    config.updatedBy = req.user._id;
    
    await config.save();

    console.log(`✅ 管理员 ${req.user.username} 更新了系统配置`);

    res.json({
      success: true,
      message: '配置已保存',
      data: config
    });
  } catch (error) {
    console.error('Update system config error:', error);
    res.status(500).json({ success: false, message: '保存配置失败' });
  }
});

/**
 * 更新搜索类型配置
 * PUT /api/system-config/search-types
 */
router.put('/search-types', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const config = await SystemConfig.getConfig();
    config.searchTypes = req.body.searchTypes;
    config.updatedBy = req.user._id;
    await config.save();

    console.log(`✅ 管理员 ${req.user.username} 更新了搜索类型配置`);

    res.json({ success: true, message: '配置已保存', data: config.searchTypes });
  } catch (error) {
    console.error('Update search types error:', error);
    res.status(500).json({ success: false, message: '保存失败' });
  }
});

/**
 * 更新数据库配置
 * PUT /api/system-config/databases
 */
router.put('/databases', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const config = await SystemConfig.getConfig();
    config.databases = req.body.databases;
    config.updatedBy = req.user._id;
    await config.save();

    console.log(`✅ 管理员 ${req.user.username} 更新了数据库配置`);

    res.json({ success: true, message: '配置已保存', data: config.databases });
  } catch (error) {
    console.error('Update databases error:', error);
    res.status(500).json({ success: false, message: '保存失败' });
  }
});

/**
 * 更新邮件配置
 * PUT /api/system-config/email
 */
router.put('/email', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const config = await SystemConfig.getConfig();
    config.email = req.body.email;
    config.updatedBy = req.user._id;
    await config.save();

    console.log(`✅ 管理员 ${req.user.username} 更新了邮件配置`);

    res.json({ success: true, message: '配置已保存', data: config.email });
  } catch (error) {
    console.error('Update email config error:', error);
    res.status(500).json({ success: false, message: '保存失败' });
  }
});

/**
 * 更新积分配置
 * PUT /api/system-config/points
 */
router.put('/points', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const config = await SystemConfig.getConfig();
    config.points = req.body.points;
    config.updatedBy = req.user._id;
    await config.save();

    console.log(`✅ 管理员 ${req.user.username} 更新了积分配置`);

    res.json({ success: true, message: '配置已保存', data: config.points });
  } catch (error) {
    console.error('Update points config error:', error);
    res.status(500).json({ success: false, message: '保存失败' });
  }
});

module.exports = router;
