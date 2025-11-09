const User = require('../models/User');
const RechargeOrder = require('../models/RechargeOrder');
const BalanceLog = require('../models/BalanceLog');
const bepusdtService = require('./bepusdtService');
const commissionService = require('./commissionService');

class RechargeService {
  /**
   * 创建充值订单
   */
  async createRechargeOrder(userId, orderData) {
    try {
      const { type, amount, currency, points, vipDays, vipPackageName } = orderData;

      console.log('📝 创建充值订单:', { userId, type, amount, currency, points, vipDays });

      // 生成订单ID
      const orderId = `ORDER${Date.now()}${Math.floor(Math.random() * 1000)}`;

      console.log('🔑 订单ID:', orderId);
      console.log('🌐 BEpusdt配置:', {
        url: process.env.BEPUSDT_URL,
        hasApiKey: !!process.env.BEPUSDT_API_KEY,
        merchantId: process.env.BEPUSDT_MERCHANT_ID
      });

      // 创建BEpusdt订单
      const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`;
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      
      const bepusdtOrder = await bepusdtService.createOrder({
        order_id: orderId,
        amount: amount,
        currency: currency,
        notify_url: `${backendUrl}/api/recharge/webhook`,  // ✅ Webhook回调地址
        redirect_url: `${frontendUrl}/dashboard/recharge`  // 支付完成后跳转地址
      });
      
      console.log('🔔 Webhook URL:', `${backendUrl}/api/recharge/webhook`);

      console.log('✅ BEpusdt订单创建成功:', bepusdtOrder);

      if (!bepusdtOrder.success) {
        throw new Error(bepusdtOrder.message || '创建支付订单失败');
      }

      // 保存订单到数据库
      const rechargeOrder = new RechargeOrder({
        userId,
        orderId,
        type,
        amount,  // USD金额
        currencyType: 'USD',  // 标记为USD订单
        actualAmount: bepusdtOrder.actual_amount,  // 加密货币金额
        currency,  // USDT或TRX
        paymentAddress: bepusdtOrder.payment_address,
        status: 'pending',
        points: points || 0,
        vipDays: vipDays || 0,
        vipPackageName: vipPackageName || null,
        expireAt: new Date(Date.now() + bepusdtOrder.expire_time * 1000)
      });

      await rechargeOrder.save();

      return {
        success: true,
        order: {
          orderId: rechargeOrder.orderId,
          amount: rechargeOrder.amount,
          actualAmount: rechargeOrder.actualAmount,
          currency: rechargeOrder.currency,
          paymentAddress: rechargeOrder.paymentAddress,  // ✅ 返回实际收款地址
          expireAt: rechargeOrder.expireAt,
          status: rechargeOrder.status
        }
      };
    } catch (error) {
      console.error('Create recharge order error:', error);
      throw error;
    }
  }

  /**
   * 查询订单状态
   * 注意：BEpusdt不提供主动查询API，主要依赖Webhook回调更新状态
   */
  async queryOrderStatus(orderId) {
    try {
      // 从数据库查询订单
      const order = await RechargeOrder.findOne({ orderId });
      if (!order) {
        throw new Error('订单不存在');
      }

      // 如果订单已完成，直接返回
      if (order.status === 'paid') {
        return {
          success: true,
          order: {
            orderId: order.orderId,
            status: order.status,
            amount: order.amount,
            actualAmount: order.actualAmount,
            currency: order.currency,
            txHash: order.txHash,
            paidAt: order.paidAt
          }
        };
      }

      // 尝试查询BEpusdt订单状态（可能返回null）
      const bepusdtOrder = await bepusdtService.queryOrder(orderId);

      // 如果BEpusdt支持查询且订单已支付，处理支付
      if (bepusdtOrder && bepusdtOrder.status === 'paid' && order.status !== 'paid') {
        await this.processPayment(order, bepusdtOrder);
      }

      // 返回数据库中的订单状态
      // 注意：如果BEpusdt不支持查询，状态将由Webhook回调更新
      return {
        success: true,
        order: {
          orderId: order.orderId,
          status: order.status,
          amount: order.amount,
          actualAmount: order.actualAmount,
          currency: order.currency,
          paymentAddress: order.paymentAddress,
          txHash: order.txHash,
          paidAt: order.paidAt,
          expireAt: order.expireAt
        },
        message: bepusdtOrder === null ? '订单状态将通过支付回调自动更新' : undefined
      };
    } catch (error) {
      console.error('Query order status error:', error);
      throw error;
    }
  }

  /**
   * 处理支付成功
   */
  async processPayment(order, bepusdtOrder) {
    try {
      // 更新订单状态
      order.status = 'paid';
      order.txHash = bepusdtOrder.tx_hash;
      order.blockNumber = bepusdtOrder.block_number;
      order.paidAt = new Date();
      await order.save();

      // 获取用户
      const user = await User.findById(order.userId);
      if (!user) {
        throw new Error('用户不存在');
      }

      // 根据订单类型处理
      if (order.type === 'points') {
        // 积分充值
        await this.processPointsRecharge(user, order);
      } else if (order.type === 'vip') {
        // VIP充值
        await this.processVipRecharge(user, order);
      }

      console.log(`✅ 订单 ${order.orderId} 处理成功`);
    } catch (error) {
      console.error('Process payment error:', error);
      throw error;
    }
  }

  /**
   * 处理积分充值
   */
  async processPointsRecharge(user, order) {
    const pointsBefore = user.points;
    
    // 增加积分
    user.points += order.points;
    user.totalRecharged += order.amount;
    await user.save();

    // 记录积分变动
    await new BalanceLog({
      userId: user._id,
      type: 'recharge',
      currency: 'points',
      amount: order.points,
      balanceBefore: pointsBefore,
      balanceAfter: user.points,
      orderId: order.orderId,
      description: `充值${order.points}积分`
    }).save();

    console.log(`✅ 用户 ${user.username} 充值 ${order.points} 积分成功`);

    // 计算推荐佣金
    try {
      await commissionService.calculateCommission(user, order, 'points');
    } catch (error) {
      console.error('计算佣金失败:', error);
      // 佣金计算失败不影响充值流程
    }
  }

  /**
   * 处理VIP充值
   */
  async processVipRecharge(user, order) {
    const pointsBefore = user.points;

    // 延长VIP时间
    user.extendVip(order.vipDays);
    user.totalRecharged += order.amount;
    await user.save();

    // 记录VIP充值日志
    await new BalanceLog({
      userId: user._id,
      type: 'vip',
      currency: 'points',
      amount: 0,
      balanceBefore: pointsBefore,
      balanceAfter: user.points,
      orderId: order.orderId,
      description: `开通${order.vipPackageName} (${order.vipDays}天)`
    }).save();

    console.log(`✅ 用户 ${user.username} 开通VIP ${order.vipDays}天成功`);

    // 计算推荐佣金
    try {
      await commissionService.calculateCommission(user, order, 'vip');
    } catch (error) {
      console.error('计算佣金失败:', error);
      // 佣金计算失败不影响充值流程
    }
  }

  /**
   * 获取用户充值记录
   */
  async getUserRechargeHistory(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const orders = await RechargeOrder.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await RechargeOrder.countDocuments({ userId });

      return {
        success: true,
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Get user recharge history error:', error);
      throw error;
    }
  }
}

module.exports = new RechargeService();

  /**
   * 添加余额（卡密充值使用）
   */
  async addBalance(userId, amount, options = {}) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('用户不存在');
      }

      // 增加余额
      user.balance += amount;
      await user.save();

      // 记录余额日志
      const balanceLog = new BalanceLog({
        userId,
        type: options.type || 'recharge_card',
        amount,
        balance: user.balance,
        description: options.description || `卡密充值 +$${amount}`,
        metadata: options.metadata || {}
      });
      await balanceLog.save();

      console.log(`✅ 用户 ${userId} 卡密充值成功: +$${amount}`);

      return {
        balance: user.balance,
        amount
      };
    } catch (error) {
      console.error('添加余额失败:', error);
      throw error;
    }
  }

  /**
   * 添加积分（卡密充值使用）
   */
  async addPoints(userId, points, options = {}) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('用户不存在');
      }

      // 增加积分
      user.points += points;
      await user.save();

      // 记录余额日志
      const balanceLog = new BalanceLog({
        userId,
        type: options.type || 'recharge_card',
        amount: 0,
        points,
        balance: user.balance,
        description: options.description || `卡密充值 +${points}积分`,
        metadata: options.metadata || {}
      });
      await balanceLog.save();

      console.log(`✅ 用户 ${userId} 卡密充值成功: +${points}积分`);

      return {
        points: user.points,
        addedPoints: points
      };
    } catch (error) {
      console.error('添加积分失败:', error);
      throw error;
    }
  }

  /**
   * 添加VIP（卡密充值使用）
   */
  async addVIP(userId, days, options = {}) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('用户不存在');
      }

      const now = new Date();
      let newExpireDate;

      if (user.vipExpireDate && user.vipExpireDate > now) {
        // 如果VIP未过期，在现有基础上延长
        newExpireDate = new Date(user.vipExpireDate);
        newExpireDate.setDate(newExpireDate.getDate() + days);
      } else {
        // 如果VIP已过期或没有VIP，从现在开始计算
        newExpireDate = new Date(now);
        newExpireDate.setDate(newExpireDate.getDate() + days);
      }

      user.isVIP = true;
      user.vipExpireDate = newExpireDate;
      await user.save();

      // 记录余额日志
      const balanceLog = new BalanceLog({
        userId,
        type: options.type || 'recharge_card',
        amount: 0,
        balance: user.balance,
        description: options.description || `卡密充值 +${days}天VIP`,
        metadata: options.metadata || {}
      });
      await balanceLog.save();

      console.log(`✅ 用户 ${userId} 卡密充值成功: +${days}天VIP`);

      return {
        isVIP: user.isVIP,
        vipExpireDate: user.vipExpireDate,
        addedDays: days
      };
    } catch (error) {
      console.error('添加VIP失败:', error);
      throw error;
    }
  }
}

module.exports = new RechargeService();
