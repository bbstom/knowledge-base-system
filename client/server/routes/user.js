const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BalanceLog = require('../models/BalanceLog');

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
 * 获取用户资料
 * GET /api/user/profile
 */
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        _id: req.user._id,
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        points: req.user.points,
        balance: req.user.balance,
        commission: req.user.commission,
        isVip: req.user.isVip,
        vipExpireAt: req.user.vipExpireAt,
        referralCode: req.user.referralCode,
        role: req.user.role,
        totalRecharged: req.user.totalRecharged,
        totalConsumed: req.user.totalConsumed,
        createdAt: req.user.createdAt,
        lastDailyClaimAt: req.user.lastDailyClaimAt,
        referralCount: req.user.referralCount,
        avatar: req.user.avatar
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: '获取用户资料失败'
    });
  }
});

/**
 * 更新用户资料
 * PUT /api/user/profile
 */
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, email } = req.body;

    // 检查用户名是否被占用
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '用户名已被使用'
        });
      }
      req.user.username = username;
    }

    // 检查邮箱是否被占用
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '邮箱已被使用'
        });
      }
      req.user.email = email;
    }

    await req.user.save();

    res.json({
      success: true,
      message: '资料更新成功',
      data: {
        user: {
          id: req.user._id,
          username: req.user.username,
          email: req.user.email
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: '更新资料失败'
    });
  }
});

/**
 * 获取余额变动记录
 * GET /api/user/balance-logs
 */
router.get('/balance-logs', authMiddleware, async (req, res) => {
  try {
    const { PAGE_SIZE } = require('../config/pagination');
    const { page = 1, limit = PAGE_SIZE } = req.query;
    const skip = (page - 1) * limit;

    const logs = await BalanceLog.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await BalanceLog.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get balance logs error:', error);
    res.status(500).json({
      success: false,
      message: '获取记录失败'
    });
  }
});

/**
 * 获取推荐统计
 * GET /api/user/referral-stats
 */
router.get('/referral-stats', authMiddleware, async (req, res) => {
  try {
    // 查找被推荐的用户
    const referredUsers = await User.find({ referredBy: req.user._id });

    // 为每个推荐用户计算累计消费和产生的佣金
    const referredUsersWithStats = await Promise.all(
      referredUsers.map(async (user) => {
        // 计算该用户的累计充值金额（作为累计消费）
        const totalSpent = user.totalRecharged || 0;
        
        // 查询推荐人从该用户获得的佣金总额
        const commissionLogs = await BalanceLog.find({
          userId: req.user._id,
          type: 'commission',
          relatedUserId: user._id
        });
        
        const commissionEarned = commissionLogs.reduce((sum, log) => sum + log.amount, 0);
        
        return {
          _id: user._id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
          totalSpent: totalSpent,
          commissionEarned: commissionEarned
        };
      })
    );

    // 计算总佣金收益
    const totalEarnings = referredUsersWithStats.reduce((sum, user) => sum + user.commissionEarned, 0);

    res.json({
      success: true,
      data: {
        referralCode: req.user.referralCode,
        totalReferrals: referredUsers.length,
        totalEarnings,
        referredUsers: referredUsersWithStats
      }
    });
  } catch (error) {
    console.error('Get referral stats error:', error);
    res.status(500).json({
      success: false,
      message: '获取推荐统计失败'
    });
  }
});

/**
 * 余额兑换积分
 * POST /api/user/exchange-points
 */
router.post('/exchange-points', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body; // 要兑换的积分数量
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: '请输入有效的积分数量',
        code: 'INVALID_AMOUNT'
      });
    }
    
    // 获取兑换汇率配置（例如：1元余额 = 10积分）
    const SystemConfig = require('../models/SystemConfig');
    const config = await SystemConfig.getConfig();
    const exchangeRate = config.points.exchangeRate || 10; // 1元 = 10积分
    
    // 计算需要的余额
    const cost = amount / exchangeRate;
    
    // 检查余额是否足够
    if (req.user.balance < cost) {
      return res.status(400).json({
        success: false,
        message: '余额不足',
        code: 'INSUFFICIENT_BALANCE',
        data: {
          required: cost,
          current: req.user.balance
        }
      });
    }
    
    // 保存变动前的值
    const balanceBefore = req.user.balance;
    const pointsBefore = req.user.points;
    
    // 扣除余额，增加积分
    req.user.balance -= cost;
    req.user.points += amount;
    await req.user.save();
    
    // 记录两条日志
    await BalanceLog.create([
      {
        userId: req.user._id,
        type: 'exchange',
        currency: 'balance',
        amount: -cost,
        balanceBefore: balanceBefore,
        balanceAfter: req.user.balance,
        description: `余额兑换积分：消耗$${cost.toFixed(2)}`
      },
      {
        userId: req.user._id,
        type: 'exchange',
        currency: 'points',
        amount: amount,
        balanceBefore: pointsBefore,
        balanceAfter: req.user.points,
        description: `余额兑换积分：获得${amount}积分`
      }
    ]);
    
    console.log(`✅ 用户 ${req.user.username} 兑换${amount}积分，消耗$${cost.toFixed(2)}余额`);
    
    res.json({
      success: true,
      message: `成功兑换${amount}积分`,
      data: {
        pointsAdded: amount,
        costBalance: cost,
        balance: req.user.balance,
        points: req.user.points,
        exchangeRate
      }
    });
  } catch (error) {
    console.error('Exchange points error:', error);
    res.status(500).json({
      success: false,
      message: '兑换积分失败'
    });
  }
});

