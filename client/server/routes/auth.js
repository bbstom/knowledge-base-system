const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BalanceLog = require('../models/BalanceLog');
const ReferralVisit = require('../models/ReferralVisit');
const { rateLimitMiddleware } = require('../middleware/rateLimit');
const { getClientIP, detectReferralCheat, shouldDelayReferralReward } = require('../utils/antiCheat');

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
router.post('/register', rateLimitMiddleware('register'), async (req, res) => {
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

    // 获取系统配置
    const SystemConfig = require('../models/SystemConfig');
    const config = await SystemConfig.getConfig();
    console.log('📊 系统配置:', {
      registerReward: config.points?.registerReward,
      referralReward: config.points?.referralReward,
      referredUserReward: config.points?.referredUserReward
    });
    
    // 获取注册IP
    const registrationIp = getClientIP(req);
    console.log('📍 注册IP:', registrationIp);

    // 处理推荐人
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        referredBy = referrer._id;
        
        // 反作弊检测
        const cheatCheck = await detectReferralCheat({
          referrerId: referrer._id,
          newUserEmail: email,
          newUserIp: registrationIp
        });
        
        if (!cheatCheck.allowed) {
          console.log(`🚫 反作弊拦截: ${cheatCheck.reason}`);
          return res.status(400).json({
            success: false,
            message: cheatCheck.reason
          });
        }
      }
    }

    // 创建用户（从配置中读取注册奖励积分）
    const registerReward = config.points?.registerReward || 100;
    console.log('🎁 注册奖励积分:', registerReward);
    
    // 如果是被邀请注册，额外获得被推荐用户奖励
    const referredUserReward = referredBy ? (config.points?.referredUserReward || 0) : 0;
    const totalInitialPoints = registerReward + referredUserReward;
    console.log('🎁 被推荐用户额外奖励:', referredUserReward);
    console.log('🎁 用户初始总积分:', totalInitialPoints);
    
    const user = new User({
      username,
      email,
      password: hashedPassword,
      referralCode: userReferralCode,
      referredBy,
      points: totalInitialPoints,
      balance: 0,
      registrationIp: registrationIp
    });

    await user.save();

    // 标记邀请访问为已转化
    if (referralCode) {
      try {
        const fingerprint = req.body.fingerprint;
        const updateQuery = {
          referralCode,
          converted: false
        };

        // 如果有设备指纹，优先匹配设备指纹
        if (fingerprint) {
          updateQuery.$or = [
            { fingerprint },
            { ip: req.ip || req.socket.remoteAddress }
          ];
        } else {
          // 没有设备指纹，只匹配IP
          updateQuery.ip = req.ip || req.socket.remoteAddress;
        }

        const result = await ReferralVisit.updateMany(
          updateQuery,
          {
            $set: {
              converted: true,
              convertedUserId: user._id
            }
          }
        );

        if (result.modifiedCount > 0) {
          console.log(`✅ 标记 ${result.modifiedCount} 条邀请访问记录为已转化`);
        } else {
          console.log('ℹ️ 未找到匹配的邀请访问记录');
        }
      } catch (conversionError) {
        console.error('❌ 标记邀请访问转化失败:', conversionError);
        // 不影响注册流程，只记录错误
      }
    }

    // 创建注册奖励积分记录
    await BalanceLog.create({
      userId: user._id,
      type: 'register',
      currency: 'points',
      amount: registerReward,
      balanceBefore: 0,
      balanceAfter: registerReward,
      description: '注册奖励'
    });
    
    // 如果是被邀请注册，创建被推荐用户奖励记录
    if (referredUserReward > 0) {
      await BalanceLog.create({
        userId: user._id,
        type: 'referral_reward',
        currency: 'points',
        amount: referredUserReward,
        balanceBefore: registerReward,
        balanceAfter: totalInitialPoints,
        description: '被邀请注册奖励',
        relatedUserId: referredBy
      });
      console.log(`✅ 被邀请用户 ${username} 额外获得 ${referredUserReward} 积分奖励`);
    }

    // 如果有推荐人，给推荐人奖励（从配置中读取推荐奖励）
    if (referredBy) {
      const referrer = await User.findById(referredBy);
      if (referrer) {
        const referralReward = config.points?.referralReward || 100;
        console.log('🎁 推荐人奖励积分:', referralReward);
        const pointsBefore = referrer.points;
        referrer.points += referralReward;
        
        // 更新推荐统计
        if (!referrer.referralStats) {
          referrer.referralStats = {
            totalReferrals: 0,
            validReferrals: 0,
            totalEarnings: 0
          };
        }
        referrer.referralStats.totalReferrals += 1;
        referrer.referralStats.validReferrals += 1;
        referrer.referralStats.totalEarnings += referralReward;
        
        // 更新推荐用户计数
        referrer.referralCount = (referrer.referralCount || 0) + 1;
        
        await referrer.save();
        
        // 创建推荐奖励积分记录
        await BalanceLog.create({
          userId: referrer._id,
          type: 'referral_bonus',
          currency: 'points',
          amount: referralReward,
          balanceBefore: pointsBefore,
          balanceAfter: referrer.points,
          description: `推荐用户 ${username} 注册奖励`,
          relatedUserId: user._id
        });
        
        console.log(`✅ 推荐人 ${referrer.username} 获得 ${referralReward} 积分奖励`);
      }
    }

    // 生成token
    const token = generateToken(user._id);

    console.log(`✅ 用户注册成功: ${username} (${email})`);
    
    // 记录活动日志
    try {
      const ActivityLog = require('../models/ActivityLog');
      await ActivityLog.log('user', `新用户注册: ${email}`, user._id);
    } catch (error) {
      console.log('记录活动日志失败:', error.message);
    }

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

    // 从系统配置中获取每日签到积分
    const SystemConfig = require('../models/SystemConfig');
    const config = await SystemConfig.getConfig();
    const dailyPoints = config.points?.dailyCheckIn || 10;

    // 赠送积分
    const pointsBefore = user.points;
    user.points += dailyPoints;
    user.lastDailyClaimAt = new Date();
    await user.save();

    // 创建签到积分记录
    await BalanceLog.create({
      userId: user._id,
      type: 'daily_claim',
      currency: 'points',
      amount: dailyPoints,
      balanceBefore: pointsBefore,
      balanceAfter: user.points,
      description: '每日签到奖励'
    });

    console.log(`✅ 用户 ${user.username} 签到成功，获得 ${dailyPoints} 积分`);

    res.json({
      success: true,
      message: `签到成功，获得 ${dailyPoints} 积分`,
      data: {
        points: user.points,
        pointsEarned: dailyPoints,
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

// 导入滑块验证中间件
const { verifyCaptchaToken } = require('../middleware/captchaVerify');

/**
 * 发送密码重置验证码
 * POST /api/auth/forgot-password/send-code
 */
router.post('/forgot-password/send-code', verifyCaptchaToken, rateLimitMiddleware('send_code'), async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: '请提供邮箱地址'
      });
    }

    // 检查用户是否存在
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '该邮箱未注册'
      });
    }

    // 生成验证码
    const VerificationCode = require('../models/VerificationCode');
    const code = VerificationCode.generateCode();

    // 删除该邮箱之前未使用的验证码
    await VerificationCode.deleteMany({
      email: email.toLowerCase(),
      type: 'password_reset',
      used: false
    });

    // 保存新验证码
    const verificationCode = new VerificationCode({
      email: email.toLowerCase(),
      code,
      type: 'password_reset'
    });
    await verificationCode.save();

    // 发送邮件
    const emailService = require('../services/emailService');
    const emailResult = await emailService.sendVerificationCode(email, code, user.username);

    if (emailResult.success) {
      return res.json({
        success: true,
        message: '验证码已发送到您的邮箱'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: '发送验证码失败，请稍后重试'
      });
    }
  } catch (error) {
    console.error('Send verification code error:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * 验证验证码
 * POST /api/auth/forgot-password/verify-code
 */
router.post('/forgot-password/verify-code', rateLimitMiddleware('verify_code'), async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: '请提供邮箱和验证码'
      });
    }

    // 查找验证码
    const VerificationCode = require('../models/VerificationCode');
    const verificationCode = await VerificationCode.findOne({
      email: email.toLowerCase(),
      type: 'password_reset',
      used: false
    }).sort({ createdAt: -1 });

    if (!verificationCode) {
      return res.status(404).json({
        success: false,
        message: '验证码不存在或已使用'
      });
    }

    // 验证验证码
    const result = verificationCode.verify(code);
    
    // 保存验证结果（verify方法内部已经修改了used和attempts）
    await verificationCode.save();
    
    if (result.success) {
      // 生成一个临时重置token（有效期15分钟）
      const resetToken = jwt.sign(
        { 
          email: email.toLowerCase(),
          type: 'password_reset',
          codeId: verificationCode._id.toString()
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );
      
      return res.json({
        success: true,
        message: '验证成功',
        resetToken
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Verify code error:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * 重置密码
 * POST /api/auth/forgot-password/reset
 */
router.post('/forgot-password/reset', rateLimitMiddleware('reset_password'), async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '请提供完整信息'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: '密码至少6位'
      });
    }

    // 验证重置token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: '重置链接已过期，请重新获取验证码'
      });
    }

    if (decoded.type !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: '无效的重置令牌'
      });
    }

    // 查找用户
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // 发送密码重置成功通知邮件
    const emailService = require('../services/emailService');
    await emailService.sendPasswordResetNotification(decoded.email, user.username);

    return res.json({
      success: true,
      message: '密码重置成功'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

module.exports = router;
