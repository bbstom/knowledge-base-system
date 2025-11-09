/**
 * 滑块验证中间件
 */

// 验证滑块captcha token
const verifyCaptchaToken = (req, res, next) => {
  const { captchaToken } = req.body;

  // 如果没有token，跳过验证（向后兼容）
  if (!captchaToken) {
    return next();
  }

  try {
    // 解码token
    const decoded = JSON.parse(Buffer.from(captchaToken, 'base64').toString());
    
    const { position, target, time, timestamp } = decoded;

    // 验证条件
    const now = Date.now();
    const tokenAge = now - timestamp;
    const distance = Math.abs(position - target);

    // 1. Token不能过期（5分钟内有效）
    if (tokenAge > 5 * 60 * 1000) {
      return res.status(400).json({
        success: false,
        message: '验证已过期，请重新验证'
      });
    }

    // 2. 位置必须在误差范围内（5像素）
    if (distance > 5) {
      return res.status(400).json({
        success: false,
        message: '验证失败，请重新验证'
      });
    }

    // 3. 时间必须合理（300ms - 10s）
    if (time < 300 || time > 10000) {
      return res.status(400).json({
        success: false,
        message: '验证失败，请重新验证'
      });
    }

    // 验证通过
    next();
  } catch (error) {
    console.error('Captcha verification error:', error);
    return res.status(400).json({
      success: false,
      message: '验证失败，请重新验证'
    });
  }
};

module.exports = {
  verifyCaptchaToken
};
