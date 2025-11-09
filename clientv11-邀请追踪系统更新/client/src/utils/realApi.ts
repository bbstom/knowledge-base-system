// 真实的API服务 - 连接后端
import Cookies from 'js-cookie';

const API_BASE_URL = '/api';

// 获取存储的token（使用Cookies，与auth.ts保持一致）
const getToken = (): string | null => {
  return Cookies.get('token') || null;
};

// 设置token（使用Cookies，与auth.ts保持一致）
const setToken = (token: string): void => {
  Cookies.set('token', token, { expires: 7 });
};

// 清除token（使用Cookies，与auth.ts保持一致）
const clearToken = (): void => {
  Cookies.remove('token');
};

// 通用请求函数
const request = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || '请求失败');
  }

  return data;
};

// 认证API
export const authApi = {
  // 登录
  async login(email: string, password: string) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // 保存token和用户信息
    setToken(data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    
    return {
      success: true,
      data: {
        token: data.data.token,
        user: data.data.user,
      },
    };
  },

  // 注册
  async register(userData: { username: string; email: string; password: string; referralCode?: string }) {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // 保存token和用户信息
    setToken(data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    
    return {
      success: true,
      data: {
        token: data.data.token,
        user: data.data.user,
      },
    };
  },

  // 获取当前用户信息
  async getCurrentUser() {
    const data = await request('/auth/me');
    
    // 更新本地用户信息
    localStorage.setItem('user', JSON.stringify(data.data.user));
    
    return {
      success: true,
      data: data.data.user,
    };
  },

  // 登出
  async logout() {
    clearToken();
    localStorage.removeItem('user');
    return { success: true };
  },

  // 每日签到
  async claimDailyPoints() {
    const data = await request('/auth/claim-daily-points', {
      method: 'POST',
    });
    
    // 更新本地用户积分
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    user.points = data.data.points;
    user.lastDailyClaimAt = data.data.lastDailyClaimAt;
    localStorage.setItem('user', JSON.stringify(user));
    
    return {
      success: true,
      data: data.data,
    };
  },
};

// 用户API
export const userApi = {
  // 获取用户资料
  async getProfile() {
    const data = await request('/user/profile');
    return {
      success: true,
      user: data.user,
    };
  },

  // 更新用户资料
  async updateProfile(profileData: { username?: string; email?: string }) {
    const data = await request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    
    // 更新本地用户信息
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    Object.assign(user, data.user);
    localStorage.setItem('user', JSON.stringify(user));
    
    return {
      success: true,
      user: data.user,
    };
  },

  // 获取余额记录
  async getBalanceLogs(page = 1, limit = 10) {
    const data = await request(`/user/balance-logs?page=${page}&limit=${limit}`);
    return {
      success: true,
      data: data.data,
    };
  },

  // 获取推荐统计
  async getReferralStats() {
    const data = await request('/user/referral-stats');
    return {
      success: true,
      data: data.data,
    };
  },

  // 获取搜索历史
  async getSearchHistory(page = 1, limit = 10) {
    const data = await request(`/user/search-history?page=${page}&limit=${limit}`);
    return {
      success: true,
      data: data.data,
    };
  },

  // 获取佣金记录
  async getCommissions(page = 1, limit = 10) {
    const data = await request(`/user/commissions?page=${page}&limit=${limit}`);
    return {
      success: true,
      data: data.data,
    };
  },

  // 获取积分历史
  async getPointsHistory(page = 1, limit = 10) {
    const data = await request(`/user/points-history?page=${page}&limit=${limit}`);
    return {
      success: true,
      data: data.data,
    };
  },
};

// 充值API
export const rechargeApi = {
  // 创建充值订单
  async createOrder(orderData: {
    type: 'points' | 'vip';
    amount: number;
    currency: string;
    points?: number;
    vipDays?: number;
    vipPackageName?: string;
  }) {
    // 获取当前用户ID
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      throw new Error('请先登录');
    }

    const data = await request('/recharge/create', {
      method: 'POST',
      body: JSON.stringify({
        userId: user.id,
        ...orderData,
      }),
    });
    
    return {
      success: true,
      data: data.order,
    };
  },

  // 查询订单状态
  async queryOrder(orderId: string) {
    const data = await request(`/recharge/query/${orderId}`);
    return {
      success: true,
      data: data.order,
    };
  },

  // 获取充值记录
  async getHistory(page = 1, limit = 10) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      throw new Error('请先登录');
    }

    const data = await request(`/recharge/history/${user.id}?page=${page}&limit=${limit}`);
    return {
      success: true,
      data: data.orders,
      pagination: data.pagination,
    };
  },
};

