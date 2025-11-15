const express = require('express');
const router = express.Router();
const Topic = require('../models/Topic');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未提供认证令牌' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: '用户不存在' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: '认证失败' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: '需要管理员权限' });
  }
  next();
};

// 获取所有话题（公开）
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 100 } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;

    const topics = await Topic.find(query)
      .sort({ isHot: -1, views: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Topic.countDocuments(query);

    res.json({
      success: true,
      data: {
        topics,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({ success: false, message: '获取话题失败' });
  }
});

// 获取所有话题（管理员）
router.get('/admin', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const topics = await Topic.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Topic.countDocuments();

    res.json({
      success: true,
      data: {
        topics,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({ success: false, message: '获取话题失败' });
  }
});

// 创建话题（管理员）
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, content, category, tags, isHot, isActive, publishedAt, customUpdatedAt } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: '请填写标题和内容'
      });
    }

    const topic = new Topic({
      title,
      content,
      category: category || 'general',
      tags: tags || [],
      isHot: isHot || false,
      isActive: isActive !== undefined ? isActive : true,
      publishedAt: publishedAt || Date.now(),
      customUpdatedAt: customUpdatedAt ? new Date(customUpdatedAt) : null,
      createdBy: req.user._id
    });

    await topic.save();

    console.log(`✅ 管理员 ${req.user.username} 创建了话题: ${topic.title}`);

    res.json({
      success: true,
      message: '话题已创建',
      data: topic
    });
  } catch (error) {
    console.error('Create topic error:', error);
    res.status(500).json({ success: false, message: '创建话题失败' });
  }
});

// 更新话题（管理员）
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ success: false, message: '话题不存在' });
    }

    const { title, content, category, tags, isHot, isActive, publishedAt, customUpdatedAt } = req.body;

    if (title !== undefined) topic.title = title;
    if (content !== undefined) topic.content = content;
    if (category !== undefined) topic.category = category;
    if (tags !== undefined) topic.tags = tags;
    if (isHot !== undefined) topic.isHot = isHot;
    if (isActive !== undefined) topic.isActive = isActive;
    if (publishedAt !== undefined) topic.publishedAt = publishedAt;
    if (customUpdatedAt !== undefined) topic.customUpdatedAt = customUpdatedAt ? new Date(customUpdatedAt) : null;

    await topic.save();

    console.log(`✅ 管理员 ${req.user.username} 更新了话题: ${topic.title}`);

    res.json({
      success: true,
      message: '话题已更新',
      data: topic
    });
  } catch (error) {
    console.error('Update topic error:', error);
    res.status(500).json({ success: false, message: '更新话题失败' });
  }
});

// 删除话题（管理员）
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const topic = await Topic.findByIdAndDelete(req.params.id);
    if (!topic) {
      return res.status(404).json({ success: false, message: '话题不存在' });
    }

    console.log(`✅ 管理员 ${req.user.username} 删除了话题: ${topic.title}`);

    res.json({
      success: true,
      message: '话题已删除'
    });
  } catch (error) {
    console.error('Delete topic error:', error);
    res.status(500).json({ success: false, message: '删除话题失败' });
  }
});

// 增加浏览量
router.post('/:id/view', async (req, res) => {
  try {
    const topic = await Topic.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!topic) {
      return res.status(404).json({ success: false, message: '话题不存在' });
    }

    res.json({
      success: true,
      data: topic
    });
  } catch (error) {
    console.error('Update topic views error:', error);
    res.status(500).json({ success: false, message: '更新浏览量失败' });
  }
});

module.exports = router;
