const RechargeCard = require('../models/RechargeCard');
const crypto = require('crypto');

/**
 * 充值卡密服务
 */
class RechargeCardService {
  /**
   * 生成卡密码
   * 格式: XXXX-XXXX-XXXX-XXXX
   */
  generateCardCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 排除易混淆字符
    let code = '';
    
    for (let i = 0; i < 4; i++) {
      if (i > 0) code += '-';
      for (let j = 0; j < 4; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }
    
    return code;
  }

  /**
   * 批量生成卡密
   */
  async generateCards(params) {
    const {
      type,
      amount = 0,
      points = 0,
      vipDays = 0,
      vipPackageName = '',
      quantity = 1,
      expiresAt = null,
      batchNumber = '',
      note = '',
      createdBy
    } = params;

    const cards = [];
    const codes = new Set();

    // 生成唯一卡密码
    while (codes.size < quantity) {
      const code = this.generateCardCode();
      
      // 检查是否已存在
      const exists = await RechargeCard.findOne({ code });
      if (!exists) {
        codes.add(code);
      }
    }

    // 创建卡密记录
    for (const code of codes) {
      const card = new RechargeCard({
        code,
        type,
        amount,
        points,
        vipDays,
        vipPackageName,
        status: 'unused',
        expiresAt,
        batchNumber: batchNumber || `BATCH-${Date.now()}`,
        note,
        createdBy
      });

      cards.push(card);
    }

    // 批量保存
    await RechargeCard.insertMany(cards);

    return cards;
  }

  /**
   * 使用卡密
   */
  async useCard(code, userId) {
    // 查找卡密
    const card = await RechargeCard.findOne({ 
      code: code.toUpperCase().trim() 
    });

    if (!card) {
      throw new Error('卡密不存在');
    }

    // 检查状态
    if (card.status === 'used') {
      throw new Error('卡密已被使用');
    }

    if (card.status === 'expired') {
      throw new Error('卡密已过期');
    }

    if (card.status === 'disabled') {
      throw new Error('卡密已被禁用');
    }

    // 检查是否过期
    if (card.isExpired()) {
      card.status = 'expired';
      await card.save();
      throw new Error('卡密已过期');
    }

    // 标记为已使用
    card.status = 'used';
    card.usedBy = userId;
    card.usedAt = new Date();
    await card.save();

    return card;
  }

  /**
   * 查询卡密列表
   */
  async getCards(filters = {}, options = {}) {
    const {
      type,
      status,
      batchNumber,
      search
    } = filters;

    const {
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = options;

    const query = {};

    if (type) query.type = type;
    if (status) query.status = status;
    if (batchNumber) query.batchNumber = batchNumber;
    if (search) {
      query.$or = [
        { code: new RegExp(search, 'i') },
        { note: new RegExp(search, 'i') }
      ];
    }

    const total = await RechargeCard.countDocuments(query);
    const cards = await RechargeCard.find(query)
      .populate('usedBy', 'username email')
      .populate('createdBy', 'username')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      cards,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  /**
   * 获取卡密详情
   */
  async getCardById(id) {
    const card = await RechargeCard.findById(id)
      .populate('usedBy', 'username email')
      .populate('createdBy', 'username');
    
    if (!card) {
      throw new Error('卡密不存在');
    }

    return card;
  }

  /**
   * 更新卡密
   */
  async updateCard(id, updates) {
    const card = await RechargeCard.findById(id);
    
    if (!card) {
      throw new Error('卡密不存在');
    }

    // 只允许更新某些字段
    const allowedUpdates = ['status', 'expiresAt', 'note'];
    
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        card[key] = updates[key];
      }
    }

    await card.save();
    return card;
  }

  /**
   * 删除卡密
   */
  async deleteCard(id) {
    const card = await RechargeCard.findById(id);
    
    if (!card) {
      throw new Error('卡密不存在');
    }

    if (card.status === 'used') {
      throw new Error('已使用的卡密不能删除');
    }

    await card.deleteOne();
    return true;
  }

  /**
   * 批量删除卡密
   */
  async deleteCards(ids) {
    // 只删除未使用的卡密
    const result = await RechargeCard.deleteMany({
      _id: { $in: ids },
      status: { $ne: 'used' }
    });

    return result.deletedCount;
  }

  /**
   * 获取统计信息
   */
  async getStatistics() {
    const total = await RechargeCard.countDocuments();
    const unused = await RechargeCard.countDocuments({ status: 'unused' });
    const used = await RechargeCard.countDocuments({ status: 'used' });
    const expired = await RechargeCard.countDocuments({ status: 'expired' });
    const disabled = await RechargeCard.countDocuments({ status: 'disabled' });

    // 按类型统计
    const byType = await RechargeCard.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalPoints: { $sum: '$points' }
        }
      }
    ]);

    return {
      total,
      unused,
      used,
      expired,
      disabled,
      byType
    };
  }

  /**
   * 导出卡密（用于批量生成后导出）
   */
  async exportCards(batchNumber) {
    const cards = await RechargeCard.find({ batchNumber })
      .select('code type amount points vipDays vipPackageName status expiresAt note')
      .sort('createdAt');

    return cards;
  }
}

module.exports = new RechargeCardService();
