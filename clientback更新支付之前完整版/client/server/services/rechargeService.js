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

      // 生成订单ID
      const orderId = `ORDER${Date.now()}${Math.floor(Math.random() * 1000)}`;

      // 创建BEpusdt订单
      const bepusdtOrder = await bepusdtService.createOrder({
        order_id: orderId,
        amount: amount,
        currency: currency,
        notify_url: `${process.env.FRONTEND_URL}/api/payment/notify`,
        redirect_url: `${process.env.FRONTEND_URL}/dashboard/recharge`
      });

      if (!bepusdtOrder.success) {
        throw new Error(bepusdtOrder.message || '创建支付订单失败');
      }

      // 保存订单到数据库
      const rechargeOrder = new RechargeOrder({
        userId,
        orderId,
        type,
        amount,
        actualAmount: bepusdtOrder.actual_amount,
        currency,
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
          paymentAddress: rechargeOrder.paymentAddress,
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

      // 查询BEpusdt订单状态
      const bepusdtOrder = await bepusdtService.queryOrder(orderId);

      // 更新订单状态
      if (bepusdtOrder.status === 'paid' && order.status !== 'paid') {
        await this.processPayment(order, bepusdtOrder);
      }

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
