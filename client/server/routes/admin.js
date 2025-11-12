const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SearchLog = require('../models/SearchLog');
const BalanceLog = require('../models/BalanceLog');
const WithdrawOrder = require('../models/WithdrawOrder');

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
 * 管理员权限中间件
 */
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    });
  }
  next();
};

/**
 * 获取管理员仪表盘统计数据
 * GET /api/admin/stats
 */
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    console.log('\n📊 管理员请求仪表盘统计数据');

    // 获取当前时间范围
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 用户统计
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ 
      lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
    });
    const newUsersToday = await User.countDocuments({ 
      createdAt: { $gte: todayStart } 
    });
    const newUsersThisMonth = await User.countDocuments({ 
      createdAt: { $gte: monthStart } 
    });
    const vipUsers = await User.countDocuments({ 
      vipStatus: { $in: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] } 
    });

    // 财务统计
    const rechargeLogsToday = await BalanceLog.find({
      type: 'recharge',
      createdAt: { $gte: todayStart }
    });
    const rechargeLogsMonth = await BalanceLog.find({
      type: 'recharge',
      createdAt: { $gte: monthStart }
    });
    const rechargeLogsAll = await BalanceLog.find({ type: 'recharge' });

    const todayRevenue = rechargeLogsToday.reduce((sum, log) => sum + log.amount, 0);
    const monthlyRevenue = rechargeLogsMonth.reduce((sum, log) => sum + log.amount, 0);
    const totalRevenue = rechargeLogsAll.reduce((sum, log) => sum + log.amount, 0);

    // 积分和佣金统计
    const usersWithPoints = await User.find({}, 'points balance commission');
    const totalPoints = usersWithPoints.reduce((sum, user) => sum + (user.points || 0), 0);
    const totalCommission = usersWithPoints.reduce((sum, user) => sum + (user.commission || 0), 0);

    // 提现统计
    const pendingWithdrawals = await WithdrawOrder.countDocuments({ 
      status: 'pending' 
    });
    const completedWithdrawals = await WithdrawOrder.find({ 
      status: 'completed' 
    });
    const totalWithdrawn = completedWithdrawals.reduce((sum, w) => sum + w.amount, 0);

    // 搜索统计
    const totalSearches = await SearchLog.countDocuments();
    const todaySearches = await SearchLog.countDocuments({ 
      createdAt: { $gte: todayStart } 
    });
    const monthlySearches = await SearchLog.countDocuments({ 
      createdAt: { $gte: monthStart } 
    });
    const successfulSearches = await SearchLog.countDocuments({ 
      resultCount: { $gt: 0 } 
    });
    const successRate = totalSearches > 0 
      ? ((successfulSearches / totalSearches) * 100).toFixed(1) 
      : 0;

    // 推荐统计
    const usersWithReferrals = await User.find({ referredBy: { $exists: true, $ne: null } });
    const totalReferrals = usersWithReferrals.length;
    const activeReferrals = usersWithReferrals.filter(u => 
      u.lastLoginAt && u.lastLoginAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;
    const referralConversionRate = totalUsers > 0 
      ? ((totalReferrals / totalUsers) * 100).toFixed(1) 
      : 0;

    // 数据库统计
    const { dbManager } = require('../config/database');
    const queryDatabasesInfo = dbManager.getQueryDatabasesInfo();
    const totalDatabases = queryDatabasesInfo.length;
    const activeDatabases = queryDatabasesInfo.filter(db => db.status === 'connected').length;
    
    console.log(`📊 数据库统计: 总数=${totalDatabases}, 在线=${activeDatabases}`);

    // 待处理事项
    let pendingTickets = 0;
    try {
      const Ticket = require('../models/Ticket');
      pendingTickets = await Ticket.countDocuments({ 
        status: { $in: ['open', 'in_progress'] } 
      });
    } catch (error) {
      console.log('ℹ️  工单模型不存在，跳过统计');
    }
    
    // 最近活动
    let recentActivities = [];
    try {
      const ActivityLog = require('../models/ActivityLog');
      const activities = await ActivityLog.getRecent(5);
      
      // 格式化活动数据
      recentActivities = activities.map(activity => {
        const now = new Date();
        const diff = now - new Date(activity.createdAt);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        let timeAgo;
        if (minutes < 1) {
          timeAgo = '刚刚';
        } else if (minutes < 60) {
          timeAgo = `${minutes}分钟前`;
        } else if (hours < 24) {
          timeAgo = `${hours}小时前`;
        } else {
          timeAgo = `${days}天前`;
        }
        
        return {
          type: activity.type,
          message: activity.message,
          time: timeAgo
        };
      });
    } catch (error) {
      console.log('ℹ️  活动日志模型不存在，跳过统计');
    }

    // 系统状态
    const { userConnection } = require('../config/database');
    const databaseStatus = userConnection && userConnection.readyState === 1 ? 'online' : 'offline';
    
    // 性能监控
    const os = require('os');
    const si = require('systeminformation');
    
    // CPU使用率（简单估算）
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;
    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });
    const cpuUsage = Math.floor(100 - (totalIdle / totalTick * 100));
    
    // 内存使用率
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = Math.floor(((totalMem - freeMem) / totalMem) * 100);
    
    // 磁盘使用率（实时获取）
    let diskUsage = 50; // 默认值
    try {
      const fsSize = await si.fsSize();
      if (fsSize && fsSize.length > 0) {
        // 获取主磁盘的使用率
        diskUsage = Math.floor(fsSize[0].use);
      }
    } catch (error) {
      console.log('⚠️  获取磁盘使用率失败，使用默认值');
    }
    
    // 网络流量（实时获取，单位：MB/s）
    let networkTraffic = 0;
    try {
      const networkStats = await si.networkStats();
      if (networkStats && networkStats.length > 0) {
        // 计算接收和发送的总流量（转换为 MB/s）
        const rxMBps = (networkStats[0].rx_sec || 0) / 1024 / 1024;
        const txMBps = (networkStats[0].tx_sec || 0) / 1024 / 1024;
        networkTraffic = Math.floor(rxMBps + txMBps);
      }
    } catch (error) {
      console.log('⚠️  获取网络流量失败，使用默认值');
    }

    const stats = {
      // 用户统计
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersThisMonth,
      vipUsers,
      
      // 财务统计
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      monthlyRevenue: parseFloat(monthlyRevenue.toFixed(2)),
      todayRevenue: parseFloat(todayRevenue.toFixed(2)),
      totalPoints,
      totalCommission: parseFloat(totalCommission.toFixed(2)),
      pendingWithdrawals,
      totalWithdrawn: parseFloat(totalWithdrawn.toFixed(2)),
      
      // 搜索统计
      totalSearches,
      todaySearches,
      monthlySearches,
      successRate: parseFloat(successRate),
      
      // 推荐统计
      totalReferrals,
      activeReferrals,
      referralConversionRate: parseFloat(referralConversionRate),
      
      // 数据库统计
      totalDatabases,
      activeDatabases,
      totalRecords: 0, // 需要查询所有集合的记录数，可能很慢
      
      // 系统状态
      systemStatus: 'healthy',
      databaseStatus,
      paymentGatewayStatus: 'online',
      emailServiceStatus: 'online',
      
      // 性能指标
      cpuUsage,
      memoryUsage,
      diskUsage,
      networkTraffic,
      
      // 待处理事项
      pendingReports: pendingTickets,
      systemAlerts: 0,
      
      // 最近活动
      recentActivities
    };

    console.log('✅ 统计数据获取成功');
    console.log(`   总用户: ${totalUsers}`);
    console.log(`   总收入: $${totalRevenue.toFixed(2)}`);
    console.log(`   总搜索: ${totalSearches}`);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ 获取统计数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败',
      error: error.message
    });
  }
});

