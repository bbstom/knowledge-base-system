/**
 * 反作弊检测工具
 * 防止用户通过邀请码刷积分
 */

const User = require('../models/User');
const BalanceLog = require('../models/BalanceLog');

/**
 * 获取客户端IP
 */
const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] ||
         req.headers['x-real-ip'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         req.ip;
};

/**
 * 检测邀请码作弊
 * @param {Object} params - 检测参数
 * @param {String} params.referrerId - 推荐人ID
 * @param {String} params.newUserEmail - 新用户邮箱
 * @param {String} params.newUserIp - 新用户IP
 * @param {Object} req - 请求对象
 * @returns {Object} { allowed: boolean, reason: string }
 */
async function detectReferralCheat(params) {
  const { referrerId, newUserEmail, newUserIp } = params;
  
  if (!referrerId) {
    return { allowed: true };
  }

  const referrer = await User.findById(referrerId);
  if (!referrer) {
    return { allowed: true };
  }

  // 1. 检查同一IP的注册数量（24小时内）
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const sameIpUsers = await User.countDocuments({
    registrationIp: newUserIp,
    referredBy: referrerId,
    createdAt: { $gte: oneDayAgo }
  });

  if (sameIpUsers >= 2) {
    console.log(`🚫 反作弊: 同一IP (${newUserIp}) 24小时内已注册 ${sameIpUsers} 个账户`);
    return { 
      allowed: false, 
      reason: '检测到异常注册行为，请稍后再试' 
    };
  }

  // 2. 检查推荐人的注册IP是否与新用户相同（防止自己推荐自己）
  if (referrer.registrationIp && referrer.registrationIp === newUserIp) {
    console.log(`🚫 反作弊: 推荐人 (${referrer.email}) 和新用户使用相同IP (${newUserIp})`);
    console.log(`   推荐人IP: ${referrer.registrationIp}, 新用户IP: ${newUserIp}`);
    return { 
      allowed: false, 
      reason: '检测到异常注册行为，无法使用该邀请码（同IP限制）' 
    };
  }

  // 3. 推荐频率限制已移除 - 允许正常推广

  // 4. 检查邮箱模式（防止批量注册相似邮箱）
  const emailPrefix = newUserEmail.split('@')[0];
  const emailDomain = newUserEmail.split('@')[1];
  
  // 检查是否有相似的邮箱前缀（如 test1, test2, test3）
  const basePrefix = emailPrefix.replace(/\d+$/, ''); // 移除末尾数字
  if (basePrefix.length >= 3) {
    const similarEmails = await User.countDocuments({
      email: new RegExp(`^${basePrefix}\\d*@${emailDomain}`, 'i'),
      referredBy: referrerId,
      createdAt: { $gte: oneDayAgo }
    });

    if (similarEmails >= 1) {
      console.log(`🚫 反作弊: 检测到相似邮箱模式 ${basePrefix}*@${emailDomain}，已有 ${similarEmails} 个相似账户`);
      return { 
        allowed: false, 
        reason: '检测到异常注册行为，请使用真实邮箱' 
      };
    }
  }

  // 5. 推荐总数限制已移除 - 允许正常推广

  // 6. 检查是否是临时邮箱（可选）
  const tempEmailDomains = [
    'tempmail.com', 'guerrillamail.com', '10minutemail.com',
    'throwaway.email', 'mailinator.com', 'trashmail.com'
  ];
  
  if (tempEmailDomains.includes(emailDomain.toLowerCase())) {
    console.log(`🚫 反作弊: 检测到临时邮箱 ${emailDomain}`);
    return { 
      allowed: false, 
      reason: '请使用真实邮箱注册' 
    };
  }

  // 通过所有检测
  console.log(`✅ 反作弊检测通过: 推荐人 ${referrer.username}, 新用户 ${newUserEmail}`);
  return { allowed: true };
}

/**
 * 检测推荐奖励是否应该延迟发放
 * @param {String} referrerId - 推荐人ID
 * @param {String} newUserId - 新用户ID
 * @returns {Object} { shouldDelay: boolean, reason: string }
 */
async function shouldDelayReferralReward(referrerId, newUserId) {
  const referrer = await User.findById(referrerId);
  const newUser = await User.findById(newUserId);
  
  if (!referrer || !newUser) {
    return { shouldDelay: false };
  }

  // 如果新用户和推荐人IP相同，延迟发放奖励
  if (referrer.registrationIp === newUser.registrationIp) {
    return { 
      shouldDelay: true, 
      reason: '相同IP，需要新用户完成首次充值后发放' 
    };
  }

  // 推荐频率限制已移除，立即发放奖励
  return { shouldDelay: false };
}

/**
 * 标记可疑用户
 * @param {String} userId - 用户ID
 * @param {String} reason - 原因
 */
async function markSuspiciousUser(userId, reason) {
  try {
    await User.findByIdAndUpdate(userId, {
      $set: {
        'security.suspicious': true,
        'security.suspiciousReason': reason,
        'security.suspiciousAt': new Date()
      }
    });
    console.log(`⚠️ 标记可疑用户: ${userId}, 原因: ${reason}`);
  } catch (error) {
    console.error('标记可疑用户失败:', error);
  }
}

module.exports = {
  getClientIP,
  detectReferralCheat,
  shouldDelayReferralReward,
  markSuspiciousUser
};
