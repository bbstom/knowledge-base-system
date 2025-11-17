const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');

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
 * 获取公开通知（登录前）
 * GET /api/notifications/public
 */
router.get('/public', async (req, res) => {
  try {
    const now = new Date();
    
    // 构建查询条件 - 只返回登录前显示的通知
    const query = {
      status: 'active',
      showTiming: 'before_login',
      startDate: { $lte: now },
      $or: [
        { endDate: { $gte: now } },
        { endDate: null }
      ]
    };

    const notifications = await Notification.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(10)
      .select('-readBy -createdBy'); // 不返回敏感信息

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Get public notifications error:', error);
    res.status(500).json({ success: false, message: '获取通知失败' });
  }
});

/**
 * 获取活动通知（用户）
 * GET /api/notifications/active
 */
router.get('/active', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const userId = req.user._id;
    const isVip = req.user.isVip;
    
    // 构建查询条件
    const query = {
      status: 'active',
      startDate: { $lte: now },
      $and: [
        // 时间条件：未过期或无结束时间
        {
          $or: [
            { endDate: { $gte: now } },
            { endDate: null }
          ]
        },
        // 目标用户条件
        {
          $or: [
            { targetUsers: 'all' },
            { targetUsers: 'vip', $expr: { $eq: [isVip, true] } },
            { targetUsers: 'normal', $expr: { $eq: [isVip, false] } }
          ]
        }
      ]
    };

    const notifications = await Notification.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(10);

    // 过滤掉用户已读的通知
    const unreadNotifications = notifications.filter(notification => {
      const hasRead = notification.readBy.some(
        r => r.userId.toString() === userId.toString()
      );
      return !hasRead;
    });

    res.json({
      success: true,
      data: unreadNotifications
    });
  } catch (error) {
    console.error('Get active notifications error:', error);
    res.status(500).json({ success: false, message: '获取通知失败' });
  }
});

/**
 * 获取所有通知（管理员）
 * GET /api/notifications
 */
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { PAGE_SIZE } = require('../config/pagination');
    const { status, page = 1, limit = PAGE_SIZE } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'username');

    const total = await Notification.countDocuments(query);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: '获取通知失败' });
  }
});

/**
 * 创建通知（管理员）
 * POST /api/notifications
 */
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const notification = new Notification({
      ...req.body,
      createdBy: req.user._id
    });

    await notification.save();

    console.log(`✅ 管理员 ${req.user.username} 创建了通知: ${notification.title}`);

    res.json({
      success: true,
      message: '通知已创建',
      data: notification
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ success: false, message: '创建通知失败' });
  }
});

/**
 * 更新通知（管理员）
 * PUT /api/notifications/:id
 */
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: '通知不存在' });
    }

    Object.assign(notification, req.body);
    await notification.save();

    console.log(`✅ 管理员 ${req.user.username} 更新了通知: ${notification.title}`);

    res.json({
      success: true,
      message: '通知已更新',
      data: notification
    });
  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({ success: false, message: '更新通知失败' });
  }
});

/**
 * 删除通知（管理员）
 * DELETE /api/notifications/:id
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: '通知不存在' });
    }

    console.log(`✅ 管理员 ${req.user.username} 删除了通知: ${notification.title}`);

    res.json({
      success: true,
      message: '通知已删除'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ success: false, message: '删除通知失败' });
  }
});

/**
 * 标记通知为已读（用户）
 * POST /api/notifications/:id/read
 */
router.post('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: '通知不存在' });
    }

    // 检查是否已读
    const alreadyRead = notification.readBy.some(
      r => r.userId.toString() === req.user._id.toString()
    );

    if (!alreadyRead) {
      notification.readBy.push({
        userId: req.user._id,
        readAt: new Date()
      });
      await notification.save();
    }

    res.json({
      success: true,
      message: '已标记为已读'
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ success: false, message: '操作失败' });
  }
});

module.exports = router;
