const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const BalanceLog = require('../models/BalanceLog');
const SearchLog = require('../models/SearchLog');
const SystemConfig = require('../models/SystemConfig');
const database = require('../config/database');

// 系统集合列表（不参与搜索）
const SYSTEM_COLLECTIONS = [
  'sitesettings', 'systemconfigs', 'commissiontransactions', 'transactions',
  'searchdatas', 'users', 'invitationlogs', 'withdrawalrequests',
  'useractivities', 'databases', 'admins', 'searchlogs', 'balancelogs'
];

// 慢速集合列表（可选择跳过）
// 如果这些集合经常超时，可以取消注释来跳过它们
const SLOW_COLLECTIONS = [
  // 'ZB顺丰快递C',
  // 'ZB酒店开房',
  // 'ZB微博数据',
  // 'ZB公积金',
  // 'ZB顺丰快递'
];

// 是否跳过慢速集合（可通过环境变量配置）
const SKIP_SLOW_COLLECTIONS = process.env.SKIP_SLOW_COLLECTIONS === 'true';

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
 * 优化：只使用最常用的字段，减少 $or 条件数量
 */
const fieldMapping = {
  name: ['姓名', 'Name', 'name'],
  idcard: ['身份证', '身份证号', 'idCard', 'ID'],
  phone: ['手机', 'phone', 'mobile', '电话'],
  qq: ['QQ', 'qq', 'qqNumber'],
  wechat: ['微信', 'wechat', '微信号'],
  weibo: ['微博', 'weibo', '微博号'],
  email: ['邮箱', 'email', 'Email'],
  address: ['地址', 'Address', 'address'],
  company: ['公司', 'Company', 'company']
};

