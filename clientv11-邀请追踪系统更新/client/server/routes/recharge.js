const express = require('express');
const router = express.Router();
const rechargeService = require('../services/rechargeService');
const bepusdtService = require('../services/bepusdtService');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * 认证中间件
 */
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '认证失败'
    });
  }
};

/**
 * 创建充值订单
 * POST /api/recharge/create
 */
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { type, amount, currency, points, vipDays, vipPackageName } = req.body;

    if (!type || !amount || !currency) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    // 从认证中间件获取用户ID
    const userId = req.user._id;

    console.log('📝 创建充值订单 - 用户ID:', userId);

    const result = await rechargeService.createRechargeOrder(userId, {
      type,
      amount,
      currency,
      points,
      vipDays,
      vipPackageName
    });

    res.json(result);
  } catch (error) {
    console.error('Create recharge order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '创建订单失败'
    });
  }
});

/**
 * 查询订单状态
 * GET /api/recharge/query/:orderId
 */
router.get('/query/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await rechargeService.queryOrderStatus(orderId);
    res.json(result);
  } catch (error) {
    console.error('Query order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '查询订单失败'
    });
  }
});

/**
 * 获取用户充值记录
 * GET /api/recharge/history
 */
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { PAGE_SIZE } = require('../config/pagination');
    const userId = req.user._id;
    const { page = 1, limit = PAGE_SIZE } = req.query;

    console.log('📋 获取充值记录 - 用户ID:', userId);

    const result = await rechargeService.getUserRechargeHistory(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    res.json(result);
  } catch (error) {
    console.error('Get recharge history error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取充值记录失败'
    });
  }
});

/**
 * Webhook通知
 * POST /api/recharge/webhook
 * 
 * BEpusdt支付完成后会调用这个接口通知订单状态
 * 
 * 工作流程:
 * 1. 接收Webhook数据
 * 2. 验证签名（防止伪造请求）
 * 3. 检查支付状态
 * 4. 查找订单
 * 5. 防重复处理
 * 6. 更新订单状态
 * 7. 给用户加积分/VIP
 * 8. 计算推荐人佣金
 * 9. 返回成功响应
 * 
 * 注意事项:
 * - 必须返回'ok'或'fail'，BEpusdt根据响应决定是否重试
 * - 签名验证失败必须返回fail
 * - 已处理的订单返回ok，避免重复处理
 * - 异常情况返回fail，BEpusdt会重试
 */
router.post('/webhook', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const webhookData = req.body;
    const { order_id, status, tx_hash, block_number } = webhookData;
    
    console.log('\n' + '='.repeat(60));
    console.log('📨 收到Webhook通知');
    console.log('='.repeat(60));
    console.log('订单号:', order_id);
    console.log('状态:', status);
    console.log('交易哈希:', tx_hash);
    console.log('区块号:', block_number);
    console.log('完整数据:', JSON.stringify(webhookData, null, 2));
    console.log('='.repeat(60));

    // 1. 验证签名（安全检查）
    const isValid = bepusdtService.verifyWebhookSignature(webhookData);
    if (!isValid) {
      console.error('❌ Webhook签名验证失败');
      console.error('   可能原因:');
      console.error('   - SECRET_KEY配置错误');
      console.error('   - 请求被篡改');
      console.error('   - 签名算法不匹配');
      return res.status(400).send('fail');
    }

    console.log('✅ Webhook签名验证通过');

    // 2. 检查支付状态（status: 2表示已支付）
    if (status === 2 || status === '2') {
      console.log('💰 订单已支付，开始处理:', order_id);
      
      // 3. 查找订单
      const RechargeOrder = require('../models/RechargeOrder');
      const order = await RechargeOrder.findOne({ orderId: order_id });
      
      if (!order) {
        console.error('❌ 订单不存在:', order_id);
        console.error('   可能原因:');
        console.error('   - 订单号错误');
        console.error('   - 订单已被删除');
        console.error('   - 数据库连接问题');
        return res.status(404).send('fail');
      }
      
      console.log('📋 订单信息:');
      console.log('   用户ID:', order.userId);
      console.log('   类型:', order.type);
      console.log('   金额:', order.amount, 'CNY');
      console.log('   实际支付:', order.actualAmount, order.currency);
      console.log('   当前状态:', order.status);
      
      // 4. 防重复处理（幂等性保证）
      if (order.status === 'paid') {
        console.log('⚠️  订单已经处理过，跳过');
        console.log('   处理时间:', order.paidAt);
        console.log('   交易哈希:', order.txHash);
        return res.status(200).send('ok');
      }
      
      // 5. 构造支付数据
      const paymentData = {
        status: 'paid',
        tx_hash: tx_hash || webhookData.transaction_id,
        block_number: block_number
      };
      
      // 6. 处理支付（更新订单、加积分/VIP、计算佣金）
      console.log('🔄 开始处理支付...');
      await rechargeService.processPayment(order, paymentData);
      
      const processingTime = Date.now() - startTime;
      console.log('🎉 订单处理完成!');
      console.log('   订单号:', order_id);
      console.log('   处理耗时:', processingTime, 'ms');
      console.log('='.repeat(60) + '\n');
      
      return res.status(200).send('ok');
    }

    // 7. 其他状态（pending、failed等）
    console.log('ℹ️  订单状态:', status);
    console.log('   0: 待支付');
    console.log('   1: 支付中');
    console.log('   2: 已支付');
    console.log('   3: 已过期');
    console.log('='.repeat(60) + '\n');
    
    res.status(200).send('ok');
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Webhook处理错误');
    console.error('   错误信息:', error.message);
    console.error('   错误堆栈:', error.stack);
    console.error('   处理耗时:', processingTime, 'ms');
    console.error('='.repeat(60) + '\n');
    
    // 返回fail，BEpusdt会重试
    res.status(500).send('fail');
  }
});

module.exports = router;