/**
 * 获取财务报告
 * GET /api/admin/financial-report?days=7
 */
router.get('/financial-report', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    let startDate, endDate, days;
    
    // 检查是否使用自定义日期范围
    if (req.query.startDate && req.query.endDate) {
      // 解析日期字符串 (YYYY-MM-DD)
      const [startYear, startMonth, startDay] = req.query.startDate.split('-').map(Number);
      const [endYear, endMonth, endDay] = req.query.endDate.split('-').map(Number);
      
      // 使用本地时区创建日期对象（避免 UTC 转换）
      startDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
      endDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);
      
      days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      console.log(`\n📊 管理员请求财务报告 (${req.query.startDate} 至 ${req.query.endDate}, ${days}天)`);
      console.log(`   开始时间: ${startDate.toLocaleString('zh-CN')}`);
      console.log(`   结束时间: ${endDate.toLocaleString('zh-CN')}`);
    } else {
      // 使用天数范围
      days = parseInt(req.query.days) || 7;
      console.log(`\n📊 管理员请求财务报告 (最近${days}天)`);
      const now = new Date();
      endDate = now;
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);
    }

    // 获取所有相关的财务记录
    const balanceLogs = await BalanceLog.find({
      createdAt: { 
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ createdAt: 1 });

    // 按日期分组统计
    const dailyStats = {};
    
    // 获取开始日期的年月日（避免时区问题）
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth();
    const startDay = startDate.getDate();
    
    // 初始化每一天的数据
    for (let i = 0; i < days; i++) {
      const date = new Date(startYear, startMonth, startDay + i);
      const dateStr = date.toISOString().split('T')[0];
      
      dailyStats[dateStr] = {
        date: dateStr,
        income: { points: 0, balance: 0 },
        expense: { points: 0, balance: 0 },
        net: { points: 0, balance: 0 },
        details: {
          recharge: 0,        // 充值收入（余额）
          commission: 0,      // 佣金支出（余额）
          withdraw: 0,        // 提现支出（余额）
          consume: 0,         // 消费（积分）
          refund: 0,          // 退款支出（余额）
          register: 0,        // 注册赠送（积分）
          referralBonus: 0    // 推荐奖励（积分）
        }
      };
    }

    // 统计每天的财务数据
    balanceLogs.forEach(log => {
      const dateStr = log.createdAt.toISOString().split('T')[0];
      
      if (!dailyStats[dateStr]) return;

      const amount = Math.abs(log.amount);
      const currency = log.currency || 'points';

      // 入账类型（积分）
      if (currency === 'points') {
        if (['consume', 'search', 'vip', 'exchange'].includes(log.type)) {
          // 消费是收入（用户花费积分）
          dailyStats[dateStr].details.consume += amount;
          dailyStats[dateStr].income.points += amount;
        } else if (log.type === 'register') {
          // 注册赠送是支出
          dailyStats[dateStr].details.register += amount;
          dailyStats[dateStr].expense.points += amount;
        } else if (['referral_bonus', 'referral_reward', 'daily_claim'].includes(log.type)) {
          // 推荐奖励是支出
          dailyStats[dateStr].details.referralBonus += amount;
          dailyStats[dateStr].expense.points += amount;
        }
      }

      // 入账类型（余额）
      if (currency === 'balance') {
        if (['recharge', 'recharge_card'].includes(log.type)) {
          dailyStats[dateStr].details.recharge += amount;
          dailyStats[dateStr].income.balance += amount;
        } else if (log.type === 'refund') {
          dailyStats[dateStr].details.refund += amount;
          dailyStats[dateStr].expense.balance += amount;
        }
      }

      // 佣金类型
      if (currency === 'commission') {
        if (['commission', 'referral_bonus', 'referral_reward'].includes(log.type)) {
          dailyStats[dateStr].details.commission += amount;
          dailyStats[dateStr].expense.balance += amount;
        } else if (['withdraw', 'commission_withdraw'].includes(log.type)) {
          dailyStats[dateStr].details.withdraw += amount;
          dailyStats[dateStr].expense.balance += amount;
        }
      }
    });

    // 计算净收入
    Object.keys(dailyStats).forEach(date => {
      dailyStats[date].net.points = dailyStats[date].income.points - dailyStats[date].expense.points;
      dailyStats[date].net.balance = dailyStats[date].income.balance - dailyStats[date].expense.balance;
      
      // 保留两位小数
      dailyStats[date].income.points = parseFloat(dailyStats[date].income.points.toFixed(2));
      dailyStats[date].income.balance = parseFloat(dailyStats[date].income.balance.toFixed(2));
      dailyStats[date].expense.points = parseFloat(dailyStats[date].expense.points.toFixed(2));
      dailyStats[date].expense.balance = parseFloat(dailyStats[date].expense.balance.toFixed(2));
      dailyStats[date].net.points = parseFloat(dailyStats[date].net.points.toFixed(2));
      dailyStats[date].net.balance = parseFloat(dailyStats[date].net.balance.toFixed(2));
      dailyStats[date].details.recharge = parseFloat(dailyStats[date].details.recharge.toFixed(2));
      dailyStats[date].details.commission = parseFloat(dailyStats[date].details.commission.toFixed(2));
      dailyStats[date].details.withdraw = parseFloat(dailyStats[date].details.withdraw.toFixed(2));
      dailyStats[date].details.consume = parseFloat(dailyStats[date].details.consume.toFixed(2));
      dailyStats[date].details.refund = parseFloat(dailyStats[date].details.refund.toFixed(2));
      dailyStats[date].details.register = parseFloat(dailyStats[date].details.register.toFixed(2));
      dailyStats[date].details.referralBonus = parseFloat(dailyStats[date].details.referralBonus.toFixed(2));
    });

    // 转换为数组并按日期排序
    const dailyData = Object.values(dailyStats).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // 计算汇总数据
    const summary = {
      totalIncome: {
        points: parseFloat(dailyData.reduce((sum, d) => sum + d.income.points, 0).toFixed(2)),
        balance: parseFloat(dailyData.reduce((sum, d) => sum + d.income.balance, 0).toFixed(2))
      },
      totalExpense: {
        points: parseFloat(dailyData.reduce((sum, d) => sum + d.expense.points, 0).toFixed(2)),
        balance: parseFloat(dailyData.reduce((sum, d) => sum + d.expense.balance, 0).toFixed(2))
      },
      netProfit: {
        points: parseFloat(dailyData.reduce((sum, d) => sum + d.net.points, 0).toFixed(2)),
        balance: parseFloat(dailyData.reduce((sum, d) => sum + d.net.balance, 0).toFixed(2))
      },
      avgDailyIncome: {
        points: parseFloat((dailyData.reduce((sum, d) => sum + d.income.points, 0) / days).toFixed(2)),
        balance: parseFloat((dailyData.reduce((sum, d) => sum + d.income.balance, 0) / days).toFixed(2))
      },
      avgDailyExpense: {
        points: parseFloat((dailyData.reduce((sum, d) => sum + d.expense.points, 0) / days).toFixed(2)),
        balance: parseFloat((dailyData.reduce((sum, d) => sum + d.expense.balance, 0) / days).toFixed(2))
      }
    };

    console.log('✅ 财务报告生成成功');
    console.log(`   积分入账: ${summary.totalIncome.points} | 余额入账: $${summary.totalIncome.balance}`);
    console.log(`   积分出账: ${summary.totalExpense.points} | 余额出账: $${summary.totalExpense.balance}`);
    console.log(`   积分净收入: ${summary.netProfit.points} | 余额净收入: $${summary.netProfit.balance}`);

    res.json({
      success: true,
      data: {
        dailyData,
        summary,
        period: {
          days,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      }
    });
  } catch (error) {
    console.error('❌ 获取财务报告失败:', error);
    res.status(500).json({
      success: false,
      message: '获取财务报告失败',
      error: error.message
    });
  }
});

