const axios = require('axios');
const crypto = require('crypto');

class BEpusdtService {
  constructor() {
    this.baseUrl = process.env.BEPUSDT_URL;
    this.apiKey = process.env.BEPUSDT_API_KEY;
    this.merchantId = process.env.BEPUSDT_MERCHANT_ID;
    this.secretKey = process.env.BEPUSDT_SECRET_KEY;
  }

  /**
   * 创建支付订单
   */
  async createOrder(params) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v1/order/create-transaction`,
        {
          ...params,
          merchant_id: this.merchantId
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('BEpusdt createOrder error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || '创建订单失败');
    }
  }

  /**
   * 查询订单状态
   */
  async queryOrder(orderId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v1/order/query-order-info`,
        {
          params: { order_id: orderId },
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('BEpusdt queryOrder error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || '查询订单失败');
    }
  }

  /**
   * 验证Webhook签名
   */
  verifyWebhookSignature(data) {
    try {
      const signString = `${data.order_id}${data.amount}${data.actual_amount}${data.currency}${data.status}${this.secretKey}`;
      const expectedSign = crypto.createHash('md5').update(signString).digest('hex');
      return data.sign === expectedSign;
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  /**
   * 获取支持的币种
   */
  async getSupportedCurrencies() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v1/supported-currencies`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      return response.data.currencies || ['USDT', 'TRX'];
    } catch (error) {
      console.error('Get supported currencies error:', error);
      return ['USDT', 'TRX'];
    }
  }

  /**
   * 获取实时汇率
   */
  async getExchangeRates() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v1/exchange-rates`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      return response.data.rates || { USDT: 7.2, TRX: 0.8 };
    } catch (error) {
      console.error('Get exchange rates error:', error);
      return { USDT: 7.2, TRX: 0.8 };
    }
  }
}

module.exports = new BEpusdtService();
