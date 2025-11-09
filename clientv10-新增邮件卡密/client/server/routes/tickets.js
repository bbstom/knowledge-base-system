const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Ticket = require('../models/Ticket');

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
 * 创建工单
 * POST /api/tickets
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { subject, category, priority, content } = req.body;

    // 验证
    if (!subject || !content) {
      return res.status(400).json({
        success: false,
        message: '请填写标题和内容'
      });
    }

    // 生成工单编号
    const ticketNumber = await Ticket.generateTicketNumber();

    // 创建工单
    const ticket = new Ticket({
      ticketNumber,
      userId: req.user._id,
      subject,
      category: category || 'general',
      priority: priority || 'medium',
      status: 'open',
      messages: [{
        content,
        isAdmin: false,
        createdBy: req.user._id
      }]
    });

    await ticket.save();

    console.log(`✅ 用户 ${req.user.username} 创建了工单 ${ticketNumber}`);

    res.json({
      success: true,
      message: '工单创建成功',
      data: ticket
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: '创建工单失败'
    });
  }
});

/**
 * 获取用户的工单列表
 * GET /api/tickets
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { userId: req.user._id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tickets, total] = await Promise.all([
      Ticket.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Ticket.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({
      success: false,
      message: '获取工单列表失败'
    });
  }
});

/**
 * 获取单个工单详情
 * GET /api/tickets/:id
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: '工单不存在'
      });
    }

    // 检查权限
    if (ticket.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '无权访问此工单'
      });
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      message: '获取工单详情失败'
    });
  }
});

/**
 * 回复工单
 * POST /api/tickets/:id/reply
 */
router.post('/:id/reply', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: '请输入回复内容'
      });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: '工单不存在'
      });
    }

    // 检查权限
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && ticket.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: '无权回复此工单'
      });
    }

    // 添加回复
    ticket.messages.push({
      content,
      isAdmin,
      createdBy: req.user._id
    });

    // 更新状态
    if (isAdmin && ticket.status === 'open') {
      ticket.status = 'replied';
    }

    ticket.updatedAt = new Date();
    await ticket.save();

    console.log(`✅ ${isAdmin ? '管理员' : '用户'} ${req.user.username} 回复了工单 ${ticket.ticketNumber}`);

    res.json({
      success: true,
      message: '回复成功',
      data: ticket
    });
  } catch (error) {
    console.error('Reply ticket error:', error);
    res.status(500).json({
      success: false,
      message: '回复失败'
    });
  }
});

/**
 * 关闭工单
 * PUT /api/tickets/:id/close
 */
router.put('/:id/close', authMiddleware, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: '工单不存在'
      });
    }

    // 检查权限
    if (ticket.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '无权关闭此工单'
      });
    }

    ticket.status = 'closed';
    ticket.closedAt = new Date();
    ticket.updatedAt = new Date();
    await ticket.save();

    console.log(`✅ ${req.user.role === 'admin' ? '管理员' : '用户'} ${req.user.username} 关闭了工单 ${ticket.ticketNumber}`);

    res.json({
      success: true,
      message: '工单已关闭',
      data: ticket
    });
  } catch (error) {
    console.error('Close ticket error:', error);
    res.status(500).json({
      success: false,
      message: '关闭工单失败'
    });
  }
});

/**
 * 管理员：获取所有工单
 * GET /api/tickets/admin/all
 */
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, priority, search, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { ticketNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tickets, total] = await Promise.all([
      Ticket.find(query)
        .populate('userId', 'username email')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Ticket.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({
      success: false,
      message: '获取工单列表失败'
    });
  }
});

/**
 * 管理员：更新工单状态
 * PUT /api/tickets/admin/:id/status
 */
router.put('/admin/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['open', 'replied', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: '无效的状态'
      });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: '工单不存在'
      });
    }

    ticket.status = status;
    if (status === 'closed') {
      ticket.closedAt = new Date();
    }
    ticket.updatedAt = new Date();
    await ticket.save();

    console.log(`✅ 管理员 ${req.user.username} 更新了工单 ${ticket.ticketNumber} 状态为 ${status}`);

    res.json({
      success: true,
      message: '状态更新成功',
      data: ticket
    });
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({
      success: false,
      message: '更新状态失败'
    });
  }
});

module.exports = router;
