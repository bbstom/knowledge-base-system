const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const WithdrawOrder = require('../models/WithdrawOrder');
const BalanceLog = require('../models/BalanceLog');
const SystemConfig = require('../models/SystemConfig');

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
 * 创建提现申请
 * POST /api/withdraw/create
 */
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { amount, walletAddress } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: '请输入有效的提现金额'
      });
    }

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: '请输入钱包地址'
      });
    }

    // 检查余额是否足够
    if (req.user.balance < amount) {
      return res.status(400).json({
        success: false,
        message: '余额不足'
      });
    }

    // 这里应该创建提现记录并处理提现逻辑
    // 暂时返回成功响应
    res.json({
      success: true,
      message: '提现申请已提交',
      data: {
        withdrawId: 'WD' + Date.now(),
        amount,
        walletAddress,
        status: 'pending',
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Create withdraw error:', error);
    res.status(500).json({
      success: false,
      message: '提现申请失败'
    });
  }
});

/**
 * 佣金提现到USDT
 * POST /api/withdraw/commission
 */
router.post('/commission', authMiddleware, async (req, res) => {
  try {
    const { amount, walletAddress, type = 'usdt' } = req.body;

    // 验证输入
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: '请输入有效的提现金额'
      });
    }

    // 获取系统配置
    const config = await SystemConfig.getConfig();
    const minWithdrawAmountBalance = config.points?.minWithdrawAmountBalance || 1;
    const minWithdrawAmountUsdt = config.points?.minWithdrawAmount || 10;
    const withdrawFee = config.points?.withdrawFee || 5;

    // 根据提现类型检查最低提现金额
    const minAmount = type === 'balance' ? minWithdrawAmountBalance : minWithdrawAmountUsdt;
    const withdrawTypeName = type === 'balance' ? '余额账户' : 'USDT钱包';
    
    if (amount < minAmount) {
      return res.status(400).json({
        success: false,
        message: `提现到${withdrawTypeName}的最低金额为 $${minAmount.toFixed(2)}`,
        code: 'BELOW_MIN_AMOUNT',
        data: {
          minAmount: minAmount,
          currentAmount: amount,
          type: type
        }
      });
    }

    // 检查佣金余额
    if (req.user.commission < amount) {
      return res.status(400).json({
        success: false,
        message: '佣金余额不足',
        code: 'INSUFFICIENT_COMMISSION',
        data: {
          required: amount,
          current: req.user.commission
        }
      });
    }

    if (type === 'usdt') {
      // 提现到USDT钱包
      if (!walletAddress) {
        return res.status(400).json({
          success: false,
          message: '请输入USDT钱包地址'
        });
      }

      // 计算手续费和实际到账金额
      const feeAmount = (amount * withdrawFee) / 100;
      const actualAmount = amount - feeAmount;

      // 生成订单号
      const orderNo = 'WD' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();

      // 创建提现订单
      const withdrawOrder = await WithdrawOrder.create({
        userId: req.user._id,
        orderNo,
        type: 'commission',
        amount,
        fee: feeAmount,
        actualAmount,
        walletAddress,
        status: 'pending'
      });

      // 扣除佣金
      const commissionBefore = req.user.commission;
      req.user.commission -= amount;
      await req.user.save();

      // 记录日志
      await BalanceLog.create({
        userId: req.user._id,
        type: 'withdraw',
        currency: 'commission',
        amount: -amount,
        balanceBefore: commissionBefore,
        balanceAfter: req.user.commission,
        orderId: orderNo,
        description: `佣金提现到USDT钱包: ${walletAddress}`
      });

      res.json({
        success: true,
        message: '提现申请已提交，等待审核',
        data: {
          orderNo,
          amount,
          fee: feeAmount,
          actualAmount,
          walletAddress,
          status: 'pending',
          createdAt: withdrawOrder.createdAt
        }
      });
    } else if (type === 'balance') {
      // 转入余额（不收手续费）
      const commissionBefore = req.user.commission;
      const balanceBefore = req.user.balance;

      req.user.commission -= amount;
      req.user.balance += amount;
      await req.user.save();

      // 记录两条日志
      await BalanceLog.create([
        {
          userId: req.user._id,
          type: 'commission_to_balance',
          currency: 'commission',
          amount: -amount,
          balanceBefore: commissionBefore,
          balanceAfter: req.user.commission,
          description: '佣金转入余额'
        },
        {
          userId: req.user._id,
          type: 'commission_to_balance',
          currency: 'balance',
          amount: amount,
          balanceBefore: balanceBefore,
          balanceAfter: req.user.balance,
          description: '佣金转入余额'
        }
      ]);

      res.json({
        success: true,
        message: '佣金已成功转入余额',
        data: {
          amount,
          commission: req.user.commission,
          balance: req.user.balance
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: '无效的提现类型'
      });
    }
  } catch (error) {
    console.error('Commission withdraw error:', error);
    res.status(500).json({
      success: false,
      message: '提现操作失败'
    });
  }
});

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
 * 获取提现记录
 * GET /api/withdraw/history
 */
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { PAGE_SIZE } = require('../config/pagination');
    const { page = 1, limit = PAGE_SIZE, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { userId: req.user._id };
    if (type) {
      query.type = type;
    }

    const [withdrawals, total] = await Promise.all([
      WithdrawOrder.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      WithdrawOrder.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        withdrawals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get withdraw history error:', error);
    res.status(500).json({
      success: false,
      message: '获取提现记录失败'
    });
  }
});

