const express = require('express');
const router = express.Router();
const Advertisement = require('../models/Advertisement');
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

// 获取所有广告（管理员）
router.get('/admin', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 50, position } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (position) {
      query.position = position;
    }

    const advertisements = await Advertisement.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Advertisement.countDocuments(query);

    res.json({
      success: true,
      data: {
        advertisements,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取广告列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取广告列表失败'
    });
  }
});

// 获取公开广告（按位置）
router.get('/public', async (req, res) => {
  try {
    const { position = 'search' } = req.query;
    const now = new Date();

    const query = {
      position,
      isActive: true,
      $or: [
        { startDate: null, endDate: null },
        { startDate: { $lte: now }, endDate: null },
        { startDate: null, endDate: { $gte: now } },
        { startDate: { $lte: now }, endDate: { $gte: now } }
      ]
    };

    const advertisements = await Advertisement.find(query)
      .sort({ order: 1, createdAt: -1 })
      .select('-createdBy');

    res.json({
      success: true,
      data: advertisements
    });
  } catch (error) {
    console.error('获取广告失败:', error);
    res.status(500).json({
      success: false,
      message: '获取广告失败'
    });
  }
});

// 创建广告
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    console.log('📝 创建广告请求:', {
      title: req.body.title,
      type: req.body.type,
      hasContent: !!req.body.content,
      carouselImagesCount: req.body.carouselImages?.length || 0
    });

    const { 
      title, 
      content, 
      type,
      carouselImages,
      carouselLinks,
      carouselInterval,
      carouselHeight,
      showControls,
      showIndicators,
      position, 
      isActive, 
      order, 
      startDate, 
      endDate 
    } = req.body;

    if (!title) {
      console.log('❌ 验证失败: 标题为空');
      return res.status(400).json({
        success: false,
        message: '标题不能为空'
      });
    }

    // 根据类型验证必填字段
    if (type === 'carousel') {
      console.log('🎠 轮播广告验证:', { 
        imagesCount: carouselImages?.length || 0,
        images: carouselImages 
      });
      if (!carouselImages || carouselImages.length === 0) {
        console.log('❌ 验证失败: 轮播图片为空');
        return res.status(400).json({
          success: false,
          message: '轮播广告至少需要一张图片'
        });
      }
    } else {
      if (!content) {
        console.log('❌ 验证失败: HTML内容为空');
        return res.status(400).json({
          success: false,
          message: 'HTML广告内容不能为空'
        });
      }
    }

    const adData = {
      title,
      content: content || '',
      type: type || 'html',
      carouselImages: carouselImages || [],
      carouselLinks: carouselLinks || [],
      carouselInterval: carouselInterval || 5000,
      carouselHeight: carouselHeight || '400px',
      showControls: showControls !== false,
      showIndicators: showIndicators !== false,
      position: position || 'search',
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
      startDate: startDate || null,
      endDate: endDate || null,
      createdBy: req.user.userId
    };

    console.log('💾 准备保存广告:', adData);

    const advertisement = new Advertisement(adData);
    await advertisement.save();

    console.log('✅ 广告创建成功:', advertisement._id);

    res.json({
      success: true,
      message: '广告创建成功',
      data: advertisement
    });
  } catch (error) {
    console.error('❌ 创建广告失败:', error);
    console.error('错误详情:', error.message);
    res.status(500).json({
      success: false,
      message: '创建广告失败: ' + error.message
    });
  }
});

// 更新广告
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      content, 
      type,
      carouselImages,
      carouselLinks,
      carouselInterval,
      carouselHeight,
      showControls,
      showIndicators,
      position, 
      isActive, 
      order, 
      startDate, 
      endDate 
    } = req.body;

    const advertisement = await Advertisement.findById(id);
    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: '广告不存在'
      });
    }

    if (title !== undefined) advertisement.title = title;
    if (content !== undefined) advertisement.content = content;
    if (type !== undefined) advertisement.type = type;
    if (carouselImages !== undefined) advertisement.carouselImages = carouselImages;
    if (carouselLinks !== undefined) advertisement.carouselLinks = carouselLinks;
    if (carouselInterval !== undefined) advertisement.carouselInterval = carouselInterval;
    if (carouselHeight !== undefined) advertisement.carouselHeight = carouselHeight;
    if (showControls !== undefined) advertisement.showControls = showControls;
    if (showIndicators !== undefined) advertisement.showIndicators = showIndicators;
    if (position !== undefined) advertisement.position = position;
    if (isActive !== undefined) advertisement.isActive = isActive;
    if (order !== undefined) advertisement.order = order;
    if (startDate !== undefined) advertisement.startDate = startDate || null;
    if (endDate !== undefined) advertisement.endDate = endDate || null;

    await advertisement.save();

    res.json({
      success: true,
      message: '广告更新成功',
      data: advertisement
    });
  } catch (error) {
    console.error('更新广告失败:', error);
    res.status(500).json({
      success: false,
      message: '更新广告失败'
    });
  }
});

// 删除广告
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const advertisement = await Advertisement.findById(id);
    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: '广告不存在'
      });
    }

    await Advertisement.findByIdAndDelete(id);

    res.json({
      success: true,
      message: '广告删除成功'
    });
  } catch (error) {
    console.error('删除广告失败:', error);
    res.status(500).json({
      success: false,
      message: '删除广告失败'
    });
  }
});

module.exports = router;
