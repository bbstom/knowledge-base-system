const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const LotteryActivity = require('../models/LotteryActivity');
const LotteryRecord = require('../models/LotteryRecord');
const lotteryService = require('../services/lotteryService');

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

// 获取日期范围
const getDateRange = (range) => {
  const now = new Date();
  let startDate;

  switch (range) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    default:
      startDate = null;
  }

  return startDate;
};

// ==================== 用户端 API ====================

/**
 * 获取可用的抽奖活动列表
 * GET /api/lottery/activities
 */
router.get('/activities', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    
    const activities = await LotteryActivity.find({
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now }
    }).sort({ createdAt: -1 }).lean();

    // 计算用户今日剩余抽奖次数
    const activitiesWithLimit = await Promise.all(activities.map(async (activity) => {
      let remainingDraws = -1;  // -1 表示无限制
      
      if (activity.dailyLimit > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayCount = await LotteryRecord.countDocuments({
          userId: req.user._id,
          activityId: activity._id,
          createdAt: { $gte: today }
        });
        
        remainingDraws = Math.max(0, activity.dailyLimit - todayCount);
      }

      return {
        ...activity,
        id: activity._id.toString(),
        remainingDraws
      };
    }));

    res.json({
      success: true,
      data: activitiesWithLimit
    });
  } catch (error) {
    console.error('获取抽奖活动失败:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

/**
 * 参与抽奖
 * POST /api/lottery/draw/:activityId
 */
router.post('/draw/:activityId', authMiddleware, async (req, res) => {
  try {
    const { activityId } = req.params;
    
    const result = await lotteryService.performDraw(req.user._id, activityId);

    res.json({
      success: true,
      data: {
        prize: {
          id: result.prize._id.toString(),
          name: result.prize.name,
          type: result.prize.type,
          value: result.prize.value,
          image: result.prize.image,
          description: result.prize.description
        },
        record: {
          id: result.record._id.toString(),
          status: result.record.status
        }
      },
      message: result.prize.type === 'thanks' ? '谢谢参与！' : '恭喜中奖！'
    });
  } catch (error) {
    console.error('抽奖失败:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * 获取我的抽奖记录
 * GET /api/lottery/records
 */
router.get('/records', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const records = await LotteryRecord.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('activityId', 'name')
      .lean();

    const total = await LotteryRecord.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      data: {
        records: records.map(r => ({
          ...r,
          id: r._id.toString(),
          activityName: r.activityId?.name || '活动已删除'
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取记录失败:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

/**
 * 领取奖品
 * POST /api/lottery/claim/:recordId
 */
router.post('/claim/:recordId', authMiddleware, async (req, res) => {
  try {
    const { recordId } = req.params;
    const { shippingInfo } = req.body;

    const record = await LotteryRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({ success: false, message: '记录不存在' });
    }

    if (record.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: '无权操作' });
    }

    let result;
    if (record.prizeType === 'physical') {
      result = await lotteryService.claimPhysicalPrize(recordId, shippingInfo);
    } else if (record.prizeType === 'points') {
      result = await lotteryService.claimPointsPrize(recordId);
    } else if (record.prizeType === 'vip') {
      result = await lotteryService.claimVIPPrize(recordId);
    } else {
      return res.status(400).json({ success: false, message: '该奖品无需领取' });
    }

    res.json({
      success: true,
      message: '领取成功',
      data: result
    });
  } catch (error) {
    console.error('领取奖品失败:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// ==================== 管理端 API ====================

/**
 * 获取所有抽奖活动
 * GET /api/lottery/admin/activities
 */
router.get('/admin/activities', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, isActive } = req.query;
    
    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const activities = await LotteryActivity.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await LotteryActivity.countDocuments(query);

    res.json({
      success: true,
      data: {
        activities: activities.map(a => ({
          ...a,
          id: a._id.toString()
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取活动失败:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

/**
 * 创建抽奖活动
 * POST /api/admin/lottery/activities
 */
router.post('/admin/activities', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, costPoints, dailyLimit, startTime, endTime, prizes, isActive } = req.body;

    if (!name || !costPoints || !startTime || !endTime || !prizes || prizes.length === 0) {
      return res.status(400).json({ success: false, message: '请填写完整信息' });
    }

    // 验证概率总和
    const totalProbability = prizes.reduce((sum, p) => sum + (p.probability || 0), 0);
    if (totalProbability > 100) {
      return res.status(400).json({ success: false, message: '奖品概率总和不能超过100%' });
    }

    const activity = await LotteryActivity.create({
      name,
      description,
      costPoints,
      dailyLimit: dailyLimit || 0,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      prizes,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id
    });

    console.log(`✅ 管理员 ${req.user.username} 创建了抽奖活动: ${name}`);

    res.json({
      success: true,
      message: '创建成功',
      data: activity
    });
  } catch (error) {
    console.error('创建活动失败:', error);
    res.status(500).json({ success: false, message: '创建失败' });
  }
});

/**
 * 更新抽奖活动
 * PUT /api/admin/lottery/activities/:id
 */
router.put('/admin/activities/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // 验证概率总和
    if (updates.prizes) {
      const totalProbability = updates.prizes.reduce((sum, p) => sum + (p.probability || 0), 0);
      if (totalProbability > 100) {
        return res.status(400).json({ success: false, message: '奖品概率总和不能超过100%' });
      }
    }

    const activity = await LotteryActivity.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!activity) {
      return res.status(404).json({ success: false, message: '活动不存在' });
    }

    console.log(`✅ 管理员 ${req.user.username} 更新了抽奖活动: ${activity.name}`);

    res.json({
      success: true,
      message: '更新成功',
      data: activity
    });
  } catch (error) {
    console.error('更新活动失败:', error);
    res.status(500).json({ success: false, message: '更新失败' });
  }
});

/**
 * 删除抽奖活动
 * DELETE /api/admin/lottery/activities/:id
 */
router.delete('/admin/activities/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await LotteryActivity.findByIdAndDelete(id);
    if (!activity) {
      return res.status(404).json({ success: false, message: '活动不存在' });
    }

    console.log(`✅ 管理员 ${req.user.username} 删除了抽奖活动: ${activity.name}`);

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除活动失败:', error);
    res.status(500).json({ success: false, message: '删除失败' });
  }
});

/**
 * 获取抽奖记录
 * GET /api/admin/lottery/records
 */
router.get('/admin/records', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 50, activityId, status, userId } = req.query;
    
    const query = {};
    if (activityId) query.activityId = activityId;
    if (status) query.status = status;
    if (userId) query.userId = userId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const records = await LotteryRecord.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'username email')
      .populate('activityId', 'name')
      .lean();

    const total = await LotteryRecord.countDocuments(query);

    res.json({
      success: true,
      data: {
        records: records.map(r => ({
          ...r,
          id: r._id.toString(),
          username: r.userId?.username || '未知用户',
          activityName: r.activityId?.name || '活动已删除'
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取记录失败:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

/**
 * 更新记录状态
 * PUT /api/admin/lottery/records/:id/status
 */
router.put('/admin/records/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const record = await LotteryRecord.findByIdAndUpdate(
      id,
      { status, note },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({ success: false, message: '记录不存在' });
    }

    console.log(`✅ 管理员 ${req.user.username} 更新了抽奖记录状态: ${status}`);

    res.json({
      success: true,
      message: '更新成功',
      data: record
    });
  } catch (error) {
    console.error('更新记录失败:', error);
    res.status(500).json({ success: false, message: '更新失败' });
  }
});

/**
 * 获取活动统计
 * GET /api/admin/lottery/statistics/:id
 */
router.get('/admin/statistics/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await LotteryActivity.findById(id);
    if (!activity) {
      return res.status(404).json({ success: false, message: '活动不存在' });
    }

    // 统计各奖品中奖次数
    const prizeStats = await Promise.all(activity.prizes.map(async (prize) => {
      const count = await LotteryRecord.countDocuments({
        activityId: id,
        prizeId: prize._id.toString()
      });

      return {
        prizeName: prize.name,
        prizeType: prize.type,
        totalQuantity: prize.quantity,
        remainingQuantity: prize.quantity === -1 ? -1 : Math.max(0, prize.quantity),
        winCount: count,
        probability: prize.probability
      };
    }));

    // 统计参与用户数
    const participantCount = await LotteryRecord.distinct('userId', { activityId: id }).then(arr => arr.length);

    res.json({
      success: true,
      data: {
        activityName: activity.name,
        totalDraws: activity.totalDraws,
        totalWinners: activity.totalWinners,
        participantCount,
        winRate: activity.totalDraws > 0 ? ((activity.totalWinners / activity.totalDraws) * 100).toFixed(2) : 0,
        prizeStats
      }
    });
  } catch (error) {
    console.error('获取统计失败:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

/**
 * 获取抽奖统计数据
 * GET /api/lottery/admin/statistics
 */
router.get('/admin/statistics', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { activityId, dateRange } = req.query;
    
    // 构建查询条件
    const query = {};
    const startDate = getDateRange(dateRange);
    
    if (startDate) {
      query.createdAt = { $gte: startDate };
    }
    
    if (activityId && activityId !== 'all') {
      query.activityId = activityId;
    }

    // 总体统计
    const totalDraws = await LotteryRecord.countDocuments(query);
    const uniqueUsers = await LotteryRecord.distinct('userId', query);
    const records = await LotteryRecord.find(query);
    
    const totalPointsSpent = records.reduce((sum, r) => sum + (r.pointsSpent || 0), 0);
    const totalPrizesWon = records.filter(r => r.prizeType !== 'thanks' && r.prizeType !== 'none').length;
    const winRate = totalDraws > 0 ? ((totalPrizesWon / totalDraws) * 100).toFixed(2) : 0;
    
    // 计算奖品总价值（积分等值）
    const totalPrizeValue = records.reduce((sum, r) => {
      if (r.prizeType === 'points') return sum + r.prizeValue;
      if (r.prizeType === 'vip') return sum + (r.prizeValue * 10); // VIP按10积分/天计算
      return sum;
    }, 0);

    // 奖品类型分布
    const prizeTypes = {};
    records.forEach(r => {
      const type = r.prizeType || 'unknown';
      prizeTypes[type] = (prizeTypes[type] || 0) + 1;
    });

    const prizeDistribution = Object.entries(prizeTypes).map(([type, count]) => ({
      type,
      typeName: {
        points: '积分',
        vip: 'VIP',
        coupon: '优惠券',
        physical: '实物',
        thanks: '谢谢参与',
        none: '谢谢参与'
      }[type] || type,
      count,
      percentage: ((count / totalDraws) * 100).toFixed(2)
    })).sort((a, b) => b.count - a.count);

    // 热门奖品 TOP 5
    const prizeStats = {};
    records.forEach(r => {
      const key = `${r.prizeName}_${r.prizeType}_${r.prizeValue}`;
      if (!prizeStats[key]) {
        prizeStats[key] = {
          name: r.prizeName,
          type: r.prizeType,
          value: r.prizeValue,
          count: 0
        };
      }
      prizeStats[key].count++;
    });

    const topPrizes = Object.values(prizeStats)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(prize => ({
        ...prize,
        percentage: ((prize.count / totalDraws) * 100).toFixed(2)
      }));

    // 活动排行
    const activityStats = {};
    for (const record of records) {
      const actId = record.activityId?.toString();
      if (!actId) continue;
      
      if (!activityStats[actId]) {
        activityStats[actId] = {
          activityId: actId,
          totalDraws: 0,
          users: new Set(),
          pointsSpent: 0,
          prizesWon: 0
        };
      }
      
      activityStats[actId].totalDraws++;
      activityStats[actId].users.add(record.userId?.toString());
      activityStats[actId].pointsSpent += record.pointsSpent || 0;
      if (record.prizeType !== 'thanks' && record.prizeType !== 'none') {
        activityStats[actId].prizesWon++;
      }
    }

    const activityRanking = await Promise.all(
      Object.entries(activityStats).map(async ([actId, stats]) => {
        const activity = await LotteryActivity.findById(actId);
        return {
          activityId: actId,
          name: activity?.name || '已删除',
          status: activity?.status || 'ended',
          totalDraws: stats.totalDraws,
          uniqueUsers: stats.users.size,
          pointsSpent: stats.pointsSpent,
          prizesWon: stats.prizesWon,
          winRate: ((stats.prizesWon / stats.totalDraws) * 100).toFixed(2)
        };
      })
    );
    activityRanking.sort((a, b) => b.totalDraws - a.totalDraws);

    // 用户参与排行
    const userStats = {};
    records.forEach(r => {
      const userId = r.userId?.toString();
      if (!userId) return;
      
      if (!userStats[userId]) {
        userStats[userId] = {
          userId,
          totalDraws: 0,
          pointsSpent: 0,
          prizesWon: 0
        };
      }
      
      userStats[userId].totalDraws++;
      userStats[userId].pointsSpent += r.pointsSpent || 0;
      if (r.prizeType !== 'thanks' && r.prizeType !== 'none') {
        userStats[userId].prizesWon++;
      }
    });

    const topUsers = await Promise.all(
      Object.entries(userStats)
        .sort((a, b) => b[1].totalDraws - a[1].totalDraws)
        .slice(0, 10)
        .map(async ([userId, stats]) => {
          const user = await User.findById(userId).select('username');
          return {
            userId,
            username: user?.username || '未知用户',
            totalDraws: stats.totalDraws,
            pointsSpent: stats.pointsSpent,
            prizesWon: stats.prizesWon,
            winRate: ((stats.prizesWon / stats.totalDraws) * 100).toFixed(2)
          };
        })
    );

    res.json({
      success: true,
      data: {
        overview: {
          totalDraws,
          uniqueUsers: uniqueUsers.length,
          totalPointsSpent,
          avgPointsPerDraw: totalDraws > 0 ? Math.round(totalPointsSpent / totalDraws) : 0,
          totalPrizesWon,
          winRate: parseFloat(winRate),
          totalPrizeValue
        },
        prizeDistribution,
        topPrizes,
        activityRanking,
        topUsers
      }
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取统计数据失败',
      error: error.message 
    });
  }
});

module.exports = router;
