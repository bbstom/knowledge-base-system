import React, { useState, useEffect } from 'react';
import { Users, Search, Eye, Gift, DollarSign, History, UserPlus, TrendingUp } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';

interface User {
  id: string;
  username: string;
  email: string;
  vipStatus: string;
  balance: number;
  points: number;
  commission: number;
  referralCode: string;
  referredBy?: string;
  referredByUsername?: string;
  totalReferrals: number;
  totalCommission: number;
  totalSearches: number;
  createdAt: string;
  lastLoginAt: string;
}

interface ReferralUser {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  totalRecharge: number;
  commission: number;
  level: number;
}

interface PointsRecord {
  id: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

interface CommissionRecord {
  id: string;
  amount: number;
  fromUser: string;
  type: string;
  description: string;
  createdAt: string;
}

interface SearchRecord {
  id: string;
  type: string;
  query: string;
  database: string;
  cost: number;
  status: string;
  createdAt: string;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'referrals' | 'points' | 'commission' | 'searches'>('info');
  
  const [referralUsers, setReferralUsers] = useState<ReferralUser[]>([]);
  const [pointsRecords, setPointsRecords] = useState<PointsRecord[]>([]);
  const [commissionRecords, setCommissionRecords] = useState<CommissionRecord[]>([]);
  const [searchRecords, setSearchRecords] = useState<SearchRecord[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const loadUsers = async () => {
    // 模拟加载用户数据
    const mockUsers: User[] = [
      {
        id: 'user001',
        username: 'testuser',
        email: 'test@example.com',
        vipStatus: 'basic',
        balance: 100.50,
        points: 1250,
        commission: 45.80,
        referralCode: 'REF001',
        totalReferrals: 5,
        totalCommission: 245.80,
        totalSearches: 120,
        createdAt: '2024-01-15T08:00:00Z',
        lastLoginAt: '2024-10-19T10:30:00Z'
      },
      {
        id: 'user002',
        username: 'user123',
        email: 'user123@example.com',
        vipStatus: 'premium',
        balance: 500,
        points: 3500,
        commission: 120.50,
        referralCode: 'REF002',
        referredBy: 'user001',
        referredByUsername: 'testuser',
        totalReferrals: 3,
        totalCommission: 320.50,
        totalSearches: 250,
        createdAt: '2024-02-20T10:00:00Z',
        lastLoginAt: '2024-10-19T09:15:00Z'
      }
    ];
    setUsers(mockUsers);
  };

  const filterUsers = () => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.referralCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const loadUserDetails = async (user: User) => {
    // 模拟加载用户详细数据
    setReferralUsers([
      {
        id: 'ref001',
        username: 'invited_user1',
        email: 'invited1@example.com',
        createdAt: '2024-03-01T10:00:00Z',
        totalRecharge: 500,
        commission: 75,
        level: 1
      },
      {
        id: 'ref002',
        username: 'invited_user2',
        email: 'invited2@example.com',
        createdAt: '2024-03-15T14:30:00Z',
        totalRecharge: 300,
        commission: 45,
        level: 1
      }
    ]);

    setPointsRecords([
      {
        id: 'pt001',
        amount: 10,
        type: 'daily',
        description: '每日签到奖励',
        createdAt: '2024-10-19T08:00:00Z'
      },
      {
        id: 'pt002',
        amount: 100,
        type: 'referral',
        description: '推荐用户注册奖励',
        createdAt: '2024-10-18T15:30:00Z'
      },
      {
        id: 'pt003',
        amount: -10,
        type: 'search',
        description: '搜索消耗',
        createdAt: '2024-10-18T14:20:00Z'
      }
    ]);

    setCommissionRecords([
      {
        id: 'cm001',
        amount: 15.50,
        fromUser: 'invited_user1',
        type: 'recharge',
        description: '下级充值佣金',
        createdAt: '2024-10-18T14:20:00Z'
      },
      {
        id: 'cm002',
        amount: 8.30,
        fromUser: 'invited_user2',
        type: 'recharge',
        description: '下级充值佣金',
        createdAt: '2024-10-17T11:10:00Z'
      }
    ]);

    setSearchRecords([
      {
        id: 'sr001',
        type: 'phone',
        query: '138****8888',
        database: '手机号信息库',
        cost: 10,
        status: 'success',
        createdAt: '2024-10-19T10:30:00Z'
      },
      {
        id: 'sr002',
        type: 'idcard',
        query: '440***********1234',
        database: '身份证信息库',
        cost: 10,
        status: 'failed',
        createdAt: '2024-10-19T09:15:00Z'
      }
    ]);
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    loadUserDetails(user);
    setShowDetailModal(true);
    setActiveTab('info');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const getVipBadge = (vipStatus: string) => {
    const badges: Record<string, string> = {
      none: 'bg-gray-100 text-gray-800',
      basic: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-yellow-100 text-yellow-800'
    };
    const labels: Record<string, string> = {
      none: '普通用户',
      basic: '基础会员',
      premium: '高级会员',
      enterprise: '企业会员'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[vipStatus]}`}>
        {labels[vipStatus]}
      </span>
    );
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">用户管理</h1>
          <p className="text-gray-600">查看和管理用户信息</p>
        </div>

        {/* Search */}
        <div className="card mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="搜索用户名、邮箱、推荐码..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="card">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">总用户数</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <UserPlus className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">今日新增</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <Gift className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">总积分</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.reduce((sum, u) => sum + u.points, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">总佣金</p>
                <p className="text-2xl font-bold text-gray-900">
                  ¥{users.reduce((sum, u) => sum + u.commission, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.map(user => (
            <div key={user.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{user.username}</h3>
                    {getVipBadge(user.vipStatus)}
                    {user.referredBy && (
                      <span className="text-xs text-gray-500">
                        推荐人: {user.referredByUsername}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-2">
                    <div>
                      <span className="text-gray-600">邮箱：</span>
                      <span className="font-medium">{user.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">推荐码：</span>
                      <span className="font-medium">{user.referralCode}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">积分：</span>
                      <span className="font-medium text-purple-600">{user.points}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">佣金：</span>
                      <span className="font-medium text-green-600">¥{user.commission}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>推荐用户: {user.totalReferrals}人</div>
                    <div>总佣金: ¥{user.totalCommission}</div>
                    <div>搜索次数: {user.totalSearches}次</div>
                    <div>注册时间: {formatDate(user.createdAt)}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleViewDetails(user)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded ml-4"
                  title="查看详情"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                没有找到用户
              </h3>
              <p className="text-gray-600">
                请尝试使用不同的关键词搜索
              </p>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedUser.username}</h2>
                    <p className="text-gray-600">{selectedUser.email}</p>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b px-6">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`px-4 py-3 border-b-2 transition-colors ${
                    activeTab === 'info'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  基本信息
                </button>
                <button
                  onClick={() => setActiveTab('referrals')}
                  className={`px-4 py-3 border-b-2 transition-colors ${
                    activeTab === 'referrals'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  推荐用户
                </button>
                <button
                  onClick={() => setActiveTab('points')}
                  className={`px-4 py-3 border-b-2 transition-colors ${
                    activeTab === 'points'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  积分记录
                </button>
                <button
                  onClick={() => setActiveTab('commission')}
                  className={`px-4 py-3 border-b-2 transition-colors ${
                    activeTab === 'commission'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  佣金记录
                </button>
                <button
                  onClick={() => setActiveTab('searches')}
                  className={`px-4 py-3 border-b-2 transition-colors ${
                    activeTab === 'searches'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  查询历史
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'info' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">用户ID</label>
                        <p className="font-medium">{selectedUser.id}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">会员等级</label>
                        <div>{getVipBadge(selectedUser.vipStatus)}</div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">余额</label>
                        <p className="font-medium">¥{selectedUser.balance}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">积分</label>
                        <p className="font-medium text-purple-600">{selectedUser.points}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">佣金余额</label>
                        <p className="font-medium text-green-600">¥{selectedUser.commission}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">推荐码</label>
                        <p className="font-medium">{selectedUser.referralCode}</p>
                      </div>
                      {selectedUser.referredBy && (
                        <div>
                          <label className="text-sm text-gray-600">推荐人</label>
                          <p className="font-medium">{selectedUser.referredByUsername}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm text-gray-600">推荐用户数</label>
                        <p className="font-medium">{selectedUser.totalReferrals}人</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">总佣金收入</label>
                        <p className="font-medium">¥{selectedUser.totalCommission}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">搜索次数</label>
                        <p className="font-medium">{selectedUser.totalSearches}次</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">注册时间</label>
                        <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">最后登录</label>
                        <p className="font-medium">{formatDate(selectedUser.lastLoginAt)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'referrals' && (
                  <div className="space-y-4">
                    {referralUsers.map(ref => (
                      <div key={ref.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{ref.username}</h4>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {ref.level}级推荐
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>邮箱: {ref.email}</div>
                          <div>注册时间: {formatDate(ref.createdAt)}</div>
                          <div>总充值: ¥{ref.totalRecharge}</div>
                          <div>产生佣金: ¥{ref.commission}</div>
                        </div>
                      </div>
                    ))}
                    {referralUsers.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        暂无推荐用户
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'points' && (
                  <div className="space-y-3">
                    {pointsRecords.map(record => (
                      <div key={record.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{record.description}</p>
                            <p className="text-sm text-gray-500">{formatDate(record.createdAt)}</p>
                          </div>
                          <div className={`text-lg font-bold ${
                            record.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {record.amount > 0 ? '+' : ''}{record.amount}
                          </div>
                        </div>
                      </div>
                    ))}
                    {pointsRecords.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        暂无积分记录
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'commission' && (
                  <div className="space-y-3">
                    {commissionRecords.map(record => (
                      <div key={record.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{record.description}</p>
                            <p className="text-sm text-gray-500">来自: {record.fromUser}</p>
                            <p className="text-sm text-gray-500">{formatDate(record.createdAt)}</p>
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            +¥{record.amount}
                          </div>
                        </div>
                      </div>
                    ))}
                    {commissionRecords.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        暂无佣金记录
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'searches' && (
                  <div className="space-y-3">
                    {searchRecords.map(record => (
                      <div key={record.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">{record.type} - {record.query}</p>
                            <p className="text-sm text-gray-500">数据库: {record.database}</p>
                            <p className="text-sm text-gray-500">{formatDate(record.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded text-xs ${
                              record.status === 'success'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {record.status === 'success' ? '成功' : '失败'}
                            </span>
                            <p className="text-sm text-gray-600 mt-1">消耗: {record.cost}积分</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {searchRecords.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        暂无查询记录
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
