const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * 生成JWT Token
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

/**
 * 生成推荐码
 */
const generateReferralCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

/**
 * 注册
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, referralCode } = req.body;

    // 验证必填字段
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '请填写所有必填字段'
      });
    }

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? '邮箱已被注册' : '用户名已被使用'
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 生成推荐码
    const userReferralCode = generateReferralCode();

    // 处理推荐人
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        referredBy = referrer._id;
      }
    }

    // 创建用户
    const user = new User({
      username,
      email,
      password: hashedPassword,
      referralCode: userReferralCode,
      referredBy,
      points: 100, // 注册赠送100积分
      balance: 0
    });

    await user.save();

    // 如果有推荐人，给推荐人奖励
    if (referredBy) {
      const referrer = await User.findById(referredBy);
      if (referrer) {
        referrer.points += 50; // 推荐奖励50积分
        await referrer.save();
      }
    }

    // 生成token
    const token = generateToken(user._id);

    console.log(`✅ 用户注册成功: ${username} (${email})`);

    res.json({
      success: true,
      message: '注册成功',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          points: user.points,
          balance: user.balance,
          isVip: user.isVip,
          referralCode: user.referralCode
        }
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: '注册失败，请稍后重试'
    });
  }
});

/**
 * 登录
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 验证必填字段
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '请填写邮箱和密码'
      });
    }

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    // 检查VIP状态
    user.checkVipStatus();
    await user.save();

    // 生成token
    const token = generateToken(user._id);

    console.log(`✅ 用户登录成功: ${user.username}`);

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          points: user.points,
          balance: user.balance,
          isVip: user.isVip,
          vipExpireAt: user.vipExpireAt,
          referralCode: user.referralCode,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试'
    });
  }
});

/**
 * 获取当前用户信息
 * GET /api/auth/me
 */
router.get('/me', async (req, res) => {
  try {
    // 从token获取用户ID
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

    // 检查VIP状态
    user.checkVipStatus();
    await user.save();

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          points: user.points,
          balance: user.balance,
          isVip: user.isVip,
          vipExpireAt: user.vipExpireAt,
          referralCode: user.referralCode,
          role: user.role,
          totalRecharged: user.totalRecharged,
          totalConsumed: user.totalConsumed
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
});

/**
 * 每日签到领取积分
 * POST /api/auth/claim-daily-points
 */
router.post('/claim-daily-points', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未登录'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 检查今天是否已签到
    const today = new Date().toDateString();
    const lastClaim = user.lastDailyClaimAt ? new Date(user.lastDailyClaimAt).toDateString() : null;

    if (lastClaim === today) {
      return res.status(400).json({
        success: false,
        message: '今天已经签到过了'
      });
    }

    // 赠送积分
    const dailyPoints = 10;
    user.points += dailyPoints;
    user.lastDailyClaimAt = new Date();
    await user.save();

    console.log(`✅ 用户 ${user.username} 签到成功，获得 ${dailyPoints} 积分`);

    res.json({
      success: true,
      message: `签到成功，获得 ${dailyPoints} 积分`,
      data: {
        points: user.points,
        dailyPoints
      }
    });
  } catch (error) {
    console.error('Claim daily points error:', error);
    res.status(500).json({
      success: false,
      message: '签到失败'
    });
  }
});

module.exports = router;
