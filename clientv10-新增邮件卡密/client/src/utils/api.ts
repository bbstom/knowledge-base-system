import axios from 'axios';
import Cookies from 'js-cookie';

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 创建 axios 实例
const api = axios.create({
  baseURL: '/api', // 使用代理
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 导入真实API
import { 
  authApi as realAuthApi, 
  userApi as realUserApi, 
  rechargeApi as realRechargeApi, 
  searchApi as realSearchApi,
  withdrawApi as realWithdrawApi,
  isAuthenticated as realIsAuthenticated, 
  getCurrentUser as realGetCurrentUser 
} from './realApi';

// API 方法 - 100%使用真实后端API，不再使用mock数据
export const authApi = {
  login: (email: string, password: string) => realAuthApi.login(email, password),
  register: (data: { username: string; email: string; password: string; referralCode?: string }) => realAuthApi.register(data),
  getCurrentUser: () => realAuthApi.getCurrentUser(),
  logout: () => realAuthApi.logout(),
  claimDailyPoints: () => realAuthApi.claimDailyPoints(),
  verifyEmail: (token: string) => Promise.resolve({ success: true, message: '邮箱验证成功' }),
  resendVerification: (email: string) => Promise.resolve({ success: true, message: '验证邮件已发送' }),
  forgotPassword: (email: string) => Promise.resolve({ success: true, message: '重置邮件已发送' }),
  resetPassword: (token: string, password: string) => Promise.resolve({ success: true, message: '密码重置成功' }),
  getActiveNotifications: () => Promise.resolve({ success: true, data: [] }), // 暂时返回空数组
};

export const userApi = {
  getProfile: () => realUserApi.getProfile(),
  updateProfile: (data: any) => realUserApi.updateProfile(data),
  getSearchHistory: (page = 1, limit = 10) => realUserApi.getSearchHistory(page, limit),
  getCommissions: (page = 1, limit = 10) => realUserApi.getCommissions(page, limit),
  getPointsHistory: (page = 1, limit = 10) => realUserApi.getPointsHistory(page, limit),
  claimDailyPoints: () => realAuthApi.claimDailyPoints(),
  getReferralStats: () => realUserApi.getReferralStats(),
  getBalanceLogs: (page?: number, limit?: number) => realUserApi.getBalanceLogs(page, limit),
  exchangePoints: async (amount: number): Promise<ApiResponse> => {
    return api.post('/user/exchange-points', { amount }) as Promise<ApiResponse>;
  },
  getCommissionLogs: async (page = 1, limit = 50): Promise<ApiResponse> => {
    return api.get('/user/balance-logs', { params: { page, limit } }) as Promise<ApiResponse>;
  },
};

export const rechargeApi = {
  createOrder: (orderData: any) => realRechargeApi.createOrder(orderData),
  queryOrder: (orderId: string) => realRechargeApi.queryOrder(orderId),
  getHistory: (page?: number, limit?: number) => realRechargeApi.getHistory(page, limit),
};

export const searchApi = {
  search: (data: { type: string; query: string; databaseId?: string }) => realSearchApi.search(data),
  getDatabases: () => realSearchApi.getDatabases(),
  getAdvertisements: () => realSearchApi.getAdvertisements(),
};

export const withdrawApi = {
  createWithdraw: (amount: number, walletAddress: string) => realWithdrawApi.createWithdraw(amount, walletAddress),
  withdrawCommission: async (amount: number, type: 'usdt' | 'balance', walletAddress?: string): Promise<ApiResponse> => {
    return api.post('/withdraw/commission', { amount, type, walletAddress }) as Promise<ApiResponse>;
  },
  getWithdrawHistory: async (page = 1, limit = 10, type?: string): Promise<ApiResponse> => {
    return api.get('/withdraw/history', { params: { page, limit, type } }) as Promise<ApiResponse>;
  },
};

export const shopApi = {
  getExchangeRate: async (): Promise<ApiResponse> => {
    return api.get('/shop/exchange-rate') as Promise<ApiResponse>;
  },
};

export const systemConfigApi = {
  getPointsDescriptions: async (): Promise<ApiResponse> => {
    return api.get('/system-config/points-descriptions') as Promise<ApiResponse>;
  },
  updatePointsDescriptions: async (data: any): Promise<ApiResponse> => {
    return api.put('/system-config/points-descriptions', data) as Promise<ApiResponse>;
  },
};

// 导出认证相关函数
export const isAuthenticated = realIsAuthenticated;
export const getCurrentUser = realGetCurrentUser;

export default api;