/**
 * 获取搜索历史
 * GET /api/user/search-history
 */
router.get('/search-history', authMiddleware, async (req, res) => {
  try {
    const { PAGE_SIZE } = require('../config/pagination');
    const SearchLog = require('../models/SearchLog');
    const { page = 1, limit = PAGE_SIZE } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const logs = await SearchLog.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();
    
    const total = await SearchLog.countDocuments({ userId: req.user._id });
    
    // 映射字段名以匹配前端期望的格式
    const history = logs.map(log => ({
      _id: log._id,
      type: log.searchType,
      query: log.searchQuery,
      pointsCost: log.pointsCharged,
      resultCount: log.resultsCount,
      searchTime: log.searchTime,
      databasesSearched: log.databasesSearched,
      createdAt: log.createdAt
    }));
    
    res.json({
      success: true,
      data: {
        history,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get search history error:', error);
    res.status(500).json({
      success: false,
      message: '获取搜索历史失败'
    });
  }
});

/**
 * 获取佣金记录
 * GET /api/user/commissions
 */
router.get('/commissions', authMiddleware, async (req, res) => {
  try {
    const { PAGE_SIZE } = require('../config/pagination');
    const { page = 1, limit = PAGE_SIZE } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 从BalanceLog中获取佣金相关的记录
    const commissions = await BalanceLog.find({ 
      userId: req.user._id,
      type: { $in: ['commission', 'commission_to_balance', 'commission_withdraw', 'withdraw', 'commission_refund', 'refund'] }
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();
    
    const total = await BalanceLog.countDocuments({ 
      userId: req.user._id,
      type: { $in: ['commission', 'commission_to_balance', 'commission_withdraw', 'withdraw', 'commission_refund', 'refund'] }
    });
    
    // 计算总佣金收入（commission）
    const commissionIncome = await BalanceLog.find({
      userId: req.user._id,
      type: 'commission',
      currency: 'commission'
    });
    
    const totalCommission = commissionIncome.reduce((sum, log) => sum + log.amount, 0);
    
    // 计算已提现金额（负数记录 - 退还记录）
    const withdrawnLogs = await BalanceLog.find({
      userId: req.user._id,
      type: { $in: ['commission_to_balance', 'commission_withdraw', 'withdraw'] },
      currency: { $in: ['points', 'commission'] },
      amount: { $lt: 0 }
    });
    
    // 计算退还金额（正数的退还记录）
    const refundLogs = await BalanceLog.find({
      userId: req.user._id,
      type: { $in: ['refund', 'commission_refund'] },
      currency: 'commission',
      amount: { $gt: 0 }
    });
    
    const totalWithdrawnAmount = withdrawnLogs.reduce((sum, log) => sum + Math.abs(log.amount), 0);
    const totalRefundAmount = refundLogs.reduce((sum, log) => sum + log.amount, 0);
    const totalWithdrawn = totalWithdrawnAmount - totalRefundAmount; // 实际已提现 = 提现总额 - 退还总额
    const availableCommission = totalCommission - totalWithdrawn;
    
    res.json({
      success: true,
      data: {
        commissions,
        totalCommission,
        availableCommission,
        totalWithdrawn,
        pendingCommission: 0, // 暂时设为0，后续可以添加待结算逻辑
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get commissions error:', error);
    res.status(500).json({
      success: false,
      message: '获取佣金记录失败'
    });
  }
});

/**
 * 获取积分历史
 * GET /api/user/points-history
 */
router.get('/points-history', authMiddleware, async (req, res) => {
  try {
    const { PAGE_SIZE } = require('../config/pagination');
    const { page = 1, limit = PAGE_SIZE } = req.query;
    const skip = (page - 1) * limit;

    // 从余额日志中获取积分相关记录（currency为points的所有记录）
    const logs = await BalanceLog.find({ 
      userId: req.user._id,
      currency: 'points'
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await BalanceLog.countDocuments({ 
      userId: req.user._id,
      currency: 'points'
    });

    // 计算已使用的积分（负数金额的总和）
    const usedPointsResult = await BalanceLog.aggregate([
      {
        $match: {
          userId: req.user._id,
          currency: 'points',
          amount: { $lt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const usedPoints = usedPointsResult.length > 0 ? Math.abs(usedPointsResult[0].total) : 0;

    // 映射type到前端显示的类型
    const typeMapping = {
      'recharge': 'recharge',
      'recharge_card': 'recharge',
      'commission': 'referral',
      'search': 'purchase',
      'exchange': 'purchase',
      'vip': 'purchase',
      'refund': 'bonus',
      'register': 'bonus',
      'referral_bonus': 'bonus',
      'daily_claim': 'bonus'
    };

    res.json({
      success: true,
      data: {
        totalPoints: req.user.points,
        availablePoints: req.user.points,
        usedPoints: usedPoints,
        pointsHistory: logs.map(log => ({
          type: typeMapping[log.type] || 'bonus',
          amount: log.amount,
          description: log.description || '积分变动',
          createdAt: log.createdAt
        })),
        canClaimDaily: true,
        dailyReward: 10,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get points history error:', error);
    res.status(500).json({
      success: false,
      message: '获取积分历史失败'
    });
  }
});

module.exports = router;
