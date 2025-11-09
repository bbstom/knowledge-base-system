/**
 * 测试充值配置数据流程
 * 
 * 用法: node server/scripts/testRechargeConfig.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { userConnection } = require('../config/database');
const SiteConfig = require('../models/SiteConfig');

async function testRechargeConfig() {
  try {
    console.log('🔍 测试充值配置数据流程...\n');

    // 1. 获取配置
    console.log('1️⃣ 从数据库获取配置...');
    const config = await SiteConfig.getConfig();
    console.log('✅ 配置获取成功');

    // 2. 检查充值套餐
    console.log('\n2️⃣ 检查积分套餐配置...');
    if (config.recharge && config.recharge.packages) {
      console.log(`✅ 找到 ${config.recharge.packages.length} 个积分套餐:`);
      config.recharge.packages.forEach((pkg, index) => {
        console.log(`   ${index + 1}. ${pkg.points} 积分 - $${pkg.amount} (原价: $${pkg.originalAmount || 'N/A'}) - ${pkg.enabled ? '启用' : '禁用'}`);
      });
    } else {
      console.log('⚠️  未找到积分套餐配置');
    }

    // 3. 检查VIP套餐
    console.log('\n3️⃣ 检查VIP套餐配置...');
    if (config.vip && config.vip.packages) {
      console.log(`✅ 找到 ${config.vip.packages.length} 个VIP套餐:`);
      config.vip.packages.forEach((pkg, index) => {
        console.log(`   ${index + 1}. ${pkg.name} (${pkg.days}天) - $${pkg.amount} (原价: $${pkg.originalAmount || 'N/A'}) - ${pkg.enabled ? '启用' : '禁用'}`);
      });
    } else {
      console.log('⚠️  未找到VIP套餐配置');
    }

    // 4. 模拟API返回格式
    console.log('\n4️⃣ 模拟API返回格式...');
    const apiResponse = {
      success: true,
      config: {
        pointsPackages: config.recharge?.packages || [],
        vipPackages: config.vip?.packages || []
      }
    };
    console.log('✅ API返回格式:');
    console.log(JSON.stringify(apiResponse, null, 2));

    // 5. 如果没有配置，创建默认配置
    if (!config.recharge || !config.recharge.packages || config.recharge.packages.length === 0) {
      console.log('\n5️⃣ 创建默认积分套餐配置...');
      config.recharge = {
        bepusdtUrl: '',
        bepusdtApiKey: '',
        bepusdtMerchantId: '',
        supportedCurrencies: ['USDT', 'TRX'],
        packages: [
          { id: '1', points: 100, amount: 1.5, originalAmount: 2, enabled: true },
          { id: '2', points: 500, amount: 7, originalAmount: 9, enabled: true },
          { id: '3', points: 1000, amount: 14, originalAmount: 17, enabled: true },
          { id: '4', points: 2000, amount: 28, originalAmount: 35, enabled: true },
          { id: '5', points: 5000, amount: 70, originalAmount: 90, enabled: true },
          { id: '6', points: 10000, amount: 140, originalAmount: 180, enabled: true }
        ]
      };
      await config.save();
      console.log('✅ 默认积分套餐已创建');
    }

    if (!config.vip || !config.vip.packages || config.vip.packages.length === 0) {
      console.log('\n6️⃣ 创建默认VIP套餐配置...');
      config.vip = {
        packages: [
          { 
            id: '1', 
            name: '月度VIP', 
            days: 30, 
            amount: 4.5,
            originalAmount: 6,
            features: ['无限搜索次数', '专属客服', '优先数据更新', '去除广告'],
            enabled: true 
          },
          { 
            id: '2', 
            name: '季度VIP', 
            days: 90, 
            amount: 12,
            originalAmount: 17,
            features: ['无限搜索次数', '专属客服', '优先数据更新', '去除广告', '赠送500积分'],
            enabled: true 
          },
          { 
            id: '3', 
            name: '年度VIP', 
            days: 365, 
            amount: 42,
            originalAmount: 68,
            features: ['无限搜索次数', '专属客服', '优先数据更新', '去除广告', '赠送2000积分', 'VIP专属标识'],
            enabled: true 
          }
        ]
      };
      await config.save();
      console.log('✅ 默认VIP套餐已创建');
    }

    console.log('\n✅ 测试完成！');
    console.log('\n📝 数据流程说明:');
    console.log('   1. 管理员在后台配置套餐 → 保存到 config.recharge.packages 和 config.vip.packages');
    console.log('   2. 前端调用 /api/site-config/recharge');
    console.log('   3. API 返回 { pointsPackages: [...], vipPackages: [...] }');
    console.log('   4. 前端显示套餐卡片');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await userConnection.close();
    process.exit(0);
  }
}

// 运行测试
testRechargeConfig();