/**
 * 执行搜索
 * POST /api/search
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, query, databaseId } = req.body;
    const user = req.user;

    console.log('\n' + '='.repeat(60));
    console.log('🔍 收到搜索请求');
    console.log('='.repeat(60));
    console.log(`用户: ${user.username} (${user._id})`);
    console.log(`搜索类型: ${type}`);
    console.log(`搜索关键词: ${query}`);
    console.log(`指定数据库: ${databaseId || '自动'}`);

    if (!query || !query.trim()) {
      console.log('❌ 搜索失败: 未输入关键词');
      return res.status(400).json({
        success: false,
        message: '请输入搜索关键词'
      });
    }

    if (!type) {
      console.log('❌ 搜索失败: 未选择搜索类型');
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

    // 动态获取查询数据库连接（不要在模块顶部解构）
    const queryConnection = database.queryConnection;
    
    // 检查查询数据库连接
    console.log('\n📊 检查查询数据库连接...');
    console.log(`queryConnection: ${queryConnection ? '已初始化' : 'null'}`);
    
    if (!queryConnection) {
      console.log('❌ 查询数据库未初始化！');
      console.log('💡 可能原因:');
      console.log('   1. 管理员后台未配置查询数据库');
      console.log('   2. 服务器启动时初始化失败');
      console.log('   3. 数据库连接断开');
      console.log('\n💡 解决方案:');
      console.log('   1. 登录管理员后台配置查询数据库');
      console.log('   2. 重启服务器');
      console.log('='.repeat(60) + '\n');
      
      return res.status(503).json({
        success: false,
        message: '查询数据库未配置或连接失败，请联系管理员配置数据库'
      });
    }
    
    console.log(`✅ 查询数据库已连接`);
    console.log(`   数据库名: ${queryConnection.name}`);
    console.log(`   主机: ${queryConnection.host}:${queryConnection.port}`);
    console.log(`   连接状态: ${queryConnection.readyState === 1 ? '已连接' : '未连接'}`);


    // 获取查询数据库中的所有集合
    const allCollections = await queryConnection.db.listCollections().toArray();
    
    // 过滤掉系统集合和慢速集合（如果启用）
    let collections = allCollections.filter(c => {
      if (SYSTEM_COLLECTIONS.includes(c.name)) return false;
      if (SKIP_SLOW_COLLECTIONS && SLOW_COLLECTIONS.includes(c.name)) return false;
      return true;
    });
    
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
    
    // 优化：根据搜索类型优先搜索相关集合
    const priorityCollections = [];
    const normalCollections = [];
    
    collections.forEach(c => {
      const name = c.name.toLowerCase();
      // 根据搜索类型判断优先级
      if (type === 'phone' && (name.includes('手机') || name.includes('phone') || name.includes('联系'))) {
        priorityCollections.push(c);
      } else if (type === 'idcard' && (name.includes('身份证') || name.includes('户籍') || name.includes('idcard'))) {
        priorityCollections.push(c);
      } else if (type === 'name' && (name.includes('姓名') || name.includes('name') || name.includes('户籍'))) {
        priorityCollections.push(c);
      } else {
        normalCollections.push(c);
      }
    });
    
    // 优先集合放在前面
    const sortedCollections = [...priorityCollections, ...normalCollections];
    
    console.log(`开始搜索 ${sortedCollections.length} 个集合...`);
    console.log(`  优先集合: ${priorityCollections.length} 个`);
    console.log(`  普通集合: ${normalCollections.length} 个`);
    console.log(`搜索模式: 精确匹配 "${searchQuery}"`);
    const startTime = Date.now();

    // 优化：使用 Promise.allSettled 而不是 Promise.all
    // 这样即使部分查询失败，其他查询仍能继续
    const searchPromises = sortedCollections.map(async (collectionInfo) => {
      try {
        const collection = queryConnection.db.collection(collectionInfo.name);
        
        // 优化策略：优先使用文本索引（如果存在）
        // 但邮箱搜索必须精确匹配，不使用文本索引
        let results = [];
        const timeout = 3000; // 每个集合最多3秒
        
        // 邮箱搜索跳过文本索引，直接精确匹配
        if (type === 'email') {
          for (const field of searchFields) {
            try {
              const fieldResults = await collection.find({
                [field]: searchQuery
              })
              .maxTimeMS(timeout)
              .limit(50)
              .toArray();
              
              if (fieldResults.length > 0) {
                results = fieldResults;
                break; // 找到结果就停止
              }
            } catch (err) {
              // 单个字段查询失败，继续尝试下一个字段
              continue;
            }
          }
        } else {
          // 其他类型可以使用文本索引
          try {
            // 策略1：尝试使用文本索引（最快）
            results = await collection.find({
              $text: { $search: searchQuery }
            })
            .maxTimeMS(timeout)
            .limit(50)
            .toArray();
            
            if (results.length > 0) {
              // 文本索引搜索成功
              console.log(`✓ ${collectionInfo.name}: ${results.length} 条记录 (文本索引)`);
            }
          } catch (textSearchError) {
            // 文本索引不存在或查询失败，使用精确匹配
            for (const field of searchFields) {
              try {
                const fieldResults = await collection.find({
                  [field]: searchQuery
                })
                .maxTimeMS(timeout)
                .limit(50)
                .toArray();
                
                if (fieldResults.length > 0) {
                  results = fieldResults;
                  break; // 找到结果就停止
                }
              } catch (err) {
                // 单个字段查询失败，继续尝试下一个字段
                continue;
              }
            }
          }
        }
        
        if (results.length > 0) {
          console.log(`✓ ${collectionInfo.name}: ${results.length} 条记录`);
        }

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
        // 区分超时错误和其他错误
        if (error.message.includes('timed out') || error.message.includes('timeout')) {
          console.log(`⏱️  ${collectionInfo.name}: 查询超时（已跳过）`);
        } else {
          console.error(`✗ ${collectionInfo.name}: ${error.message}`);
        }
        return [];
      }
    });

    // 等待所有搜索完成（使用 allSettled 处理失败的查询）
    const searchResults = await Promise.allSettled(searchPromises);
    
    // 合并所有成功的结果
    let allResults = searchResults
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value)
      .flat();
    
    // 搜索完成统计
    const searchTime = Date.now() - startTime;
    const successCount = searchResults.filter(r => r.status === 'fulfilled').length;
    const failedCount = searchResults.filter(r => r.status === 'rejected').length;
    
    console.log(`\n📊 搜索完成统计:`);
    console.log(`   搜索集合数: ${sortedCollections.length}`);
    console.log(`   成功查询: ${successCount} 个`);
    console.log(`   失败/超时: ${failedCount} 个`);
    console.log(`   找到结果数: ${allResults.length}`);
    console.log(`   搜索耗时: ${searchTime}ms`);
    console.log('='.repeat(60) + '\n');
    
    // 限制结果数量
    allResults = allResults.slice(0, 100);

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
