const express = require('express');
const router = express.Router();
const exchangeRateService = require('../services/exchangeRateService');

/**
 * 获取实时汇率
 * GET /api/exchange-rate
 */
router.get('/', async (req, res) => {
  try {
    const rates = await exchangeRateService.getExchangeRates();
    const lastUpdate = exchangeRateService.getLastUpdateTime();
    const cacheRemaining = exchangeRateService.getCacheRemainingTime();
    
    res.json({
      success: true,
      rates,
      lastUpdate: lastUpdate ? new Date(lastUpdate).toISOString() : null,
      cacheRemaining,
      message: '汇率获取成功'
    });
  } catch (error) {
    console.error('获取汇率失败:', error);
    res.status(500).json({
      success: false,
      message: '获取汇率失败',
      error: error.message
    });
  }
});

/**
 * 强制刷新汇率
 * POST /api/exchange-rate/refresh
 */
router.post('/refresh', async (req, res) => {
  try {
    const rates = await exchangeRateService.forceRefresh();
    const lastUpdate = exchangeRateService.getLastUpdateTime();
    
    res.json({
      success: true,
      rates,
      lastUpdate: lastUpdate ? new Date(lastUpdate).toISOString() : null,
      message: '汇率刷新成功'
    });
  } catch (error) {
    console.error('刷新汇率失败:', error);
    res.status(500).json({
      success: false,
      message: '刷新汇率失败',
      error: error.message
    });
  }
});

module.exports = router;
