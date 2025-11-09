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
    const minWithdrawAmount = config.points.minWithdrawAmount || 50;
    const withdrawFee = config.points.withdrawFee || 5;

    // 检查最低提现金额
    if (amount < minWithdrawAmount) {
      return res.status(400).json({
        success: false,
        message: `最低提现金额为 ${minWithdrawAmount} 元`,
        code: 'BELOW_MIN_AMOUNT',
        data: {
          minAmount: minWithdrawAmount,
          currentAmount: amount
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
 * 获取提现记录
 * GET /api/withdraw/history
 */
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
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

module.exports = router;
