const express = require('express');
const router = express.Router();
const Database = require('../models/Database');
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
 * 获取所有数据库列表（公开接口，用户可见）
 * GET /api/databases
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 100, isActive } = req.query;
    
    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const databases = await Database.find(query)
      .select('-config.apiKey') // 不返回敏感信息
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Database.countDocuments(query);

    res.json({
      success: true,
      data: {
        databases,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get databases error:', error);
    res.status(500).json({ success: false, message: '获取数据库列表失败' });
  }
});

/**
 * 获取单个数据库详情
 * GET /api/databases/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const database = await Database.findById(req.params.id)
      .select('-config.apiKey'); // 不返回敏感信息

    if (!database) {
      return res.status(404).json({ success: false, message: '数据库不存在' });
    }

    res.json({
      success: true,
      data: database
    });
  } catch (error) {
    console.error('Get database error:', error);
    res.status(500).json({ success: false, message: '获取数据库详情失败' });
  }
});

/**
 * 创建数据库（管理员）
 * POST /api/databases
 */
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      source,
      isActive,
      status,
      recordCount,
      supportedTypes,
      config,
      lastUpdated
    } = req.body;

    // 验证必填字段
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: '请填写所有必填字段'
      });
    }

    // 检查数据库名称是否已存在
    const existingDb = await Database.findOne({ name });
    if (existingDb) {
      return res.status(400).json({
        success: false,
        message: '数据库名称已存在'
      });
    }

    const database = new Database({
      name,
      description,
      source: source || '官方数据',
      isActive: isActive !== undefined ? isActive : true,
      status: status || 'normal',
      recordCount: recordCount || 0,
      lastUpdated: lastUpdated || Date.now(),
      supportedTypes: supportedTypes || [],
      config: config || {},
      createdBy: req.user._id
    });

    await database.save();

    console.log(`✅ 管理员 ${req.user.username} 创建了数据库: ${database.name}`);

    res.json({
      success: true,
      message: '数据库已创建',
      data: database
    });
  } catch (error) {
    console.error('Create database error:', error);
    res.status(500).json({ success: false, message: '创建数据库失败' });
  }
});

/**
 * 更新数据库（管理员）
 * PUT /api/databases/:id
 */
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const database = await Database.findById(req.params.id);

    if (!database) {
      return res.status(404).json({ success: false, message: '数据库不存在' });
    }

    console.log('📝 更新数据库请求体:', req.body);

    const {
      name,
      description,
      source,
      isActive,
      status,
      recordCount,
      supportedTypes,
      config,
      lastUpdated
    } = req.body;

    // 如果修改名称，检查是否与其他数据库重复
    if (name && name !== database.name) {
      const existingDb = await Database.findOne({ name, _id: { $ne: req.params.id } });
      if (existingDb) {
        return res.status(400).json({
          success: false,
          message: '数据库名称已存在'
        });
      }
    }

    // 更新字段
    if (name !== undefined) database.name = name;
    if (description !== undefined) database.description = description;
    if (source !== undefined) database.source = source;
    if (isActive !== undefined) database.isActive = isActive;
    if (status !== undefined) database.status = status;
    if (recordCount !== undefined) database.recordCount = recordCount;
    if (supportedTypes !== undefined) database.supportedTypes = supportedTypes;
    if (config !== undefined) {
      database.config = { ...database.config, ...config };
    }
    if (lastUpdated !== undefined) database.lastUpdated = lastUpdated;

    await database.save();

    console.log(`✅ 管理员 ${req.user.username} 更新了数据库: ${database.name}`);

    res.json({
      success: true,
      message: '数据库已更新',
      data: database
    });
  } catch (error) {
    console.error('Update database error:', error);
    res.status(500).json({ success: false, message: '更新数据库失败' });
  }
});

/**
 * 删除数据库（管理员）
 * DELETE /api/databases/:id
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const database = await Database.findById(req.params.id);

    if (!database) {
      return res.status(404).json({ success: false, message: '数据库不存在' });
    }

    await Database.findByIdAndDelete(req.params.id);

    console.log(`✅ 管理员 ${req.user.username} 删除了数据库: ${database.name}`);

    res.json({
      success: true,
      message: '数据库已删除'
    });
  } catch (error) {
    console.error('Delete database error:', error);
    res.status(500).json({ success: false, message: '删除数据库失败' });
  }
});

/**
 * 更新数据库统计信息（管理员）
 * PUT /api/databases/:id/stats
 */
router.put('/:id/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const database = await Database.findById(req.params.id);

    if (!database) {
      return res.status(404).json({ success: false, message: '数据库不存在' });
    }

    const { totalSearches, successRate, avgResponseTime } = req.body;

    if (totalSearches !== undefined) database.stats.totalSearches = totalSearches;
    if (successRate !== undefined) database.stats.successRate = successRate;
    if (avgResponseTime !== undefined) database.stats.avgResponseTime = avgResponseTime;

    await database.save();

    res.json({
      success: true,
      message: '统计信息已更新',
      data: database
    });
  } catch (error) {
    console.error('Update database stats error:', error);
    res.status(500).json({ success: false, message: '更新统计信息失败' });
  }
});

module.exports = router;
