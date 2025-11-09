const axios = require('axios');
const crypto = require('crypto');

class BEpusdtService {
  constructor() {
    this.baseUrl = process.env.BEPUSDT_URL;
    this.apiKey = process.env.BEPUSDT_API_KEY;
    this.merchantId = process.env.BEPUSDT_MERCHANT_ID;
    this.secretKey = process.env.BEPUSDT_SECRET_KEY;
    this.testMode = process.env.BEPUSDT_TEST_MODE === 'true';
    
    if (this.testMode) {
      console.log('⚠️  BEpusdt运行在测试模式');
    }
  }

  /**
   * 生成签名 - 完全按照工作代码实现
   */
  generateSignature(params) {
    // 过滤并排序参数
    const sortedParams = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    
    // 拼接key
    const stringToSign = sortedParams + this.secretKey;
    
    // 生成MD5签名并转小写
    const signature = crypto.createHash('md5')
      .update(stringToSign)
      .digest('hex')
      .toLowerCase();
    
    console.log('🔐 生成签名:', {
      sortedParams,
      stringToSign: sortedParams + '***',
      signature
    });
    
    return signature;
  }

  /**
   * 创建支付订单
   */
  async createOrder(params) {
    // 测试模式：返回模拟数据
    if (this.testMode) {
      console.log('🧪 测试模式：返回模拟订单');
      return {
        success: true,
        order_id: params.order_id,
        payment_address: 'TTest123MockAddressForTesting456789',
        actual_amount: params.amount,
        currency: params.currency,
        expire_time: 1800, // 30分钟
        status: 'pending'
      };
    }

    try {
      // 确定trade_type
      let tradeType = 'usdt.trc20'; // 默认USDT
      if (params.currency === 'TRX') {
        tradeType = 'tron.trx';
      }
      
      // 构建请求数据 - 完全按照PHP源码
      const requestData = {
        address: '',  // 留空让BEpusdt自动分配
        trade_type: tradeType,
        order_id: params.order_id,
        name: `充值订单-${params.order_id}`,  // ✅ 添加name参数
        timeout: 1800,
        rate: '',  // 留空使用默认汇率
        amount: params.amount.toFixed(2),
        notify_url: params.notify_url,
        redirect_url: params.redirect_url
      };
      
      // 生成签名
      const signature = this.generateSignature(requestData);
      requestData.signature = signature;

      console.log('🚀 调用BEpusdt API:', {
        url: `${this.baseUrl}/api/v1/order/create-transaction`,
        params: { ...requestData, signature: '***' },
        trade_type: tradeType
      });

      const response = await axios.post(
        `${this.baseUrl}/api/v1/order/create-transaction`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30秒超时
        }
      );

      console.log('✅ BEpusdt API完整响应:', JSON.stringify(response.data, null, 2));
      
      // 检查响应状态
      if (response.data.status_code === 200) {
        const responseData = response.data.data;
        
        // ✅ BEpusdt的收款地址在token字段中
        const paymentAddress = responseData.token || 
                              responseData.address || 
                              responseData.payment_address;
        
        console.log('🔍 提取的收款地址:', paymentAddress);
        
        if (!paymentAddress) {
          console.error('❌ 无法从响应中提取收款地址！响应数据:', responseData);
          throw new Error('BEpusdt未返回收款地址');
        }
        
        return {
          success: true,
          order_id: requestData.order_id,
          payment_address: paymentAddress,
          payment_url: responseData.payment_url,
          trade_id: responseData.trade_id,
          actual_amount: responseData.actual_amount || responseData.amount,
          currency: params.currency,
          expire_time: responseData.expiration_time || 1800,
          status: 'pending',
          qrcode_url: responseData.qrcode_url,
          block_transaction_url: responseData.block_transaction_url
        };
      } else {
        throw new Error(response.data.message || '创建订单失败');
      }
    } catch (error) {
      console.error('❌ BEpusdt createOrder error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method
        }
      });
      
      // 如果是网络错误，提供更友好的错误信息
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        throw new Error('无法连接到支付服务，请检查BEpusdt服务是否正常运行');
      }
      
      throw new Error(error.response?.data?.message || error.message || '创建订单失败');
    }
  }

  /**
   * 查询订单状态
   * 注意：BEpusdt可能不提供主动查询API，主要依赖Webhook回调
   * 这个方法返回null表示不支持主动查询，应该依赖Webhook
   */
  async queryOrder(orderId) {
    console.log('⚠️  BEpusdt不提供主动查询API');
    console.log('💡 建议：依赖Webhook回调来更新订单状态');
    console.log('📋 订单号:', orderId);
    
    // BEpusdt不提供查询接口，返回null
    // 调用方应该检查数据库中的订单状态
    return null;
  }

  /**
   * 验证Webhook签名 - 按照PHP源码实现
   */
  verifyWebhookSignature(data) {
    try {
      // 复制数据，移除signature字段
      const params = { ...data };
      delete params.signature;
      
      // 使用相同的签名算法
      const expectedSign = this.generateSignature(params);
      
      console.log('🔐 Webhook签名验证:', {
        收到的签名: data.signature,
        计算的签名: expectedSign,
        验证结果: data.signature === expectedSign
      });
      
      return data.signature === expectedSign;
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
