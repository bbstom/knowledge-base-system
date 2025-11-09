// 模拟数据库数据
export interface MockUser {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  vipStatus: 'none' | 'basic' | 'premium' | 'enterprise';
  balance: number;
  points: number;
  commission: number;
  referralCode: string;
  referredBy?: string;
  isEmailVerified: boolean;
  lastDailyClaimAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockSearchRecord {
  id: string;
  userId: string;
  type: string;
  query: string;
  database: string;
  result?: any;
  status: 'success' | 'failed' | 'timeout' | 'unpaid';
  cost: number;
  createdAt: string;
}

export interface MockDatabase {
  id: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  recordCount: number;
  lastUpdated: string;
}

export interface MockCommission {
  id: string;
  userId: string;
  fromUserId: string;
  fromUser: string;
  amount: number;
  type: 'referral' | 'purchase';
  status: 'pending' | 'paid';
  createdAt: string;
}

export interface MockPointsRecord {
  id: string;
  userId: string;
  amount: number;
  type: 'daily' | 'referral' | 'purchase' | 'bonus';
  description: string;
  createdAt: string;
}

export interface MockAdvertisement {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  position: 'search' | 'home' | 'databases';
  order: number;
  createdAt: string;
  updatedAt: string;
}

// 模拟用户数据
export const mockUsers: MockUser[] = [
  {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashed_password',
    vipStatus: 'basic',
    balance: 100.50,
    points: 1250,
    commission: 45.80,
    referralCode: 'REF001',
    isEmailVerified: true,
    lastDailyClaimAt: '2024-10-18',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-10-19T08:00:00Z'
  },
  {
    id: 'admin',
    username: 'admin',
    email: 'admin@infosearch.com',
    password: 'admin123',
    vipStatus: 'enterprise',
    balance: 10000,
    points: 50000,
    commission: 0,
    referralCode: 'ADMIN',
    isEmailVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-19T08:00:00Z'
  }
];

// 模拟数据库列表
export const mockDatabases: MockDatabase[] = [
  {
    id: 'db1',
    name: '身份证信息库',
    description: '包含全国身份证信息数据，支持姓名、身份证号查询',
    price: 5,
    isActive: true,
    recordCount: 1500000,
    lastUpdated: '2024-10-15'
  },
  {
    id: 'db2',
    name: '手机号信息库',
    description: '手机号码归属地和运营商信息，实时更新',
    price: 3,
    isActive: true,
    recordCount: 2800000,
    lastUpdated: '2024-10-18'
  },
  {
    id: 'db3',
    name: 'QQ信息库',
    description: 'QQ号码相关信息查询，包含昵称、等级等',
    price: 4,
    isActive: true,
    recordCount: 980000,
    lastUpdated: '2024-10-10'
  },
  {
    id: 'db4',
    name: '微信信息库',
    description: '微信号相关信息，包含昵称、头像等公开信息',
    price: 6,
    isActive: true,
    recordCount: 1200000,
    lastUpdated: '2024-10-16'
  },
  {
    id: 'db5',
    name: '邮箱信息库',
    description: '邮箱地址相关信息查询和验证',
    price: 2,
    isActive: true,
    recordCount: 3500000,
    lastUpdated: '2024-10-17'
  },
  {
    id: 'db6',
    name: '微博信息库',
    description: '微博用户信息，包含用户名、粉丝数等',
    price: 4,
    isActive: false, // 维护中
    recordCount: 850000,
    lastUpdated: '2024-10-05'
  }
];

// 模拟搜索记录
export const mockSearchHistory: MockSearchRecord[] = [
  {
    id: 'search1',
    userId: '1',
    type: 'phone',
    query: '138****8888',
    database: 'db2',
    result: {
      phone: '138****8888',
      province: '广东省',
      city: '深圳市',
      operator: '中国移动'
    },
    status: 'success',
    cost: 3,
    createdAt: '2024-10-19T10:30:00Z'
  },
  {
    id: 'search2',
    userId: '1',
    type: 'idcard',
    query: '440***********1234',
    database: 'db1',
    status: 'failed',
    cost: 0,
    createdAt: '2024-10-19T09:15:00Z'
  },
  {
    id: 'search3',
    userId: '1',
    type: 'email',
    query: 'test@example.com',
    database: 'db5',
    result: {
      email: 'test@example.com',
      domain: 'example.com',
      valid: true,
      registered: '2020-05-15'
    },
    status: 'success',
    cost: 2,
    createdAt: '2024-10-18T16:45:00Z'
  }
];

// 模拟佣金记录
export const mockCommissions: MockCommission[] = [
  {
    id: 'comm1',
    userId: '1',
    fromUserId: '2',
    fromUser: 'user123',
    amount: 15.50,
    type: 'referral',
    status: 'paid',
    createdAt: '2024-10-18T14:20:00Z'
  },
  {
    id: 'comm2',
    userId: '1',
    fromUserId: '3',
    fromUser: 'newuser456',
    amount: 8.30,
    type: 'purchase',
    status: 'pending',
    createdAt: '2024-10-19T11:10:00Z'
  }
];

// 模拟积分记录
export const mockPointsHistory: MockPointsRecord[] = [
  {
    id: 'points1',
    userId: '1',
    amount: 10,
    type: 'daily',
    description: '每日签到奖励',
    createdAt: '2024-10-19T08:00:00Z'
  },
  {
    id: 'points2',
    userId: '1',
    amount: 50,
    type: 'referral',
    description: '推荐用户注册奖励',
    createdAt: '2024-10-18T15:30:00Z'
  },
  {
    id: 'points3',
    userId: '1',
    amount: 25,
    type: 'purchase',
    description: '消费返积分',
    createdAt: '2024-10-17T12:45:00Z'
  }
];

// 模拟推荐用户数据
export const mockReferralUsers = [
  {
    id: '2',
    username: 'user123',
    createdAt: '2024-10-18T14:20:00Z',
    commission: 15.50,
    status: '已激活'
  },
  {
    id: '3',
    username: 'newuser456',
    createdAt: '2024-10-19T11:10:00Z',
    commission: 8.30,
    status: '已激活'
  }
];

// 模拟广告数据
export const mockAdvertisements: MockAdvertisement[] = [
  {
    id: 'ad1',
    title: '欢迎使用信息搜索平台',
    content: `
      <div class="space-y-2">
        <h3 class="text-lg font-semibold text-blue-900">🎉 新用户福利</h3>
        <p class="text-gray-700">注册即送 <span class="font-bold text-blue-600">100积分</span>，邀请好友更有额外奖励！</p>
        <div class="flex items-center gap-4 mt-3">
          <img src="https://via.placeholder.com/120x60/4F46E5/FFFFFF?text=VIP" alt="VIP" class="rounded" />
          <span class="text-sm text-gray-600">升级VIP享受更多特权</span>
        </div>
      </div>
    `,
    isActive: true,
    position: 'search',
    order: 1,
    createdAt: '2024-10-15T08:00:00Z',
    updatedAt: '2024-10-15T08:00:00Z'
  },
  {
    id: 'ad2',
    title: '数据库更新通知',
    content: `
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div>
          <h4 class="font-semibold text-gray-900">数据库已更新</h4>
          <p class="text-sm text-gray-600 mt-1">手机号信息库新增 <span class="font-bold">50万+</span> 条记录，查询更准确！</p>
        </div>
      </div>
    `,
    isActive: true,
    position: 'search',
    order: 2,
    createdAt: '2024-10-18T10:00:00Z',
    updatedAt: '2024-10-18T10:00:00Z'
  }
];

// 模拟 API 响应延迟
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟 API 方法
export const mockApi = {
  // 认证相关
  async login(email: string, password: string) {
    await delay(1000);
    
    // 模拟登录验证
    const user = mockUsers.find(u => u.email === email);
    
    if (!user) {
      return {
        success: false,
        message: '用户不存在'
      };
    }
    
    // 简单的密码验证（实际应该是 bcrypt 比较）
    const validPassword = (user.email === 'admin@infosearch.com' && password === 'admin123') ||
                         (user.email === 'test@example.com' && password === 'password123');
    
    if (!validPassword) {
      return {
        success: false,
        message: '密码错误'
      };
    }
    
    // 生成模拟 token
    const token = `mock_token_${Date.now()}`;
    
    return {
      success: true,
      data: {
        token,
        user: {
          ...user,
          password: undefined // 不返回密码
        }
      }
    };
  },

  async register(data: { username: string; email: string; password: string; referralCode?: string }) {
    await delay(1000);
    
    // 检查邮箱是否已存在
    const existingUser = mockUsers.find(u => u.email === data.email);
    if (existingUser) {
      return {
        success: false,
        message: '邮箱已被注册'
      };
    }
    
    // 创建新用户
    const newUser: MockUser = {
      id: `user_${Date.now()}`,
      username: data.username,
      email: data.email,
      password: data.password, // 实际应该加密
      vipStatus: 'none',
      balance: 0,
      points: 100, // 注册奖励积分
      commission: 0,
      referralCode: `REF${Date.now().toString().slice(-6)}`,
      referredBy: data.referralCode,
      isEmailVerified: true, // 模拟已验证
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockUsers.push(newUser);
    
    // 生成模拟 token
    const token = `mock_token_${Date.now()}`;
    
    return {
      success: true,
      data: {
        token,
        user: {
          ...newUser,
          password: undefined
        }
      }
    };
  },

  // 用户相关
  async getProfile() {
    await delay(500);
    const user = mockUsers[0];
    return {
      success: true,
      data: {
        ...user,
        stats: {
          totalReferrals: mockReferralUsers.length,
          totalCommission: mockCommissions.reduce((sum, c) => sum + c.amount, 0),
          pendingCommission: mockCommissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0),
          totalSearches: mockSearchHistory.length,
          todaySearches: mockSearchHistory.filter(s => 
            new Date(s.createdAt).toDateString() === new Date().toDateString()
          ).length
        },
        canClaimDaily: user.lastDailyClaimAt !== new Date().toISOString().split('T')[0],
        referralUsers: mockReferralUsers,
        commissionHistory: mockCommissions
      }
    };
  },

  // 搜索相关
  async getDatabases() {
    await delay(300);
    return {
      success: true,
      data: mockDatabases
    };
  },

  async search(data: { type: string; query: string; database: string }) {
    await delay(1000);
    
    // 模拟搜索结果
    const database = mockDatabases.find(db => db.id === data.database);
    if (!database || !database.isActive) {
      return {
        success: false,
        message: '数据库不可用'
      };
    }

    // 模拟搜索成功
    const mockResult = {
      id: `search_${Date.now()}`,
      type: data.type,
      query: data.query,
      database: data.database,
      result: {
        [data.type]: data.query,
        info: '模拟搜索结果数据',
        timestamp: new Date().toISOString()
      },
      status: 'success',
      cost: database.price,
      timestamp: new Date().toISOString()
    };

    return {
      success: true,
      data: mockResult
    };
  },

  // 搜索历史
  async getSearchHistory(page = 1, limit = 10) {
    await delay(400);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = mockSearchHistory.slice(start, end);
    
    return {
      success: true,
      data: {
        data: paginatedData,
        total: mockSearchHistory.length,
        page,
        limit,
        totalPages: Math.ceil(mockSearchHistory.length / limit)
      }
    };
  },

  // 佣金相关
  async getCommissions() {
    await delay(400);
    return {
      success: true,
      data: {
        totalCommission: mockCommissions.reduce((sum, c) => sum + c.amount, 0),
        availableCommission: mockCommissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0),
        pendingCommission: mockCommissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0),
        totalWithdrawn: 0,
        commissionHistory: mockCommissions
      }
    };
  },

  // 积分相关
  async getPointsHistory() {
    await delay(400);
    return {
      success: true,
      data: {
        totalPoints: mockPointsHistory.reduce((sum, p) => sum + p.amount, 0),
        availablePoints: mockUsers[0].points,
        usedPoints: 0,
        pointsHistory: mockPointsHistory,
        canClaimDaily: mockUsers[0].lastDailyClaimAt !== new Date().toISOString().split('T')[0],
        dailyReward: 10
      }
    };
  },

  // 每日签到
  async claimDailyPoints() {
    await delay(800);
    return {
      success: true,
      data: {
        points: 10
      }
    };
  },

  // 提现
  async createWithdraw(amount: number, walletAddress: string) {
    await delay(1000);
    return {
      success: true,
      message: '提现申请已提交'
    };
  },

  // 广告相关
  async getAdvertisements(position?: string) {
    await delay(300);
    let ads = mockAdvertisements.filter(ad => ad.isActive);
    
    if (position) {
      ads = ads.filter(ad => ad.position === position);
    }
    
    // 按 order 排序
    ads.sort((a, b) => a.order - b.order);
    
    return {
      success: true,
      data: ads
    };
  },

  // 通知相关
  async getActiveNotifications() {
    await delay(300);
    
    // 模拟活跃通知
    const notifications = [
      {
        id: 'notif1',
        title: '🎉 新用户专享优惠',
        content: '注册即送100积分，首次充值享8折优惠！活动时间有限，快来参与吧！',
        type: 'text',
        status: 'active',
        startDate: '2024-10-15',
        endDate: '2024-10-31',
        targetUsers: 'new',
        priority: 'high'
      },
      {
        id: 'notif2',
        title: 'VIP会员限时优惠',
        content: '<div class="text-center"><h2 class="text-2xl font-bold text-blue-600 mb-4">VIP会员限时优惠</h2><p class="text-lg mb-4">升级VIP享受更多特权：</p><ul class="text-left space-y-2"><li>✓ 搜索次数无限制</li><li>✓ 专属客服支持</li><li>✓ 优先数据更新</li><li>✓ 更多积分奖励</li></ul><p class="mt-6 text-red-600 font-bold">限时优惠：原价 ¥299，现价 ¥199</p></div>',
        type: 'html',
        status: 'active',
        startDate: '2024-10-10',
        endDate: '2024-10-25',
        targetUsers: 'all',
        priority: 'medium'
      }
    ];
    
    // 根据用户类型过滤通知
    const today = new Date().toISOString().split('T')[0];
    const activeNotifications = notifications.filter(n => {
      const isActive = n.status === 'active';
      const isInDateRange = n.startDate <= today && (!n.endDate || n.endDate >= today);
      return isActive && isInDateRange;
    });
    
    // 按优先级排序
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    activeNotifications.sort((a, b) => 
      priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
    );
    
    return {
      success: true,
      data: activeNotifications
    };
  }
};