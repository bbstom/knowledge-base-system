const RateLimit = require('../models/RateLimit');

// 频率限制配置
const RATE_LIMITS = {
  send_code: {
    email: { max: 5, window: 60 * 60 * 1000 }, // 每小时最多5次
    ip: { max: 10, window: 60 * 60 * 1000 }     // 每小时最多10次
  },
  verify_code: {
    email: { max: 10, window: 60 * 60 * 1000 }, // 每小时最多10次
    ip: { max: 20, window: 60 * 60 * 1000 }     // 每小时最多20次
  },
  reset_password: {
    email: { max: 3, window: 24 * 60 * 60 * 1000 }, // 每天最多3次
    ip: { max: 5, window: 24 * 60 * 60 * 1000 }     // 每天最多5次
  },
  referral_track: {
    ip: { max: 10, window: 60 * 1000 }  // 每分钟最多10次
  },
  referral_get_code: {
    ip: { max: 20, window: 60 * 1000 }  // 每分钟最多20次
  }
};

// 获取客户端IP
const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] ||
         req.headers['x-real-ip'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         req.ip;
};

// 频率限制中间件
const rateLimitMiddleware = (action) => {
  return async (req, res, next) => {
    try {
      const email = req.body.email?.toLowerCase();
      const ip = getClientIP(req);

      if (!email && !ip) {
        return res.status(400).json({
          success: false,
          message: '无法识别请求来源'
        });
      }

      const limits = RATE_LIMITS[action];
      if (!limits) {
        return next();
      }

      // 检查邮箱限制
      if (email && limits.email) {
        const emailCheck = await RateLimit.checkLimit(
          email,
          'email',
          action,
          limits.email
        );

        if (!emailCheck.allowed) {
          return res.status(429).json({
            success: false,
            message: emailCheck.message,
            resetIn: emailCheck.resetIn
          });
        }

        // 添加到响应头
        res.setHeader('X-RateLimit-Limit-Email', limits.email.max);
        res.setHeader('X-RateLimit-Remaining-Email', emailCheck.remaining);
      }

      // 检查IP限制
      if (ip && limits.ip) {
        const ipCheck = await RateLimit.checkLimit(
          ip,
          'ip',
          action,
          limits.ip
        );

        if (!ipCheck.allowed) {
          return res.status(429).json({
            success: false,
            message: ipCheck.message,
            resetIn: ipCheck.resetIn
          });
        }

        // 添加到响应头
        res.setHeader('X-RateLimit-Limit-IP', limits.ip.max);
        res.setHeader('X-RateLimit-Remaining-IP', ipCheck.remaining);
      }

      next();
    } catch (error) {
      console.error('Rate limit error:', error);
      // 出错时不阻止请求，但记录日志
      next();
    }
  };
};

// 导出配置和中间件
module.exports = {
  rateLimitMiddleware,
  RATE_LIMITS,
  getClientIP
};