/**
 * 获取用户列表
 * GET /api/admin/users?page=1&limit=10&search=&vipFilter=all
 */
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      vipFilter = 'all' 
    } = req.query;

    console.log(`\n👥 管理员请求用户列表 (页码: ${page}, 每页: ${limit}, 搜索: ${search || '无'}, VIP过滤: ${vipFilter})`);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // 构建查询条件
    const query = {};

    // 搜索条件
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { referralCode: { $regex: search, $options: 'i' } }
      ];
    }

    // VIP过滤
    if (vipFilter !== 'all') {
      if (vipFilter === 'none') {
        query.$or = [
          { vipStatus: 'none' },
          { vipStatus: { $exists: false } },
          { vipStatus: null }
        ];
      } else if (vipFilter === 'vip') {
        query.vipStatus = { $in: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] };
      } else {
        // 特定VIP等级
        query.vipStatus = vipFilter;
      }
    }

    // 获取总数
    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limitNum);

    // 获取用户列表
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('referredBy', 'username')
      .lean();

    // 为每个用户添加统计数据
    const usersWithStats = await Promise.all(users.map(async (user) => {
      // 获取推荐用户数
      const totalReferrals = await User.countDocuments({ referredBy: user._id });
      
      // 获取搜索次数
      const totalSearches = await SearchLog.countDocuments({ userId: user._id });
      
      // 获取总佣金收入
      const commissionLogs = await BalanceLog.find({ 
        userId: user._id, 
        currency: 'commission',
        type: { $in: ['commission', 'referral_bonus', 'referral_reward'] }
      });
      const totalCommission = commissionLogs.reduce((sum, log) => sum + Math.abs(log.amount), 0);

      return {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        vipStatus: user.vipStatus || 'none',
        balance: user.balance || 0,
        points: user.points || 0,
        commission: user.commission || 0,
        referralCode: user.referralCode || '',
        referredBy: user.referredBy?._id?.toString() || null,
        referredByUsername: user.referredBy?.username || null,
        totalReferrals,
        totalCommission: parseFloat(totalCommission.toFixed(2)),
        totalSearches,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt || user.createdAt
      };
    }));

    console.log(`✅ 返回 ${usersWithStats.length} 个用户 (共 ${totalUsers} 个)`);

    res.json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers,
          limit: limitNum
        }
      }
    });
  } catch (error) {
    console.error('❌ 获取用户列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户列表失败',
      error: error.message
    });
  }
});

