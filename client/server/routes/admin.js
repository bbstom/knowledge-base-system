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
      vipStatus: { $ne: 'none' } 
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

module.exports = router;