/**
 * 管理员获取所有提现申请
 * GET /api/withdraw/admin/list
 */
router.get('/admin/list', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { PAGE_SIZE } = require('../config/pagination');
    const { page = 1, limit = PAGE_SIZE, status, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (status) {
      query.status = status;
    }
    if (type) {
      query.type = type;
    }

    const [withdrawals, total] = await Promise.all([
      WithdrawOrder.find(query)
        .populate('userId', 'username email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      WithdrawOrder.countDocuments(query)
    ]);

    // 统计各状态数量
    const statusStats = await WithdrawOrder.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        withdrawals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        stats: statusStats
      }
    });
  } catch (error) {
    console.error('Get admin withdrawals error:', error);
    res.status(500).json({
      success: false,
      message: '获取提现申请失败'
    });
  }
});

/**
 * 管理员审批提现申请
 * POST /api/withdraw/admin/approve/:orderId
 */
router.post('/admin/approve/:orderId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { txHash, remark } = req.body;

    const order = await WithdrawOrder.findById(orderId).populate('userId');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '提现订单不存在'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '订单状态不允许审批'
      });
    }

    // 更新订单状态
    order.status = 'completed';
    order.txHash = txHash;
    order.remark = remark;
    order.processedAt = new Date();
    order.processedBy = req.user._id;
    await order.save();

    res.json({
      success: true,
      message: '提现申请已审批通过'
    });
  } catch (error) {
    console.error('Approve withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: '审批失败'
    });
  }
});

/**
 * 管理员拒绝提现申请
 * POST /api/withdraw/admin/reject/:orderId
 */