/**
 * 获取用户详细信息
 * GET /api/admin/users/:userId
 */
router.get('/users/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`\n👤 管理员请求用户详情: ${userId}`);

    const user = await User.findById(userId)
      .select('-password')
      .populate('referredBy', 'username email')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 获取推荐用户列表
    const referralUsers = await User.find({ referredBy: userId })
      .select('username email createdAt totalRecharged')
      .sort({ createdAt: -1 })
      .lean();

    const referralUsersWithStats = await Promise.all(referralUsers.map(async (refUser) => {
      // 获取该用户产生的佣金
      const commissionLogs = await BalanceLog.find({
        userId: userId,
        type: { $in: ['commission', 'referral_bonus', 'referral_reward'] },
        description: { $regex: refUser.username, $options: 'i' }
      });
      const commission = commissionLogs.reduce((sum, log) => sum + Math.abs(log.amount), 0);

      return {
        id: refUser._id.toString(),
        username: refUser.username,
        email: refUser.email,
        createdAt: refUser.createdAt,
        totalRecharge: refUser.totalRecharged || 0,
        commission: parseFloat(commission.toFixed(2)),
        level: 1
      };
    }));

    // 获取积分记录
    const pointsRecords = await BalanceLog.find({
      userId: userId,
      currency: 'points'
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const pointsRecordsFormatted = pointsRecords.map(record => ({
      id: record._id.toString(),
      amount: record.amount,
      type: record.type,
      description: record.description || '积分变动',
      createdAt: record.createdAt
    }));

    // 获取佣金记录
    const commissionRecords = await BalanceLog.find({
      userId: userId,
      currency: 'commission'
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const commissionRecordsFormatted = commissionRecords.map(record => ({
      id: record._id.toString(),
      amount: Math.abs(record.amount),
      fromUser: record.description?.match(/来自用户[：:]\s*(\S+)/)?.[1] || '系统',
      type: record.type,
      description: record.description || '佣金变动',
      createdAt: record.createdAt
    }));

    // 获取搜索记录
    const searchRecords = await SearchLog.find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const searchRecordsFormatted = searchRecords.map(record => ({
      id: record._id.toString(),
      type: record.type || 'unknown',
      query: record.query || '',
      database: record.database || '未知',
      cost: record.cost || 0,
      status: record.resultCount > 0 ? 'success' : 'failed',
      createdAt: record.createdAt
    }));

    console.log(`✅ 返回用户详情: ${user.username}`);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          vipStatus: user.vipStatus || 'none',
          balance: user.balance || 0,
          points: user.points || 0,
          commission: user.commission || 0,
          referralCode: user.referralCode || '',
          referredBy: user.referredBy?._id?.toString() || null,
          referredByUsername: user.referredBy?.username || null,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt || user.createdAt
        },
        referralUsers: referralUsersWithStats,
        pointsRecords: pointsRecordsFormatted,
        commissionRecords: commissionRecordsFormatted,
        searchRecords: searchRecordsFormatted
      }
    });
  } catch (error) {
    console.error('❌ 获取用户详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户详情失败',
      error: error.message
    });
  }
});

