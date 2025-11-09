const express = require('express');
const router = express.Router();
const rechargeService = require('../services/rechargeService');
const bepusdtService = require('../services/bepusdtService');

/**
 * 创建充值订单
 * POST /api/recharge/create
 */
router.post('/create', async (req, res) => {
  try {
    const { userId, type, amount, currency, points, vipDays, vipPackageName } = req.body;

    if (!userId || !type || !amount || !currency) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

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
 * GET /api/recharge/history/:userId
 */
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

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
 */
router.post('/webhook', async (req, res) => {
  try {
    const webhookData = req.body;
    console.log('📨 收到Webhook通知:', webhookData);

    // 验证签名
    const isValid = bepusdtService.verifyWebhookSignature(webhookData);
    if (!isValid) {
      console.error('❌ Webhook签名验证失败');
      return res.status(400).send('Invalid signature');
    }

    // 查询并处理订单
    if (webhookData.status === 'paid') {
      await rechargeService.queryOrderStatus(webhookData.order_id);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Error');
  }
});

module.exports = router;
