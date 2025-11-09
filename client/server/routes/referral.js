const express = require('express');
const router = express.Router();
const ReferralVisit = require('../models/ReferralVisit');
const User = require('../models/User');
const { rateLimitMiddleware } = require('../middleware/rateLimit');

/**
 * 记录邀请访问
 * POST /api/referral/track
 * 速率限制：每分钟10次（按IP）
 */
router.post('/track', rateLimitMiddleware('referral_track'), async (req, res) => {
  try {
    const { referralCode, fingerprint } = req.body;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // 参数验证
    if (!referralCode || !fingerprint) {
      console.warn('[Referral] Missing parameters:', { referralCode: !!referralCode, fingerprint: !!fingerprint });
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    // 验证邀请码格式
    if (typeof referralCode !== 'string' || referralCode.length > 20) {
      console.warn('[Referral] Invalid referral code format:', referralCode);
      return res.status(400).json({
        success: false,
        message: '邀请码格式无效'
      });
    }

    // 验证设备指纹格式
    if (typeof fingerprint !== 'string' || fingerprint.length > 100) {
      console.warn('[Referral] Invalid fingerprint format');
      return res.status(400).json({
        success: false,
        message: '设备指纹格式无效'
      });
    }

    // 验证邀请码是否存在（带重试）
    let referrer;
    let retries = 3;
    while (retries > 0) {
      try {
        referrer = await User.findOne({ referralCode }).lean();
        break;
      } catch (dbError) {
        retries--;
        if (retries === 0) throw dbError;
        console.warn('[Referral] Database query retry:', retries);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    if (!referrer) {
      console.warn('[Referral] Referral code not found:', referralCode);
      return res.status(404).json({
        success: false,
        message: '邀请码不存在'
      });
    }

    // 查找或创建访问记录
    let visit = await ReferralVisit.findOne({
      fingerprint,
      referralCode,
      converted: false
    });

    if (visit) {
      // 更新现有记录
      visit.lastVisit = new Date();
      visit.visitCount += 1;
      visit.ip = ip; // 更新最新IP
      visit.userAgent = userAgent;
      await visit.save();
      console.log('[Referral] Visit updated:', { referralCode, fingerprint: fingerprint.substring(0, 8) + '...', visitCount: visit.visitCount });
    } else {
      // 创建新记录
      visit = new ReferralVisit({
        referralCode,
        fingerprint,
        ip,
        userAgent
      });
      await visit.save();
      console.log('[Referral] New visit created:', { referralCode, fingerprint: fingerprint.substring(0, 8) + '...' });
    }

    res.json({
      success: true,
      message: '访问记录已保存'
    });
  } catch (error) {
    console.error('[Referral] Track visit error:', error);
    res.status(500).json({
      success: false,
      message: '记录失败，请稍后重试'
    });
  }
});

/**
 * 获取邀请码（用于注册时）
 * POST /api/referral/get-code
 * 速率限制：每分钟20次（按IP）
 */
router.post('/get-code', rateLimitMiddleware('referral_get_code'), async (req, res) => {
  try {
    const { fingerprint } = req.body;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    if (!fingerprint) {
      console.log('[Referral] No fingerprint provided');
      return res.json({
        success: true,
        referralCode: null
      });
    }

    // 验证设备指纹格式
    if (typeof fingerprint !== 'string' || fingerprint.length > 100) {
      console.warn('[Referral] Invalid fingerprint format in get-code');
      return res.json({
        success: true,
        referralCode: null
      });
    }

    // 优先按指纹查找（带重试）
    let visit;
    let retries = 3;
    while (retries > 0) {
      try {
        visit = await ReferralVisit.findOne({
          fingerprint,
          converted: false,
          expiresAt: { $gt: new Date() }
        })
        .sort({ lastVisit: -1 })
        .select('referralCode')
        .lean();
        break;
      } catch (dbError) {
        retries--;
        if (retries === 0) throw dbError;
        console.warn('[Referral] Database query retry in get-code:', retries);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // 如果指纹没找到，尝试按IP查找（降级方案）
    if (!visit && ip !== 'unknown') {
      console.log('[Referral] Fingerprint not found, trying IP fallback');
      visit = await ReferralVisit.findOne({
        ip,
        converted: false,
        expiresAt: { $gt: new Date() }
      })
      .sort({ lastVisit: -1 })
      .select('referralCode')
      .lean();
    }

    if (visit) {
      console.log('[Referral] Code found:', visit.referralCode);
    } else {
      console.log('[Referral] No code found for fingerprint/IP');
    }

    res.json({
      success: true,
      referralCode: visit ? visit.referralCode : null
    });
  } catch (error) {
    console.error('[Referral] Get code error:', error);
    // 即使出错也返回成功，只是没有邀请码
    res.json({
      success: true,
      referralCode: null
    });
  }
});

module.exports = router;
