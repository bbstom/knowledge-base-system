/**
 * 订单清理服务 - 自动将超时订单标记为过期
 */

const RechargeOrder = require('../models/RechargeOrder');

class OrderCleanupService {
  constructor() {
    this.cleanupInterval = null;
  }

  /**
   * 启动定时清理任务
   */
  start() {
    // 每5分钟检查一次
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredOrders();
    }, 5 * 60 * 1000);

    // 延迟5秒后执行第一次（等待数据库连接完成）
    setTimeout(() => {
      this.cleanupExpiredOrders();
    }, 5000);

    console.log('✅ 订单清理服务已启动');
  }

  /**
   * 停止定时清理任务
   */
  stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('⏹️  订单清理服务已停止');
    }
  }

  /**
   * 清理过期订单
   */
  async cleanupExpiredOrders() {
    try {
      // 检查数据库连接状态
      const { dbManager } = require('../config/database');
      const userConn = dbManager.getUserConnection();
      
      if (!userConn || userConn.readyState !== 1) {
        console.log('⏳ 数据库未连接，跳过订单清理');
        return;
      }

      const now = new Date();

      // 查找所有pending状态且已过期的订单
      const expiredOrders = await RechargeOrder.find({
        status: 'pending',
        expireAt: { $lt: now }
      });

      if (expiredOrders.length === 0) {
        return;
      }

      console.log(`🧹 发现 ${expiredOrders.length} 个过期订单，开始清理...`);

      // 批量更新为expired状态
      const result = await RechargeOrder.updateMany(
        {
          status: 'pending',
          expireAt: { $lt: now }
        },
        {
          $set: { status: 'expired' }
        }
      );

      console.log(`✅ 已将 ${result.modifiedCount} 个订单标记为过期`);
    } catch (error) {
      console.error('❌ 清理过期订单失败:', error);
    }
  }
}

module.exports = new OrderCleanupService();
