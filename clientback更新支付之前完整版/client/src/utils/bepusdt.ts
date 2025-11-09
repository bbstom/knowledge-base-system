// BEpusdt API 集成工具

interface BEpusdtConfig {
  baseUrl: string;
  apiKey: string;
  merchantId: string;
}

interface CreateOrderRequest {
  order_id: string;
  amount: number;
  currency: 'USDT' | 'TRX';
  notify_url: string;
  redirect_url: string;
}

interface CreateOrderResponse {
  success: boolean;
  message?: string;
  order_id: string;
  payment_address: string;
  amount: number;
  actual_amount: number;
  currency: string;
  expire_time: number;
}

interface QueryOrderResponse {
  success: boolean;
  message?: string;
  order_id: string;
  status: 'pending' | 'paid' | 'expired' | 'failed';
  amount: number;
  actual_amount: number;
  currency: string;
  payment_address: string;
  tx_hash?: string;
  block_number?: number;
  created_at: string;
  updated_at: string;
}

interface WebhookData {
  order_id: string;
  amount: number;
  actual_amount: number;
  currency: string;
  status: string;
  tx_hash: string;
  block_number: number;
  created_at: string;
  updated_at: string;
  sign: string;
}

class BEpusdtAPI {
  private config: BEpusdtConfig;

  constructor(config: BEpusdtConfig) {
    this.config = config;
  }

  /**
   * 创建支付订单
   */
  async createOrder(params: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/v1/order/create-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          ...params,
          merchant_id: this.config.merchantId,
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('BEpusdt createOrder error:', error);
      throw error;
    }
  }

  /**
   * 查询订单状态
   */
  async queryOrder(orderId: string): Promise<QueryOrderResponse> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/order/query-order-info?order_id=${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          }
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('BEpusdt queryOrder error:', error);
      throw error;
    }
  }

  /**
   * 验证webhook签名
   */
  verifyWebhookSignature(data: WebhookData, secret: string): boolean {
    try {
      // 按照文档要求生成签名
      const signString = `${data.order_id}${data.amount}${data.actual_amount}${data.currency}${data.status}${secret}`;
      
      // 使用MD5生成签名（需要安装crypto-js或使用Web Crypto API）
      // 这里使用简单的字符串比较作为示例
      const expectedSign = this.generateMD5(signString);
      
      return data.sign === expectedSign;
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  /**
   * 生成MD5签名（示例实现）
   */
  private generateMD5(str: string): string {
    // 实际项目中应该使用crypto-js或其他MD5库
    // 这里返回示例签名
    return 'example_md5_hash';
  }

  /**
   * 获取支持的币种列表
   */
  async getSupportedCurrencies(): Promise<string[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/v1/supported-currencies`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        }
      });

      const data = await response.json();
      return data.currencies || ['USDT', 'TRX'];
    } catch (error) {
      console.error('Get supported currencies error:', error);
      return ['USDT', 'TRX'];
    }
  }

  /**
   * 获取实时汇率
   */
  async getExchangeRates(): Promise<Record<string, number>> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/v1/exchange-rates`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        }
      });

      const data = await response.json();
      return data.rates || { USDT: 7.2, TRX: 0.8 };
    } catch (error) {
      console.error('Get exchange rates error:', error);
      return { USDT: 7.2, TRX: 0.8 };
    }
  }
}

// 创建BEpusdt API实例
const bepusdtConfig: BEpusdtConfig = {
  baseUrl: process.env.REACT_APP_BEPUSDT_URL || 'https://your-bepusdt-domain.com',
  apiKey: process.env.REACT_APP_BEPUSDT_API_KEY || 'your-api-key',
  merchantId: process.env.REACT_APP_BEPUSDT_MERCHANT_ID || 'your-merchant-id',
};

export const bepusdtAPI = new BEpusdtAPI(bepusdtConfig);

// 导出类型
export type {
  CreateOrderRequest,
  CreateOrderResponse,
  QueryOrderResponse,
  WebhookData,
  BEpusdtConfig
};

// 工具函数
export const formatCryptoAmount = (amount: number, decimals: number = 6): string => {
  return amount.toFixed(decimals);
};

export const validateTRC20Address = (address: string): boolean => {
  // TRC20地址验证：以T开头，长度34位
  const trc20Regex = /^T[A-Za-z1-9]{33}$/;
  return trc20Regex.test(address);
};

export const generateOrderId = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORDER${timestamp}${random}`;
};

// 订单状态映射
export const ORDER_STATUS_MAP = {
  pending: '待支付',
  paid: '已支付',
  expired: '已过期',
  failed: '支付失败'
} as const;

// 支持的币种配置
export const SUPPORTED_CURRENCIES = {
  USDT: {
    name: 'USDT',
    fullName: 'Tether USD',
    network: 'TRC20',
    decimals: 6,
    minAmount: 1,
    icon: '₮'
  },
  TRX: {
    name: 'TRX',
    fullName: 'TRON',
    network: 'TRC20',
    decimals: 6,
    minAmount: 10,
    icon: 'Ⓣ'
  }
} as const;
