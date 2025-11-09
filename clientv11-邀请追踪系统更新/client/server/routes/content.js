const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Content = require('../models/Content');

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
 * 获取内容列表（公开）
 * GET /api/content
 */
router.get('/', async (req, res) => {
  try {
    const { PAGE_SIZE } = require('../config/pagination');
    const { type, status = 'published', page = 1, limit = PAGE_SIZE } = req.query;
    const skip = (page - 1) * limit;

    const query = { status };
    if (type) query.type = type;

    const contents = await Content.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username');

    const total = await Content.countDocuments(query);

    res.json({
      success: true,
      data: {
        contents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get contents error:', error);
    res.status(500).json({ success: false, message: '获取内容失败' });
  }
});

/**
 * 获取单个内容（公开）
 * GET /api/content/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const content = await Content.findById(req.params.id)
      .populate('author', 'username');

    if (!content) {
      return res.status(404).json({ success: false, message: '内容不存在' });
    }

    // 增加浏览量
    content.views += 1;
    await content.save();

    res.json({ success: true, data: content });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ success: false, message: '获取内容失败' });
  }
});

/**
 * 创建内容（管理员）
 * POST /api/content
 */
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const content = new Content({
      ...req.body,
      author: req.user._id
    });

    if (content.status === 'published' && !content.publishedAt) {
      content.publishedAt = new Date();
    }

    await content.save();

    console.log(`✅ 管理员 ${req.user.username} 创建了内容: ${content.title}`);

    res.json({
      success: true,
      message: '内容已创建',
      data: content
    });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({ success: false, message: '创建内容失败' });
  }
});

/**
 * 更新内容（管理员）
 * PUT /api/content/:id
 */
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({ success: false, message: '内容不存在' });
    }

    // 更新内容
    Object.assign(content, req.body);

    // 如果状态改为published且没有发布时间，设置发布时间
    if (content.status === 'published' && !content.publishedAt) {
      content.publishedAt = new Date();
    }

    await content.save();

    console.log(`✅ 管理员 ${req.user.username} 更新了内容: ${content.title}`);

    res.json({
      success: true,
      message: '内容已更新',
      data: content
    });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ success: false, message: '更新内容失败' });
  }
});

/**
 * 删除内容（管理员）
 * DELETE /api/content/:id
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const content = await Content.findByIdAndDelete(req.params.id);

    if (!content) {
      return res.status(404).json({ success: false, message: '内容不存在' });
    }

    console.log(`✅ 管理员 ${req.user.username} 删除了内容: ${content.title}`);

    res.json({
      success: true,
      message: '内容已删除'
    });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ success: false, message: '删除内容失败' });
  }
});

module.exports = router;
