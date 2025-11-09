const express = require('express');
const router = express.Router();
const FAQ = require('../models/FAQ');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * 认证中间件
 */
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
 * 获取所有FAQ（公开接口）
 * GET /api/faqs
 */
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 100 } = req.query;
    
    const query = { isActive: true };
    if (category) {
      query.category = category;
    }

    const faqs = await FAQ.find(query)
      .sort({ order: 1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await FAQ.countDocuments(query);

    res.json({
      success: true,
      data: {
        faqs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({ success: false, message: '获取常见问题失败' });
  }
});

/**
 * 获取所有FAQ（管理员，包括未启用的）
 * GET /api/faqs/admin
 */
router.get('/admin', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { category, page = 1, limit = 100 } = req.query;
    
    const query = {};
    if (category) {
      query.category = category;
    }

    const faqs = await FAQ.find(query)
      .sort({ order: 1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await FAQ.countDocuments(query);

    res.json({
      success: true,
      data: {
        faqs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({ success: false, message: '获取常见问题失败' });
  }
});

/**
 * 创建FAQ（管理员）
 * POST /api/faqs
 */
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { question, answer, category, order, isActive } = req.body;

    // 验证必填字段
    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: '请填写问题和答案'
      });
    }

    const faq = new FAQ({
      question,
      answer,
      category: category || 'general',
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id
    });

    await faq.save();

    console.log(`✅ 管理员 ${req.user.username} 创建了FAQ: ${faq.question}`);

    res.json({
      success: true,
      message: 'FAQ已创建',
      data: faq
    });
  } catch (error) {
    console.error('Create FAQ error:', error);
    res.status(500).json({ success: false, message: '创建FAQ失败' });
  }
});

/**
 * 更新FAQ（管理员）
 * PUT /api/faqs/:id
 */
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ不存在' });
    }

    const { question, answer, category, order, isActive } = req.body;

    // 更新字段
    if (question !== undefined) faq.question = question;
    if (answer !== undefined) faq.answer = answer;
    if (category !== undefined) faq.category = category;
    if (order !== undefined) faq.order = order;
    if (isActive !== undefined) faq.isActive = isActive;

    await faq.save();

    console.log(`✅ 管理员 ${req.user.username} 更新了FAQ: ${faq.question}`);

    res.json({
      success: true,
      message: 'FAQ已更新',
      data: faq
    });
  } catch (error) {
    console.error('Update FAQ error:', error);
    res.status(500).json({ success: false, message: '更新FAQ失败' });
  }
});

/**
 * 删除FAQ（管理员）
 * DELETE /api/faqs/:id
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);

    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ不存在' });
    }

    console.log(`✅ 管理员 ${req.user.username} 删除了FAQ: ${faq.question}`);

    res.json({
      success: true,
      message: 'FAQ已删除'
    });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({ success: false, message: '删除FAQ失败' });
  }
});

/**
 * 增加FAQ浏览量
 * POST /api/faqs/:id/view
 */
router.post('/:id/view', async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ不存在' });
    }

    res.json({
      success: true,
      data: faq
    });
  } catch (error) {
    console.error('Update FAQ views error:', error);
    res.status(500).json({ success: false, message: '更新浏览量失败' });
  }
});

/**
 * FAQ反馈（有帮助/无帮助）
 * POST /api/faqs/:id/feedback
 */
router.post('/:id/feedback', async (req, res) => {
  try {
    const { helpful } = req.body;
    
    const updateField = helpful ? { $inc: { helpful: 1 } } : { $inc: { notHelpful: 1 } };
    
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      updateField,
      { new: true }
    );

    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ不存在' });
    }

    res.json({
      success: true,
      data: faq
    });
  } catch (error) {
    console.error('FAQ feedback error:', error);
    res.status(500).json({ success: false, message: '提交反馈失败' });
  }
});

module.exports = router;
