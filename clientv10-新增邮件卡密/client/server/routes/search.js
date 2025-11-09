const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const BalanceLog = require('../models/BalanceLog');
const SearchLog = require('../models/SearchLog');
const SystemConfig = require('../models/SystemConfig');
const { queryConnection } = require('../config/database');

// 系统集合列表（不参与搜索）
const SYSTEM_COLLECTIONS = [
  'sitesettings', 'systemconfigs', 'commissiontransactions', 'transactions',
  'searchdatas', 'users', 'invitationlogs', 'withdrawalrequests',
  'useractivities', 'databases', 'admins', 'searchlogs', 'balancelogs'
];

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
 * 字段映射 - 将搜索类型映射到数据库字段
 */
const fieldMapping = {
  name: ['姓名', 'Name', 'name', '名字', '法人', '联系人', '配偶', 'FirstNm', 'LastNm'],
  idcard: ['身份证', '证件号码', '身份证号', '身份证号码', '证件号', 'identityNumber', 'cardNumber', 'idCard', 'ID Number', 'Identity', 'Card Number', 'idNumber', 'ID', 'id', 'CardNo', 'CtfTp'],
  phone: ['phone', 'phoneNumber', 'mobile', 'tel', 'telephone', 'cellphone', '手机', '联系方式', '手机号', '电话', '移动电话', '手机号码', '联系电话', 'Phone', 'Mobile', 'Tel', 'Contact', '配偶手机号', '直属手机号', '电话号码', 'CTel', 'Fax'],
  qq: ['qqNumber', 'QQ', 'qqID', 'qq号', 'QQ号', 'qq号码', 'QQ号码', 'qq'],
  wechat: ['wechat', 'WeChat', 'weChatID', 'weChatNumber', '微信', '微信号', '微信号码', '微信ID', '微信账号'],
  weibo: ['weibo', 'Weibo', 'weiboID', 'weiboNumber', '微博', '微博号', '微博ID', '微博账号'],
  email: ['email', 'emailAddress', 'mail', 'e-mail', '邮箱', '电子邮箱', '邮件', '电子邮件', '邮箱地址', 'Email', 'Mail', 'EMail'],
  address: ['地址', 'Address', 'address', 'CAddress', 'Zip', 'CZip'],
  company: ['公司', 'Company', 'company', '工作单位', '单位']
};

