// 管理员API工具函数

const getToken = (): string => {
  return document.cookie.split('token=')[1]?.split(';')[0] || '';
};

const apiRequest = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  
  const config: RequestInit = {
    credentials: 'include', // 重要！允许发送Cookie
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  return response.json();
};

// 系统配置API
export const systemConfigApi = {
  // 获取所有配置
  async getAll() {
    return apiRequest('/api/system-config');
  },

  // 更新搜索类型
  async updateSearchTypes(searchTypes: any[]) {
    return apiRequest('/api/system-config/search-types', {
      method: 'PUT',
      body: JSON.stringify({ searchTypes })
    });
  },

  // 更新数据库配置
  async updateDatabases(databases: any) {
    return apiRequest('/api/system-config/databases', {
      method: 'PUT',
      body: JSON.stringify({ databases })
    });
  },

  // 更新邮件配置
  async updateEmail(email: any) {
    return apiRequest('/api/system-config/email', {
      method: 'PUT',
      body: JSON.stringify({ email })
    });
  },

  // 更新积分配置
  async updatePoints(points: any) {
    return apiRequest('/api/system-config/points', {
      method: 'PUT',
      body: JSON.stringify({ points })
    });
  }
};

// 佣金配置API
export const commissionApi = {
  async getConfig() {
    return apiRequest('/api/commission/config');
  },

  async updateConfig(config: any) {
    return apiRequest('/api/commission/config', {
      method: 'PUT',
      body: JSON.stringify(config)
    });
  }
};

// 内容管理API
export const contentApi = {
  async getList(params?: { type?: string; status?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/api/content?${query}`);
  },

  async getById(id: string) {
    return apiRequest(`/api/content/${id}`);
  },

  async create(content: any) {
    return apiRequest('/api/content', {
      method: 'POST',
      body: JSON.stringify(content)
    });
  },

  async update(id: string, content: any) {
    return apiRequest(`/api/content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(content)
    });
  },

  async delete(id: string) {
    return apiRequest(`/api/content/${id}`, {
      method: 'DELETE'
    });
  }
};

// 通知管理API
export const notificationApi = {
  async getActive() {
    return apiRequest('/api/notifications/active');
  },

  async getAll(params?: { status?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/api/notifications?${query}`);
  },

  async create(notification: any) {
    return apiRequest('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(notification)
    });
  },

  async update(id: string, notification: any) {
    return apiRequest(`/api/notifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(notification)
    });
  },

  async delete(id: string) {
    return apiRequest(`/api/notifications/${id}`, {
      method: 'DELETE'
    });
  },

  async markAsRead(id: string) {
    return apiRequest(`/api/notifications/${id}/read`, {
      method: 'POST'
    });
  }
};

// 数据库管理API
export const databaseApi = {
  async getAll(params?: { isActive?: boolean; page?: number; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/api/databases?${query}`);
  },

  async getById(id: string) {
    return apiRequest(`/api/databases/${id}`);
  },

  async create(database: any) {
    return apiRequest('/api/databases', {
      method: 'POST',
      body: JSON.stringify(database)
    });
  },

  async update(id: string, database: any) {
    return apiRequest(`/api/databases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(database)
    });
  },

  async delete(id: string) {
    return apiRequest(`/api/databases/${id}`, {
      method: 'DELETE'
    });
  },

  async updateStats(id: string, stats: any) {
    return apiRequest(`/api/databases/${id}/stats`, {
      method: 'PUT',
      body: JSON.stringify(stats)
    });
  }
};

// FAQ管理API
export const faqApi = {
  async getAll(params?: { category?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/api/faqs/admin?${query}`);
  },

  async create(faq: any) {
    return apiRequest('/api/faqs', {
      method: 'POST',
      body: JSON.stringify(faq)
    });
  },

  async update(id: string, faq: any) {
    return apiRequest(`/api/faqs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(faq)
    });
  },

  async delete(id: string) {
    return apiRequest(`/api/faqs/${id}`, {
      method: 'DELETE'
    });
  }
};

// 话题管理API
export const topicApi = {
  async getAll(params?: { category?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/api/topics/admin?${query}`);
  },

  async create(topic: any) {
    return apiRequest('/api/topics', {
      method: 'POST',
      body: JSON.stringify(topic)
    });
  },

  async update(id: string, topic: any) {
    return apiRequest(`/api/topics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(topic)
    });
  },

  async delete(id: string) {
    return apiRequest(`/api/topics/${id}`, {
      method: 'DELETE'
    });
  }
};

// 广告管理API
export const advertisementApi = {
  async getAll(params?: { position?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/api/advertisements/admin?${query}`);
  },

  async create(ad: any) {
    return apiRequest('/api/advertisements', {
      method: 'POST',
      body: JSON.stringify(ad)
    });
  },

  async update(id: string, ad: any) {
    return apiRequest(`/api/advertisements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ad)
    });
  },

  async delete(id: string) {
    return apiRequest(`/api/advertisements/${id}`, {
      method: 'DELETE'
    });
  }
};


// 抽奖管理API
export const lotteryApi = {
  // 获取所有抽奖活动
  async getActivities(params?: { page?: number; limit?: number; isActive?: boolean }) {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/api/lottery/admin/activities?${query}`);
  },

  // 创建抽奖活动
  async createActivity(activity: any) {
    return apiRequest('/api/lottery/admin/activities', {
      method: 'POST',
      body: JSON.stringify(activity)
    });
  },

  // 更新抽奖活动
  async updateActivity(id: string, activity: any) {
    return apiRequest(`/api/lottery/admin/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(activity)
    });
  },

  // 删除抽奖活动
  async deleteActivity(id: string) {
    return apiRequest(`/api/lottery/admin/activities/${id}`, {
      method: 'DELETE'
    });
  },

  // 获取抽奖记录
  async getRecords(params?: { page?: number; limit?: number; activityId?: string; status?: string; userId?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/api/lottery/admin/records?${query}`);
  },

  // 更新记录状态
  async updateRecordStatus(id: string, status: string, note?: string) {
    return apiRequest(`/api/lottery/admin/records/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, note })
    });
  },

  // 获取活动统计
  async getStatistics(params?: { activityId?: string; dateRange?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/api/lottery/admin/statistics?${query}`);
  }
};

// 导出为adminLotteryApi别名（兼容性）
export const adminLotteryApi = lotteryApi;
