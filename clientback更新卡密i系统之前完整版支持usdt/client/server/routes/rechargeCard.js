const express = require('express');
const router = express.Router();
const rechargeCardService = require('../services/rechargeCardService');
const rechargeService = require('../services/rechargeService');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

/**
 * 用户使用卡密充值
 * POST /api/recharge-card/use
 */
router.post('/use', authMiddleware, async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.userId;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: '请输入卡密'
      });
    }

    // 使用卡密
    const card = await rechargeCardService.useCard(code, userId);

    // 根据卡密类型处理充值
    let result;
    switch (card.type) {
      case 'balance':
        result = await rechargeService.addBalance(userId, card.amount, {
          type: 'recharge_card',
          description: `卡密充值 - ${card.code}`,
          metadata: { cardId: card._id }
        });
        break;

      case 'points':
        result = await rechargeService.addPoints(userId, card.points, {
          type: 'recharge_card',
          description: `卡密充值 - ${card.code}`,
          metadata: { cardId: card._id }
        });
        break;

      case 'vip':
        result = await rechargeService.addVIP(userId, card.vipDays, {
          type: 'recharge_card',
          description: `卡密充值 - ${card.vipPackageName || `${card.vipDays}天VIP`}`,
          metadata: { cardId: card._id }
        });
        break;

      default:
        throw new Error('未知的卡密类型');
    }

    res.json({
      success: true,
      message: '卡密使用成功',
      card: {
        type: card.type,
        amount: card.amount,
        points: card.points,
        vipDays: card.vipDays,
        vipPackageName: card.vipPackageName
      },
      result
    });

  } catch (error) {
    console.error('使用卡密失败:', error);
    res.status(400).json({
      success: false,
      message: error.message || '使用卡密失败'
    });
  }
});

/**
 * 验证卡密（不使用，只查询信息）
 * POST /api/recharge-card/verify
 */
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: '请输入卡密'
      });
    }

    const card = await rechargeCardService.getCards({ 
      search: code.toUpperCase().trim() 
    });

    if (!card.cards || card.cards.length === 0) {
      return res.status(404).json({
        success: false,
        message: '卡密不存在'
      });
    }

    const cardInfo = card.cards[0];

    // 检查状态
    if (cardInfo.status === 'used') {
      return res.json({
        success: false,
        message: '卡密已被使用',
        card: {
          status: 'used',
          usedAt: cardInfo.usedAt
        }
      });
    }

    if (cardInfo.status === 'expired' || cardInfo.isExpired()) {
      return res.json({
        success: false,
        message: '卡密已过期',
        card: {
          status: 'expired',
          expiresAt: cardInfo.expiresAt
        }
      });
    }

    if (cardInfo.status === 'disabled') {
      return res.json({
        success: false,
        message: '卡密已被禁用',
        card: {
          status: 'disabled'
        }
      });
    }

    // 返回卡密信息
    res.json({
      success: true,
      message: '卡密有效',
      card: {
        type: cardInfo.type,
        amount: cardInfo.amount,
        points: cardInfo.points,
        vipDays: cardInfo.vipDays,
        vipPackageName: cardInfo.vipPackageName,
        expiresAt: cardInfo.expiresAt,
        status: 'valid'
      }
    });

  } catch (error) {
    console.error('验证卡密失败:', error);
    res.status(500).json({
      success: false,
      message: '验证卡密失败'
    });
  }
});

// ==================== 管理员接口 ====================

/**
 * 生成卡密
 * POST /api/recharge-card/admin/generate
 */
