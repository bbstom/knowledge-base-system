const axios = require('axios');

/**
 * 实时汇率服务
 * 支持从多个数据源获取加密货币实时汇率
 */
class ExchangeRateService {
  constructor() {
    // 汇率缓存
    this.cache = {
      rates: null,
      lastUpdate: null,
      cacheTime: 5 * 60 * 1000 // 5分钟缓存
    };
    
    // 默认汇率（作为后备）
    this.defaultRates = {
      USDT: 1.0,   // USDT是稳定币，1:1锚定美元
      TRX: 6.25    // TRX默认汇率
    };
  }

  /**
   * 获取实时汇率
   * @returns {Promise<Object>} 汇率对象 { USDT: 1.0, TRX: 6.25 }
   */
  async getExchangeRates() {
    try {
      // 检查缓存是否有效
      if (this.isCacheValid()) {
        console.log('📊 使用缓存的汇率数据');
        return this.cache.rates;
      }

      console.log('🔄 获取最新汇率...');
      
      // 尝试从多个数据源获取汇率
      const rates = await this.fetchRatesFromSources();
      
      // 更新缓存
      this.cache.rates = rates;
      this.cache.lastUpdate = Date.now();
      
      console.log('✅ 汇率更新成功:', rates);
      return rates;
      
    } catch (error) {
      console.error('❌ 获取汇率失败:', error.message);
      
      // 如果有缓存，返回缓存（即使过期）
      if (this.cache.rates) {
        console.log('⚠️  使用过期缓存的汇率');
        return this.cache.rates;
      }
      
      // 返回默认汇率
      console.log('⚠️  使用默认汇率');
      return this.defaultRates;
    }
  }

  /**
   * 检查缓存是否有效
   */
  isCacheValid() {
    if (!this.cache.rates || !this.cache.lastUpdate) {
      return false;
    }
    
    const now = Date.now();
    const elapsed = now - this.cache.lastUpdate;
    
    return elapsed < this.cache.cacheTime;
  }

  /**
   * 从多个数据源获取汇率
   */
  async fetchRatesFromSources() {
    const sources = [
      () => this.fetchFromCoinGecko(),
      () => this.fetchFromBinance(),
      () => this.fetchFromCoinMarketCap()
    ];

    // 尝试每个数据源，直到成功
    for (const fetchFn of sources) {
      try {
        const rates = await fetchFn();
        if (rates && rates.TRX) {
          return rates;
        }
      } catch (error) {
        console.log(`数据源失败: ${error.message}`);
        continue;
      }
    }

    throw new Error('所有汇率数据源都失败');
  }

  /**
   * 从 CoinGecko 获取汇率（免费API，无需密钥）
   */
  async fetchFromCoinGecko() {
    try {
      console.log('📡 尝试从 CoinGecko 获取汇率...');
      
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price',
        {
          params: {
            ids: 'tron',
            vs_currencies: 'usd'
          },
          timeout: 5000
        }
      );

      if (response.data && response.data.tron && response.data.tron.usd) {
        const trxPrice = response.data.tron.usd;
        const trxRate = 1 / trxPrice; // 1 USD = ? TRX
        
        console.log('✅ CoinGecko 汇率获取成功');
        return {
          USDT: 1.0,
          TRX: parseFloat(trxRate.toFixed(4))
        };
      }

      throw new Error('CoinGecko 响应格式错误');
    } catch (error) {
      console.error('CoinGecko 获取失败:', error.message);
      throw error;
    }
  }

  /**
   * 从 Binance 获取汇率（免费API）
   */
  async fetchFromBinance() {
    try {
      console.log('📡 尝试从 Binance 获取汇率...');
      
      const response = await axios.get(
        'https://api.binance.com/api/v3/ticker/price',
        {
          params: {
            symbol: 'TRXUSDT'
          },
          timeout: 5000
        }
      );

      if (response.data && response.data.price) {
        const trxPrice = parseFloat(response.data.price);
        const trxRate = 1 / trxPrice; // 1 USD = ? TRX
        
        console.log('✅ Binance 汇率获取成功');
        return {
          USDT: 1.0,
          TRX: parseFloat(trxRate.toFixed(4))
        };
      }

      throw new Error('Binance 响应格式错误');
    } catch (error) {
      console.error('Binance 获取失败:', error.message);
      throw error;
    }
  }

  /**
   * 从 CoinMarketCap 获取汇率（需要API密钥，作为备用）
   */
  async fetchFromCoinMarketCap() {
    // 如果没有配置API密钥，跳过
    if (!process.env.COINMARKETCAP_API_KEY) {
      throw new Error('未配置 CoinMarketCap API 密钥');
    }

    try {
      console.log('📡 尝试从 CoinMarketCap 获取汇率...');
      
      const response = await axios.get(
        'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
        {
          params: {
            symbol: 'TRX',
            convert: 'USD'
          },
          headers: {
            'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY
          },
          timeout: 5000
        }
      );

      if (response.data && response.data.data && response.data.data.TRX) {
        const trxPrice = response.data.data.TRX.quote.USD.price;
        const trxRate = 1 / trxPrice; // 1 USD = ? TRX
        
        console.log('✅ CoinMarketCap 汇率获取成功');
        return {
          USDT: 1.0,
          TRX: parseFloat(trxRate.toFixed(4))
        };
      }

      throw new Error('CoinMarketCap 响应格式错误');
    } catch (error) {
      console.error('CoinMarketCap 获取失败:', error.message);
      throw error;
    }
  }

  /**
   * 强制刷新汇率（清除缓存）
   */
  async forceRefresh() {
    console.log('🔄 强制刷新汇率...');
    this.cache.rates = null;
    this.cache.lastUpdate = null;
    return await this.getExchangeRates();
  }

  /**
   * 获取汇率更新时间
   */
  getLastUpdateTime() {
    return this.cache.lastUpdate;
  }

  /**
   * 获取缓存剩余时间（秒）
   */
  getCacheRemainingTime() {
    if (!this.cache.lastUpdate) {
      return 0;
    }
    
    const elapsed = Date.now() - this.cache.lastUpdate;
    const remaining = this.cache.cacheTime - elapsed;
    
    return Math.max(0, Math.floor(remaining / 1000));
  }
}

module.exports = new ExchangeRateService();