/**
 * 执行搜索
 * POST /api/search
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, query, databaseId } = req.body;
    const user = req.user;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: '请输入搜索关键词'
      });
    }

    if (!type) {
      return res.status(400).json({
        success: false,
        message: '请选择搜索类型'
      });
    }

    // 获取系统配置
    const systemConfig = await SystemConfig.getConfig();
    const searchCost = systemConfig.points?.searchCost || 10;
    const enableSearchCost = systemConfig.points?.enableSearchCost !== false;
    
    // 生成搜索指纹（用于判断重复搜索）
    const searchFingerprint = crypto
      .createHash('md5')
      .update(`${user._id}-${type}-${query.trim().toLowerCase()}`)
      .digest('hex');
    
    // 检查是否有历史搜索记录（永久有效）
    const recentSearch = await SearchLog.findOne({
      userId: user._id,
      searchFingerprint: searchFingerprint
    }).sort({ createdAt: -1 });
    
    const isRepeatSearch = !!recentSearch;

    // 获取查询数据库中的所有集合
    const allCollections = await queryConnection.db.listCollections().toArray();
    
    // 过滤掉系统集合
    let collections = allCollections.filter(c => !SYSTEM_COLLECTIONS.includes(c.name));
    
    // 如果指定了数据库，只搜索该数据库
    if (databaseId && databaseId !== 'auto') {
      collections = collections.filter(c => c.name === databaseId);
    }

    if (collections.length === 0) {
      return res.status(404).json({
        success: false,
        message: '没有可用的数据库'
      });
    }

    // 获取字段映射
    const searchFields = fieldMapping[type] || [];
    if (searchFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: '不支持的搜索类型'
      });
    }

    const searchQuery = query.trim();
    
    console.log(`开始并行搜索 ${collections.length} 个集合...`);
    console.log(`搜索模式: 精确匹配 "${searchQuery}"`);
    const startTime = Date.now();

    // 并行搜索所有集合
    const searchPromises = collections.map(async (collectionInfo) => {
      try {
        const collection = queryConnection.db.collection(collectionInfo.name);
        
        // 构建精确匹配条件（不区分大小写）
        const orConditions = searchFields.map(field => ({
          [field]: { $regex: `^${searchQuery}$`, $options: 'i' }
        }));
        
        // 执行精确匹配搜索
        const results = await collection.find({
          $or: orConditions
        }).limit(50).toArray();
        
        console.log(`✓ ${collectionInfo.name}: ${results.length} 条记录`);

        // 格式化结果
        return results.map(item => {
          // 移除_id字段
          const { _id, ...dataWithoutId } = item;
          
          // 找到匹配的字段
          let matchedField = null;
          let matchedValue = null;
          for (const field of searchFields) {
            if (item[field]) {
              const fieldValue = String(item[field]);
              // 精确匹配（不区分大小写）
              if (fieldValue.toLowerCase() === searchQuery.toLowerCase()) {
                matchedField = field;
                matchedValue = fieldValue;
                break;
              }
            }
          }

          return {
            id: _id.toString(),
            database: {
              id: collectionInfo.name,
              name: collectionInfo.name,
              description: `${collectionInfo.name} 数据库`
            },
            data: dataWithoutId, // 不包含_id
            matchedField: matchedField,
            matchedValue: matchedValue
          };
        });
      } catch (error) {
        console.error(`✗ ${collectionInfo.name}: ${error.message}`);
        return [];
      }
    });

    // 等待所有搜索完成
    const searchResults = await Promise.all(searchPromises);
    
    // 合并所有结果
    let allResults = searchResults.flat();
    
    // 限制结果数量
    allResults = allResults.slice(0, 100);
    
    const searchTime = Date.now() - startTime;
    console.log(`搜索完成，耗时 ${searchTime}ms，共找到 ${allResults.length} 条记录`);

    // 判断是否需要扣除积分
    let pointsCharged = 0;
    let chargeReason = '';
    
    if (!enableSearchCost) {
      chargeReason = '系统已关闭搜索扣费';
    } else if (isRepeatSearch) {
      chargeReason = '重复搜索，免费';
    } else if (allResults.length === 0) {
      chargeReason = '未找到结果，免费';
    } else {
      // 需要扣除积分
      if (user.points < searchCost) {
        return res.status(400).json({
          success: false,
          message: '积分不足，请先充值'
        });
      }
      
      const pointsBefore = user.points;
      user.points -= searchCost;
      await user.save();
      pointsCharged = searchCost;
      
      // 记录积分日志
      const balanceLog = new BalanceLog({
        userId: user._id,
        type: 'search',
        amount: -searchCost,
        balanceBefore: pointsBefore,
        balanceAfter: user.points,
        description: `搜索: ${type} - ${query}`
      });
      await balanceLog.save();
      
      chargeReason = `扣除${searchCost}积分`;
    }

    // 记录搜索日志
    const searchLog = new SearchLog({
      userId: user._id,
      searchType: type,
      searchQuery: query.trim(),
      searchFingerprint: searchFingerprint,
      resultsCount: allResults.length,
      pointsCharged: pointsCharged,
      searchTime: searchTime,
      databasesSearched: collections.length
    });
    await searchLog.save();
    
    console.log(`积分处理: ${chargeReason}`);

    res.json({
      success: true,
      data: {
        results: allResults,
        total: allResults.length,
        query,
        type,
        cost: pointsCharged,
        remainingBalance: user.balance,
        remainingPoints: user.points, // 添加剩余积分
        searchTime: searchTime,
        databasesSearched: collections.length,
        isRepeatSearch: isRepeatSearch,
        chargeReason: chargeReason
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: '搜索失败: ' + error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * 获取可用数据库列表（从Database模型读取，由管理员手动维护）
 * GET /api/search/databases
 */
router.get('/databases', async (req, res) => {
  try {
    const Database = require('../models/Database');
    
    // 从Database模型获取启用的数据库列表
    const databases = await Database.find({ isActive: true })
      .select('name description recordCount supportedTypes lastUpdated source status isActive')
      .sort({ order: 1, name: 1 })
      .lean();

    // 格式化返回数据
    const formattedDatabases = databases.map(db => ({
      _id: db._id.toString(),
      name: db.name,
      description: db.description || `${db.name} 数据库`,
      recordCount: db.recordCount || 0,
      supportedTypes: db.supportedTypes || ['name', 'phone', 'idcard', 'qq', 'wechat', 'email', 'address', 'company'],
      lastUpdated: db.lastUpdated || new Date(),
      source: db.source || '官方数据',
      status: db.status || 'normal',
      isActive: db.isActive !== undefined ? db.isActive : true
    }));

    console.log('📊 返回数据库列表，包含status字段:', formattedDatabases.map(db => ({ name: db.name, status: db.status })));

    res.json({
      success: true,
      data: formattedDatabases
    });
  } catch (error) {
    console.error('Get databases error:', error);
    res.status(500).json({
      success: false,
      message: '获取数据库列表失败'
    });
  }
});

/**
 * 获取广告列表
 * GET /api/search/advertisements
 */
router.get('/advertisements', async (req, res) => {
  try {
    // 返回广告列表
    const advertisements = [];

    res.json({
      success: true,
      data: advertisements
    });
  } catch (error) {
    console.error('Get advertisements error:', error);
    res.status(500).json({
      success: false,
      message: '获取广告列表失败'
    });
  }
});

module.exports = router;