router.post('/admin/generate', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      type,
      amount,
      points,
      vipDays,
      vipPackageName,
      quantity,
      expiresAt,
      note
    } = req.body;

    // 验证参数
    if (!type || !['balance', 'points', 'vip'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: '请选择卡密类型'
      });
    }

    if (!quantity || quantity < 1 || quantity > 1000) {
      return res.status(400).json({
        success: false,
        message: '生成数量必须在1-1000之间'
      });
    }

    // 根据类型验证必需参数
    if (type === 'balance' && (!amount || amount <= 0)) {
      return res.status(400).json({
        success: false,
        message: '请输入充值金额'
      });
    }

    if (type === 'points' && (!points || points <= 0)) {
      return res.status(400).json({
        success: false,
        message: '请输入积分数量'
      });
    }

    if (type === 'vip' && (!vipDays || vipDays <= 0)) {
      return res.status(400).json({
        success: false,
        message: '请输入VIP天数'
      });
    }

    // 生成卡密
    const cards = await rechargeCardService.generateCards({
      type,
      amount: type === 'balance' ? amount : 0,
      points: type === 'points' ? points : 0,
      vipDays: type === 'vip' ? vipDays : 0,
      vipPackageName: type === 'vip' ? vipPackageName : '',
      quantity,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      note,
      createdBy: req.user.userId
    });

    res.json({
      success: true,
      message: `成功生成${cards.length}张卡密`,
      cards: cards.map(card => ({
        id: card._id,
        code: card.code,
        type: card.type,
        amount: card.amount,
        points: card.points,
        vipDays: card.vipDays,
        vipPackageName: card.vipPackageName,
        batchNumber: card.batchNumber,
        expiresAt: card.expiresAt
      })),
      batchNumber: cards[0].batchNumber
    });

  } catch (error) {
    console.error('生成卡密失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '生成卡密失败'
    });
  }
});

/**
 * 获取卡密列表
 * GET /api/recharge-card/admin/list
 */
router.get('/admin/list', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      type,
      status,
      batchNumber,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const result = await rechargeCardService.getCards(
      { type, status, batchNumber, search },
      { page: parseInt(page), limit: parseInt(limit) }
    );

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('获取卡密列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取卡密列表失败'
    });
  }
});

/**
 * 获取卡密详情
 * GET /api/recharge-card/admin/:id
 */
router.get('/admin/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const card = await rechargeCardService.getCardById(req.params.id);

    res.json({
      success: true,
      card
    });

  } catch (error) {
    console.error('获取卡密详情失败:', error);
    res.status(404).json({
      success: false,
      message: error.message || '获取卡密详情失败'
    });
  }
});

/**
 * 更新卡密
 * PUT /api/recharge-card/admin/:id
 */
router.put('/admin/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, expiresAt, note } = req.body;

    const card = await rechargeCardService.updateCard(req.params.id, {
      status,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      note
    });

    res.json({
      success: true,
      message: '更新成功',
      card
    });

  } catch (error) {
    console.error('更新卡密失败:', error);
    res.status(400).json({
      success: false,
      message: error.message || '更新卡密失败'
    });
  }
});

/**
 * 删除卡密
 * DELETE /api/recharge-card/admin/:id
 */
router.delete('/admin/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await rechargeCardService.deleteCard(req.params.id);

    res.json({
      success: true,
      message: '删除成功'
    });

  } catch (error) {
    console.error('删除卡密失败:', error);
    res.status(400).json({
      success: false,
      message: error.message || '删除卡密失败'
    });
  }
});

/**
 * 批量删除卡密
 * POST /api/recharge-card/admin/batch-delete
 */
router.post('/admin/batch-delete', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请选择要删除的卡密'
      });
    }

    const deletedCount = await rechargeCardService.deleteCards(ids);

    res.json({
      success: true,
      message: `成功删除${deletedCount}张卡密`,
      deletedCount
    });

  } catch (error) {
    console.error('批量删除卡密失败:', error);
    res.status(500).json({
      success: false,
      message: '批量删除卡密失败'
    });
  }
});

/**
 * 获取统计信息
 * GET /api/recharge-card/admin/statistics
 */
router.get('/admin/statistics', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const statistics = await rechargeCardService.getStatistics();

    res.json({
      success: true,
      statistics
    });

  } catch (error) {
    console.error('获取统计信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计信息失败'
    });
  }
});

/**
 * 导出卡密
 * GET /api/recharge-card/admin/export/:batchNumber
 */
router.get('/admin/export/:batchNumber', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const cards = await rechargeCardService.exportCards(req.params.batchNumber);

    res.json({
      success: true,
      cards
    });

  } catch (error) {
    console.error('导出卡密失败:', error);
    res.status(500).json({
      success: false,
      message: '导出卡密失败'
    });
  }
});

module.exports = router;