// 搜索API
export const searchApi = {
  // 执行搜索
  async search(searchData: { type: string; query: string; databaseId?: string }) {
    const data = await request('/search', {
      method: 'POST',
      body: JSON.stringify(searchData),
    });
    return data;
  },

  // 获取数据库列表
  async getDatabases() {
    const response = await request('/search/databases');
    return {
      success: true,
      data: response.data || [],
    };
  },

  // 获取广告列表
  async getAdvertisements() {
    const data = await request('/search/advertisements');
    return {
      success: true,
      data: data.data,
    };
  },
};

// 提现API
export const withdrawApi = {
  // 创建提现申请
  async createWithdraw(amount: number, walletAddress: string) {
    const data = await request('/withdraw/create', {
      method: 'POST',
      body: JSON.stringify({ amount, walletAddress }),
    });
    return {
      success: true,
      data: data.data,
    };
  },

  // 获取提现记录
  async getHistory(page = 1, limit = 10) {
    const data = await request(`/withdraw/history?page=${page}&limit=${limit}`);
    return {
      success: true,
      data: data.data,
    };
  },
};

// 系统配置API
export const systemConfigApi = {
  // 获取积分说明配置
  async getPointsDescriptions() {
    const data = await request('/system-config/points-descriptions');
    return {
      success: true,
      data: data.data,
    };
  },

  // 更新积分说明配置（管理员）
  async updatePointsDescriptions(descriptions: {
    earnMethods: Array<{
      id: string;
      title: string;
      description: string;
      reward: string;
      icon: string;
      color: string;
      order: number;
    }>;
    usageMethods: Array<{
      id: string;
      title: string;
      description: string;
      order: number;
    }>;
  }) {
    const data = await request('/system-config/points-descriptions', {
      method: 'PUT',
      body: JSON.stringify(descriptions),
    });
    return {
      success: true,
      data: data.data,
    };
  },

  // 获取卡密购买配置
  async getRechargeCardConfig() {
    const data = await request('/system-config/recharge-card');
    return {
      success: true,
      data: data.data,
    };
  },

  // 更新卡密购买配置（管理员）
  async updateRechargeCardConfig(config: {
    enabled: boolean;
    title: string;
    description: string;
    purchaseUrl: string;
    instructions: string;
  }) {
    const data = await request('/system-config/recharge-card', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
    return {
      success: true,
      data: data.data,
    };
  },
};

// 检查是否已登录
export const isAuthenticated = (): boolean => {
  const token = getToken();
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// 获取当前用户
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// 管理员API
export const adminApi = {
  // 获取提现申请列表
  async getWithdrawals(page = 1, limit = 20, status?: string, type?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    if (status) params.append('status', status);
    if (type) params.append('type', type);
    
    const data = await request(`/withdraw/admin/list?${params}`);
    return {
      success: true,
      data: data.data,
    };
  },

  // 审批提现申请
  async approveWithdrawal(orderId: string, txHash: string, remark?: string) {
    const data = await request(`/withdraw/admin/approve/${orderId}`, {
      method: 'POST',
      body: JSON.stringify({ txHash, remark }),
    });
    return {
      success: true,
      data: data.data,
    };
  },

  // 拒绝提现申请
  async rejectWithdrawal(orderId: string, reason: string) {
    const data = await request(`/withdraw/admin/reject/${orderId}`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return {
      success: true,
      data: data.data,
    };
  },
};


// 工单API
export const ticketApi = {
  // 创建工单
  async createTicket(data: {
    subject: string;
    category: string;
    priority: string;
    content: string;
  }) {
    return await request('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 获取用户工单列表
  async getTickets(params?: { status?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    
    return await request(`/tickets?${query.toString()}`);
  },

  // 获取工单详情
  async getTicket(id: string) {
    return await request(`/tickets/${id}`);
  },

  // 回复工单
  async replyTicket(id: string, content: string) {
    return await request(`/tickets/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  // 关闭工单
  async closeTicket(id: string) {
    return await request(`/tickets/${id}/close`, {
      method: 'PUT',
    });
  },

  // 管理员：获取所有工单
  async getAllTickets(params?: {
    status?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.priority) query.append('priority', params.priority);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    
    return await request(`/tickets/admin/all?${query.toString()}`);
  },

  // 管理员：更新工单状态
  async updateTicketStatus(id: string, status: string) {
    return await request(`/tickets/admin/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};
