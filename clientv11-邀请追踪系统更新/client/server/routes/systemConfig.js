const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SystemConfig = require('../models/SystemConfig');
const { encrypt, decrypt } = require('../utils/encryption');

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

/**
 * 获取积分说明配置
 * GET /api/system-config/points-descriptions
 */
router.get('/points-descriptions', authMiddleware, async (req, res) => {
  try {
    const config = await SystemConfig.getConfig();
    
    // 默认配置
    const defaultDescriptions = {
      earnMethods: [
        { id: 'daily-checkin', title: '每日签到', description: '每天签到获得积分', reward: '+10', icon: 'calendar', color: 'blue', order: 1 },
        { id: 'referral', title: '推荐好友', description: '好友注册并验证邮箱', reward: '+50', icon: 'users', color: 'green', order: 2 },
        { id: 'purchase', title: '消费返积分', description: '每消费1元返1积分', reward: '1:1', icon: 'shopping-cart', color: 'purple', order: 3 },
        { id: 'activity', title: '活动奖励', description: '参与平台活动', reward: '不定期', icon: 'gift', color: 'yellow', order: 4 }
      ],
      usageMethods: [
        { id: 'search', title: '搜索抵扣', description: '使用积分进行数据搜索', order: 1 },
        { id: 'exchange', title: '兑换商品', description: '积分可兑换平台商品', order: 2 },
        { id: 'vip', title: 'VIP升级', description: '使用积分升级VIP会员', order: 3 }
      ]
    };

    const descriptions = config.points?.descriptions || defaultDescriptions;
    
    res.json({ success: true, data: descriptions });
  } catch (error) {
    console.error('Get points descriptions error:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

/**
 * 更新积分说明配置
 * PUT /api/system-config/points-descriptions
 */
router.put('/points-descriptions', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { earnMethods, usageMethods } = req.body;
    
    // 验证
    if (!earnMethods || !Array.isArray(earnMethods) || earnMethods.length === 0) {
      return res.status(400).json({ success: false, message: '至少需要一个获取方式' });
    }
    if (!usageMethods || !Array.isArray(usageMethods) || usageMethods.length === 0) {
      return res.status(400).json({ success: false, message: '至少需要一个积分用途' });
    }
    
    // 验证每个项
    for (const method of earnMethods) {
      if (!method.title || method.title.length > 50) {
        return res.status(400).json({ success: false, message: '标题不能为空且不超过50字符' });
      }
      if (!method.description || method.description.length > 200) {
        return res.status(400).json({ success: false, message: '描述不能为空且不超过200字符' });
      }
    }
    
    for (const method of usageMethods) {
      if (!method.title || method.title.length > 50) {
        return res.status(400).json({ success: false, message: '标题不能为空且不超过50字符' });
      }
      if (!method.description || method.description.length > 200) {
        return res.status(400).json({ success: false, message: '描述不能为空且不超过200字符' });
      }
    }
    
    const config = await SystemConfig.getConfig();
    if (!config.points) {
      config.points = {};
    }
    config.points.descriptions = { earnMethods, usageMethods };
    config.updatedBy = req.user._id;
    await config.save();

    console.log(`✅ 管理员 ${req.user.username} 更新了积分说明配置`);

    res.json({ success: true, message: '配置已保存', data: config.points.descriptions });
  } catch (error) {
    console.error('Update points descriptions error:', error);
    res.status(500).json({ success: false, message: '保存失败' });
  }
});

/**
 * 获取SMTP配置
 * GET /api/system-config/smtp
 */
router.get('/smtp', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const config = await SystemConfig.findOne();
    
    if (!config || !config.email) {
      return res.json({
        success: true,
        data: {
          smtpHost: '',
          smtpPort: 587,
          smtpSecure: false,
          smtpUser: '',
          smtpPassword: '', // 不返回密码
          fromName: '',
          fromEmail: ''
        }
      });
    }
    
    // 返回配置但不包含密码
    res.json({
      success: true,
      data: {
        smtpHost: config.email.smtpHost || '',
        smtpPort: config.email.smtpPort || 587,
        smtpSecure: config.email.smtpSecure || false,
        smtpUser: config.email.smtpUser || '',
        smtpPassword: config.email.smtpPassword ? '******' : '', // 隐藏密码
        fromName: config.email.fromName || '',
        fromEmail: config.email.fromEmail || ''
      }
    });
  } catch (error) {
    console.error('Get SMTP config error:', error);
    res.status(500).json({
      success: false,
      message: '获取SMTP配置失败'
    });
  }
});

/**
 * 更新SMTP配置
 * POST /api/system-config/smtp
 */
