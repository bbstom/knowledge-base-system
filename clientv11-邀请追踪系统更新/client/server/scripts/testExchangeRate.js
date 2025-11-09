/**
 * 测试实时汇率服务
 * 运行: node server/scripts/testExchangeRate.js
 */

const exchangeRateService = require('../services/exchangeRateService');

async function testExchangeRate() {
  console.log('🧪 开始测试实时汇率服务...\n');
  
  try {
    // 测试1: 获取汇率
    console.log('📊 测试1: 获取实时汇率');
    console.log('='.repeat(50));
    const rates1 = await exchangeRateService.getExchangeRates();
    console.log('汇率数据:', rates1);
    console.log('最后更新:', new Date(exchangeRateService.getLastUpdateTime()).toLocaleString('zh-CN'));
    console.log('缓存剩余时间:', exchangeRateService.getCacheRemainingTime(), '秒');
    console.log('✅ 测试1通过\n');
    
    // 测试2: 再次获取（应该使用缓存）
    console.log('📊 测试2: 再次获取汇率（应使用缓存）');
    console.log('='.repeat(50));
    const rates2 = await exchangeRateService.getExchangeRates();
    console.log('汇率数据:', rates2);
    console.log('缓存剩余时间:', exchangeRateService.getCacheRemainingTime(), '秒');
    console.log('✅ 测试2通过\n');
    
    // 测试3: 强制刷新
    console.log('📊 测试3: 强制刷新汇率');
    console.log('='.repeat(50));
    const rates3 = await exchangeRateService.forceRefresh();
    console.log('汇率数据:', rates3);
    console.log('最后更新:', new Date(exchangeRateService.getLastUpdateTime()).toLocaleString('zh-CN'));
    console.log('✅ 测试3通过\n');
    
    // 测试4: 计算示例
    console.log('📊 测试4: 汇率计算示例');
    console.log('='.repeat(50));
    const usdAmount = 100;
    const usdtAmount = usdAmount * rates3.USDT;
    const trxAmount = usdAmount * rates3.TRX;
    console.log(`充值 $${usdAmount} USD:`);
    console.log(`  需支付: ${usdtAmount.toFixed(2)} USDT`);
    console.log(`  需支付: ${trxAmount.toFixed(2)} TRX`);
    console.log('✅ 测试4通过\n');
    
    console.log('🎉 所有测试通过！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error(error);
  }
}

// 运行测试
testExchangeRate();