router.post('/admin/reject/:orderId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await WithdrawOrder.findById(orderId).populate('userId');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '提现订单不存在'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '订单状态不允许操作'
      });
    }

    // 更新订单状态
    order.status = 'rejected';
    order.remark = reason;
    order.processedAt = new Date();
    order.processedBy = req.user._id;
    await order.save();

    // 退还佣金给用户
    const user = order.userId;
    console.log('Rejecting withdraw order:', {
      orderId: order._id,
      orderType: order.type,
      amount: order.amount,
      userId: user._id,
      currentCommission: user.commission
    });

    if (order.type === 'commission') {
      const commissionBefore = user.commission || 0;
      user.commission = (user.commission || 0) + order.amount;
      await user.save();

      console.log('Commission refunded:', {
        before: commissionBefore,
        after: user.commission,
        refundAmount: order.amount
      });

      // 记录退还日志
      await BalanceLog.create({
        userId: user._id,
        type: 'commission_refund',
        currency: 'commission',
        amount: order.amount,
        balanceBefore: commissionBefore,
        balanceAfter: user.commission,
        description: `提现被拒绝，退还佣金：${reason || '无原因'}`,
        orderId: order._id
      });
    } else {
      console.warn('Order type is not commission, skipping refund:', order.type);
    }

    res.json({
      success: true,
      message: '提现申请已拒绝，佣金已退还'
    });
  } catch (error) {
    console.error('Reject withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: '拒绝失败'
    });
  }
});

/**
 * 提现佣金到余额账户
 * POST /api/withdraw/to-balance
 */
router.post('/to-balance', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user._id;

    // 验证金额
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: '请输入有效的提现金额'
      });
    }

    // 获取用户信息
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 计算可用佣金（从 commission 类型的记录）
    const commissionLogs = await BalanceLog.find({
      userId,
      type: 'commission',
      currency: 'commission'
    });
    
    const totalCommission = commissionLogs.reduce((sum, log) => sum + log.amount, 0);
    
    // 计算已提现金额（只计算负数记录，即扣除的佣金）
    const withdrawnLogs = await BalanceLog.find({
      userId,
      type: { $in: ['commission_to_balance', 'commission_withdraw', 'withdraw'] },
      currency: { $in: ['points', 'commission'] },
      amount: { $lt: 0 } // 只查询负数（扣除）记录
    });
    
    // 计算退还金额（正数的退还记录）
    const refundLogs = await BalanceLog.find({
      userId,
      type: { $in: ['refund', 'commission_refund'] },
      currency: 'commission',
      amount: { $gt: 0 }
    });
    
    const totalWithdrawnAmount = withdrawnLogs.reduce((sum, log) => sum + Math.abs(log.amount), 0);
    const totalRefundAmount = refundLogs.reduce((sum, log) => sum + log.amount, 0);
    const totalWithdrawn = totalWithdrawnAmount - totalRefundAmount; // 实际已提现 = 提现总额 - 退还总额
    const availableCommission = totalCommission - totalWithdrawn;

    // 检查余额
    if (amount > availableCommission) {
      return res.status(400).json({
        success: false,
        message: `提现金额超过可用佣金 (可用: ${availableCommission.toFixed(2)})`
      });
    }

    // 转入余额
    const balanceBefore = user.balance;
    user.balance += amount;
    await user.save();

    // 创建提现记录（扣除佣金）
    await BalanceLog.create({
      userId,
      type: 'commission_to_balance',
      currency: 'commission',
      amount: -amount,
      balanceBefore: availableCommission,
      balanceAfter: availableCommission - amount,
      description: '佣金转入余额'
    });

    // 创建余额增加记录
    await BalanceLog.create({
      userId,
      type: 'balance_income',
      currency: 'balance',
      amount: amount,
      balanceBefore: balanceBefore,
      balanceAfter: user.balance,
      description: '佣金转入'
    });

    console.log(`✅ 用户 ${user.username} 提现佣金 ${amount} 到余额`);
    console.log(`   新余额: ${user.balance}, 剩余佣金: ${availableCommission - amount}`);

    const responseData = {
      success: true,
      message: '提现成功',
      data: {
        amount,
        newBalance: user.balance,
        availableCommission: availableCommission - amount
      }
    };
    
    console.log('   返回响应:', JSON.stringify(responseData));
    res.json(responseData);

  } catch (error) {
    console.error('❌ 提现到余额失败:', error);
    res.status(500).json({
      success: false,
      message: '提现失败，请稍后重试'
    });
  }
});

module.exports = router;