router.post('/smtp', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { smtpHost, smtpPort, smtpSecure, smtpUser, smtpPassword, fromName, fromEmail } = req.body;
    
    let config = await SystemConfig.findOne();
    
    if (!config) {
      config = new SystemConfig({});
    }
    
    if (!config.email) {
      config.email = {};
    }
    
    // 更新配置
    config.email.smtpHost = smtpHost;
    config.email.smtpPort = smtpPort || 587;
    config.email.smtpSecure = smtpSecure || false;
    config.email.smtpUser = smtpUser;
    config.email.fromName = fromName;
    config.email.fromEmail = fromEmail;
    
    // 只有提供了新密码才更新（不是******）
    if (smtpPassword && smtpPassword !== '******') {
      config.email.smtpPassword = encrypt(smtpPassword);
    }
    
    await config.save();
    
    res.json({
      success: true,
      message: 'SMTP配置已保存'
    });
  } catch (error) {
    console.error('Update SMTP config error:', error);
    res.status(500).json({
      success: false,
      message: '保存SMTP配置失败'
    });
  }
});

/**
 * 测试SMTP配置
 * POST /api/system-config/smtp/test
 */
router.post('/smtp/test', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { testEmail } = req.body;
    
    if (!testEmail) {
      return res.status(400).json({
        success: false,
        message: '请提供测试邮箱地址'
      });
    }
    
    const emailService = require('../services/emailService');
    const nodemailer = require('nodemailer');
    
    // 创建传输器
    const transporter = await emailService.createTransporter();
    
    // 发送测试邮件
    await transporter.sendMail({
      from: `"${process.env.SITE_NAME || '系统'}" <${process.env.SMTP_USER}>`,
      to: testEmail,
      subject: 'SMTP配置测试',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>✅ SMTP配置测试成功！</h2>
          <p>如果您收到这封邮件，说明SMTP配置正确。</p>
          <p>测试时间：${new Date().toLocaleString('zh-CN')}</p>
        </div>
      `
    });
    
    res.json({
      success: true,
      message: '测试邮件已发送，请检查收件箱'
    });
  } catch (error) {
    console.error('Test SMTP error:', error);
    res.status(500).json({
      success: false,
      message: '测试失败：' + error.message
    });
  }
});

module.exports = router;


/**
 * 获取卡密购买配置
 * GET /api/system-config/recharge-card
 */
router.get('/recharge-card', async (req, res) => {
  try {
    const config = await SystemConfig.getConfig();
    
    // 默认配置
    const defaultConfig = {
      enabled: true,
      title: '充值卡密购买',
      description: '购买充值卡密，快速充值积分或开通VIP',
      purchaseUrl: '',
      instructions: '1. 点击购买链接\n2. 选择需要的卡密类型\n3. 完成支付后获取卡密\n4. 在充值页面输入卡密即可使用'
    };

    const rechargeCardConfig = config.rechargeCard || defaultConfig;
    
    res.json({ success: true, data: rechargeCardConfig });
  } catch (error) {
    console.error('Get recharge card config error:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

/**
 * 更新卡密购买配置
 * PUT /api/system-config/recharge-card
 */
router.put('/recharge-card', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { enabled, title, description, purchaseUrl, instructions } = req.body;
    
    // 验证
    if (title && title.length > 100) {
      return res.status(400).json({ success: false, message: '标题不能超过100字符' });
    }
    if (description && description.length > 500) {
      return res.status(400).json({ success: false, message: '描述不能超过500字符' });
    }
    if (purchaseUrl && purchaseUrl.length > 500) {
      return res.status(400).json({ success: false, message: '购买链接不能超过500字符' });
    }
    if (instructions && instructions.length > 2000) {
      return res.status(400).json({ success: false, message: '使用说明不能超过2000字符' });
    }
    
    const config = await SystemConfig.getConfig();
    
    // 更新配置
    config.rechargeCard = {
      enabled: enabled !== undefined ? enabled : true,
      title: title || '充值卡密购买',
      description: description || '购买充值卡密，快速充值积分或开通VIP',
      purchaseUrl: purchaseUrl || '',
      instructions: instructions || '1. 点击购买链接\n2. 选择需要的卡密类型\n3. 完成支付后获取卡密\n4. 在充值页面输入卡密即可使用'
    };
    
    config.updatedBy = req.user._id;
    await config.save();
    
    console.log(`✅ 管理员 ${req.user.username} 更新了卡密购买配置`);
    
    res.json({ 
      success: true, 
      message: '更新成功',
      data: config.rechargeCard
    });
  } catch (error) {
    console.error('Update recharge card config error:', error);
    res.status(500).json({ success: false, message: '更新失败' });
  }
});
