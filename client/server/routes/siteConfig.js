const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SiteConfig = require('../models/SiteConfig');

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
 * 管理员权限中间件
 */
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    });
  }
  next();
};

/**
 * 获取网站配置（公开）
 * GET /api/site-config
 */
router.get('/', async (req, res) => {
  try {
    const config = await SiteConfig.getConfig();
    
    // 不返回敏感信息
    const publicConfig = {
      siteName: config.siteName,
      siteDescription: config.siteDescription,
      logoUrl: config.logoUrl,
      faviconUrl: config.faviconUrl,
      footerText: config.footerText,
      contactEmail: config.contactEmail,
      contactPhone: config.contactPhone,
      contactAddress: config.contactAddress,
      socialLinks: config.socialLinks
    };

    res.json({
      success: true,
      data: publicConfig
    });
  } catch (error) {
    console.error('Get site config error:', error);
    res.status(500).json({
      success: false,
      message: '获取配置失败'
    });
  }
});

/**
 * 获取充值配置（公开）
 * GET /api/site-config/recharge
 */
router.get('/recharge', async (req, res) => {
  try {
    const config = await SiteConfig.getConfig();
    
    // 返回充值套餐配置（从正确的字段读取）
    const rechargeConfig = {
      pointsPackages: config.recharge?.packages || [],
      vipPackages: config.vip?.packages || []
    };

    res.json({
      success: true,
      config: rechargeConfig
    });
  } catch (error) {
    console.error('Get recharge config error:', error);
    res.status(500).json({
      success: false,
      message: '获取充值配置失败'
    });
  }
});

/**
 * 获取完整网站配置（管理员）
 * GET /api/site-config/admin
 */
router.get('/admin', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const config = await SiteConfig.getConfig();

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Get admin site config error:', error);
    res.status(500).json({
      success: false,
      message: '获取配置失败'
    });
  }
});

/**
 * 更新网站配置（管理员）
 * PUT /api/site-config
 */
router.put('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const config = await SiteConfig.getConfig();

    // 更新配置
    Object.assign(config, req.body);
    config.updatedBy = req.user._id;
    config.updatedAt = new Date();

    await config.save();

    console.log(`✅ 管理员 ${req.user.username} 更新了网站配置`);

    res.json({
      success: true,
      message: '配置已保存',
      data: config
    });
  } catch (error) {
    console.error('Update site config error:', error);
    res.status(500).json({
      success: false,
      message: '保存配置失败'
    });
  }
});

/**
 * 重置网站配置（管理员）
 * POST /api/site-config/reset
 */
router.post('/reset', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const config = await SiteConfig.getConfig();

    // 重置为默认值
    config.siteName = 'InfoSearch';
    config.siteDescription = '专业的信息搜索平台';
    config.logoUrl = '';
    config.faviconUrl = '';
    config.footerText = '© 2024 InfoSearch. All rights reserved.';
    config.contactEmail = '';
    config.contactPhone = '';
    config.contactAddress = '';
    config.socialLinks = {
      wechat: '',
      qq: '',
      weibo: '',
      twitter: ''
    };
    config.updatedBy = req.user._id;
    config.updatedAt = new Date();

    await config.save();

    console.log(`✅ 管理员 ${req.user.username} 重置了网站配置`);

    res.json({
      success: true,
      message: '配置已重置',
      data: config
    });
  } catch (error) {
    console.error('Reset site config error:', error);
    res.status(500).json({
      success: false,
      message: '重置配置失败'
    });
  }
});

module.exports = router;