/**
 * 重置用户密码
 * POST /api/admin/users/:userId/reset-password
 */
router.post('/users/:userId/reset-password', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    console.log(`\n🔑 管理员重置用户密码: ${userId}`);

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: '密码至少需要6位'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 加密新密码
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    user.password = hashedPassword;
    await user.save();

    console.log(`✅ 用户 ${user.username} 的密码已重置`);

    res.json({
      success: true,
      message: '密码重置成功'
    });
  } catch (error) {
    console.error('❌ 重置密码失败:', error);
    res.status(500).json({
      success: false,
      message: '重置密码失败',
      error: error.message
    });
  }
});

/**
 * 删除用户
 * DELETE /api/admin/users/:userId
 */
router.delete('/users/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`\n🗑️  管理员删除用户: ${userId}`);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 防止删除管理员账户
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: '不能删除管理员账户'
      });
    }

    // 删除用户相关数据
    console.log(`  删除用户 ${user.username} 的相关数据...`);
    
    // 删除用户的搜索记录
    const searchLogsDeleted = await SearchLog.deleteMany({ userId: userId });
    console.log(`  - 删除 ${searchLogsDeleted.deletedCount} 条搜索记录`);

    // 删除用户的余额日志
    const balanceLogsDeleted = await BalanceLog.deleteMany({ userId: userId });
    console.log(`  - 删除 ${balanceLogsDeleted.deletedCount} 条余额日志`);

    // 删除用户的提现订单
    const withdrawOrdersDeleted = await WithdrawOrder.deleteMany({ userId: userId });
    console.log(`  - 删除 ${withdrawOrdersDeleted.deletedCount} 条提现订单`);

    // 更新被该用户推荐的用户（清除推荐关系）
    const referredUsersUpdated = await User.updateMany(
      { referredBy: userId },
      { $unset: { referredBy: '' } }
    );
    console.log(`  - 更新 ${referredUsersUpdated.modifiedCount} 个被推荐用户的推荐关系`);

    // 最后删除用户
    await User.findByIdAndDelete(userId);

    console.log(`✅ 用户 ${user.username} 及其相关数据已删除`);

    res.json({
      success: true,
      message: '用户删除成功'
    });
  } catch (error) {
    console.error('❌ 删除用户失败:', error);
    res.status(500).json({
      success: false,
      message: '删除用户失败',
      error: error.message
    });
  }
});

module.exports = router;
