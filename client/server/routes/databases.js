const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Database = require('../models/Database');

// 认证中间件
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

// 管理员权限中间件
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: '需要管理员权限' });
  }
  next();
};

/**
 * 获取所有数据库列表
 * GET /api/databases
 */
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 100, isActive } = req.query;

    // 构建查询条件
    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // 分页查询
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const databases = await Database.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Database.countDocuments(query);

    // 转换数据格式以兼容前端
    const formattedDatabases = databases.map(db => ({
      _id: db._id.toString(),  // 保留 _id 用于编辑
      id: db._id.toString(),
      name: db.name,
      description: db.description,
      searchTypes: db.supportedTypes || [],  // 兼容旧版本
      supportedTypes: db.supportedTypes || [],  // 前端表单使用此字段
      recordCount: db.recordCount || 0,
      isActive: db.isActive,
      status: db.status,
      source: db.source,
      lastUpdated: db.lastUpdated,
      leakDate: db.leakDate,
      createdAt: db.createdAt,
      updatedAt: db.updatedAt
    }));

    res.json({
      success: true,
      data: {
        databases: formattedDatabases,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取数据库列表失败:', error);
    res.status(500).json({ success: false, message: '获取数据库列表失败' });
  }
});

/**
 * 获取单个数据库
 * GET /api/databases/:id
 */
router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const database = await Database.findById(req.params.id).lean();
    
    if (!database) {
      return res.status(404).json({ success: false, message: '数据库不存在' });
    }

    // 转换数据格式以兼容前端
    const formattedDatabase = {
      _id: database._id.toString(),  // 保留 _id 用于编辑
      id: database._id.toString(),
      name: database.name,
      description: database.description,
      searchTypes: database.supportedTypes || [],  // 兼容旧版本
      supportedTypes: database.supportedTypes || [],  // 前端表单使用此字段
      recordCount: database.recordCount || 0,
      isActive: database.isActive,
      status: database.status,
      source: database.source,
      lastUpdated: database.lastUpdated,
      leakDate: database.leakDate,
      createdAt: database.createdAt,
      updatedAt: database.updatedAt
    };

    res.json({
      success: true,
      data: formattedDatabase
    });
  } catch (error) {
    console.error('获取数据库失败:', error);
    res.status(500).json({ success: false, message: '获取数据库失败' });
  }
});

/**
 * 创建数据库
 * POST /api/databases
 */
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, searchTypes, supportedTypes, recordCount, isActive, source, status, lastUpdated, leakDate } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: '请填写数据库名称' });
    }

    console.log(`📝 创建数据库:`, { name, searchTypes, supportedTypes, recordCount, isActive, source, status, lastUpdated, leakDate });

    // 创建数据库记录（支持 searchTypes 和 supportedTypes 两种字段名）
    const database = new Database({
      name,
      description: description || '',
      supportedTypes: supportedTypes || searchTypes || [],
      recordCount: recordCount || 0,
      isActive: isActive !== undefined ? isActive : true,
      source: source || '官方数据',
      status: status || 'normal',
      lastUpdated: lastUpdated ? new Date(lastUpdated) : new Date(),
      leakDate: leakDate ? new Date(leakDate) : null,
      createdBy: req.user._id
    });

    await database.save();

    console.log(`✅ 管理员 ${req.user.username} 创建了数据库: ${name}`);

    // 转换数据格式以兼容前端
    const formattedDatabase = {
      _id: database._id.toString(),  // 保留 _id 用于编辑
      id: database._id.toString(),
      name: database.name,
      description: database.description,
      searchTypes: database.supportedTypes || [],  // 兼容旧版本
      supportedTypes: database.supportedTypes || [],  // 前端表单使用此字段
      recordCount: database.recordCount || 0,
      isActive: database.isActive,
      status: database.status,
      source: database.source,
      lastUpdated: database.lastUpdated,
      leakDate: database.leakDate,
      createdAt: database.createdAt
    };

    res.json({
      success: true,
      message: '数据库已创建',
      data: formattedDatabase
    });
  } catch (error) {
    console.error('创建数据库失败:', error);
    res.status(500).json({ success: false, message: '创建数据库失败' });
  }
});

/**
 * 更新数据库
 * PUT /api/databases/:id
 */
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, searchTypes, supportedTypes, recordCount, isActive, source, status, lastUpdated, leakDate } = req.body;
    const requestId = req.params.id;
    
    console.log(`🔍 查找数据库 ID: ${requestId}`);
    console.log(`📝 更新数据:`, { name, searchTypes, supportedTypes, recordCount, isActive, source, status, lastUpdated, leakDate });
    
    const database = await Database.findById(requestId);

    if (!database) {
      console.log(`❌ 未找到数据库 ID: ${requestId}`);
      return res.status(404).json({ success: false, message: '数据库不存在' });
    }

    // 更新字段（支持 searchTypes 和 supportedTypes 两种字段名）
    if (name !== undefined) database.name = name;
    if (description !== undefined) database.description = description;
    if (searchTypes !== undefined) database.supportedTypes = searchTypes;
    if (supportedTypes !== undefined) database.supportedTypes = supportedTypes;
    if (recordCount !== undefined) database.recordCount = recordCount;
    if (isActive !== undefined) database.isActive = isActive;
    if (source !== undefined) database.source = source;
    if (status !== undefined) database.status = status;
    // 只有在提供了lastUpdated时才更新，否则保持原值
    if (lastUpdated !== undefined) database.lastUpdated = new Date(lastUpdated);
    if (leakDate !== undefined) database.leakDate = leakDate ? new Date(leakDate) : null;

    await database.save();

    console.log(`✅ 管理员 ${req.user.username} 更新了数据库: ${database.name}`);

    // 转换数据格式以兼容前端
    const formattedDatabase = {
      _id: database._id.toString(),  // 保留 _id 用于编辑
      id: database._id.toString(),
      name: database.name,
      description: database.description,
      searchTypes: database.supportedTypes || [],  // 兼容旧版本
      supportedTypes: database.supportedTypes || [],  // 前端表单使用此字段
      recordCount: database.recordCount || 0,
      isActive: database.isActive,
      status: database.status,
      source: database.source,
      lastUpdated: database.lastUpdated,
      leakDate: database.leakDate,
      createdAt: database.createdAt,
      updatedAt: database.updatedAt
    };

    res.json({
      success: true,
      message: '数据库已更新',
      data: formattedDatabase
    });
  } catch (error) {
    console.error('更新数据库失败:', error);
    res.status(500).json({ success: false, message: '更新数据库失败' });
  }
});

/**
 * 删除数据库
 * DELETE /api/databases/:id
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const database = await Database.findById(req.params.id);

    if (!database) {
      return res.status(404).json({ success: false, message: '数据库不存在' });
    }

    const databaseName = database.name;
    await Database.findByIdAndDelete(req.params.id);

    console.log(`✅ 管理员 ${req.user.username} 删除了数据库: ${databaseName}`);

    res.json({
      success: true,
      message: '数据库已删除'
    });
  } catch (error) {
    console.error('删除数据库失败:', error);
    res.status(500).json({ success: false, message: '删除数据库失败' });
  }
});

module.exports = router;
