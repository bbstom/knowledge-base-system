import React, { useState, useEffect } from 'react';
import { Users, Search, Eye, Gift, DollarSign, UserPlus, Key, X, Trash2 } from 'lucide-react';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import toast from 'react-hot-toast';

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
  const [vipFilter, setVipFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'referrals' | 'points' | 'commission' | 'searches'>('info');
  
  const [referralUsers, setReferralUsers] = useState<ReferralUser[]>([]);
  const [pointsRecords, setPointsRecords] = useState<PointsRecord[]>([]);
  const [commissionRecords, setCommissionRecords] = useState<CommissionRecord[]>([]);
  const [searchRecords, setSearchRecords] = useState<SearchRecord[]>([]);
  
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, vipFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        toast.error('请先登录');
        return;
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        vipFilter: vipFilter
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('获取用户列表失败');
      }

      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
        setFilteredUsers(data.data.users);
        setTotalPages(data.data.pagination.totalPages);
        setTotalUsers(data.data.pagination.totalUsers);
      } else {
        toast.error(data.message || '获取用户列表失败');
      }
    } catch (error) {
      console.error('加载用户失败:', error);
      toast.error('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetails = async (user: User) => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        toast.error('请先登录');
        return;
      }

      const response = await fetch(`/api/admin/users/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('获取用户详情失败');
      }

      const data = await response.json();
      if (data.success) {
        setReferralUsers(data.data.referralUsers || []);
        setPointsRecords(data.data.pointsRecords || []);
        setCommissionRecords(data.data.commissionRecords || []);
        setSearchRecords(data.data.searchRecords || []);
      } else {
        toast.error(data.message || '获取用户详情失败');
      }
    } catch (error) {
      console.error('加载用户详情失败:', error);
      toast.error('加载用户详情失败');
    }
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

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('请输入新密码');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('密码至少6位');
      return;
    }

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        toast.error('请先登录');
        return;
      }

      const response = await fetch(`/api/admin/users/${selectedUser?.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });

      if (!response.ok) {
        throw new Error('重置密码失败');
      }

      const data = await response.json();
      if (data.success) {
        toast.success(`已为用户 ${selectedUser?.username} 重置密码`);
        setShowResetPasswordModal(false);
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data.message || '重置密码失败');
      }
    } catch (error) {
      console.error('重置密码失败:', error);
      toast.error('重置密码失败');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        toast.error('请先登录');
        return;
      }

      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('删除失败，状态码:', response.status);
        console.error('错误信息:', data);
        toast.error(data.message || `删除失败 (${response.status})`);
        return;
      }

      if (data.success) {
        toast.success(`用户 ${userToDelete.username} 已删除`);
        setShowDeleteModal(false);
        setUserToDelete(null);
        loadUsers(); // 重新加载用户列表
      } else {
        console.error('删除失败:', data);
        toast.error(data.message || '删除用户失败');
      }
    } catch (error) {
      console.error('删除用户失败:', error);
      toast.error('删除用户失败');
    }
  };

  const getVipBadge = (vipStatus: string) => {
    const badges: Record<string, string> = {
      none: 'bg-gray-100 text-gray-800',
      bronze: 'bg-amber-100 text-amber-800',
      silver: 'bg-gray-200 text-gray-800',
      gold: 'bg-yellow-100 text-yellow-800',
      platinum: 'bg-purple-100 text-purple-800',
      diamond: 'bg-blue-100 text-blue-800'
    };
    const labels: Record<string, string> = {
      none: '普通用户',
      bronze: '青铜会员',
      silver: '白银会员',
      gold: '黄金会员',
      platinum: '铂金会员',
      diamond: '钻石会员'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[vipStatus] || badges.none}`}>
        {labels[vipStatus] || labels.none}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">用户管理</h1>
          <p className="text-gray-600">查看和管理用户信息</p>
        </div>

        {/* Search and Filter */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="搜索用户名、邮箱、推荐码..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-field pl-10"
              />
            </div>
            <div>
              <select
                value={vipFilter}
                onChange={(e) => {
                  setVipFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-field"
              >
                <option value="all">全部用户</option>
                <option value="none">普通用户</option>
                <option value="vip">VIP用户</option>
                <option value="bronze">青铜会员</option>
                <option value="silver">白银会员</option>
                <option value="gold">黄金会员</option>
                <option value="platinum">铂金会员</option>
                <option value="diamond">钻石会员</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="card">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">总用户数</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <UserPlus className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">当前页</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
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
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        ) : (
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
                      <span className="font-medium text-green-600">¥{user.commission.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>推荐用户: {user.totalReferrals}人</div>
                    <div>总佣金: ¥{user.totalCommission.toFixed(2)}</div>
                    <div>搜索次数: {user.totalSearches}次</div>
                    <div>注册时间: {formatDate(user.createdAt)}</div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleViewDetails(user)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="查看详情"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setUserToDelete(user);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="删除用户"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
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
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="card mt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">
                  第 {currentPage} 页，共 {totalPages} 页
                </div>
                <div className="text-xs text-gray-500">
                  显示第 {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, totalUsers)} 条，共 {totalUsers} 个用户（每页10条）
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  首页
                </button>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <div className="px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded border border-blue-200">
                  {currentPage}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  末页
                </button>
              </div>
            </div>
          </div>
        )}

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
                  <div className="space-y-6">
                    {/* 重置密码按钮 */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-yellow-900 mb-1">密码管理</h4>
                          <p className="text-xs text-yellow-700">
                            如果用户忘记密码，可以在此为其重置新密码
                          </p>
                        </div>
                        <button
                          onClick={() => setShowResetPasswordModal(true)}
                          className="btn-secondary flex items-center text-sm"
                        >
                          <Key className="h-4 w-4 mr-2" />
                          重置密码
                        </button>
                      </div>
                    </div>

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
                        <p className="font-medium text-green-600">¥{selectedUser.commission.toFixed(2)}</p>
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
                        <p className="font-medium">¥{selectedUser.totalCommission.toFixed(2)}</p>
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
                          <div>总充值: ¥{ref.totalRecharge.toFixed(2)}</div>
                          <div>产生佣金: ¥{ref.commission.toFixed(2)}</div>
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
                            +¥{record.amount.toFixed(2)}
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

        {/* Reset Password Modal */}
        {showResetPasswordModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
              {/* Modal Header */}
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">重置用户密码</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    为用户 <span className="font-medium">{selectedUser.username}</span> 设置新密码
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowResetPasswordModal(false);
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    新密码 *
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field"
                    placeholder="请输入新密码（至少6位）"
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    确认新密码 *
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field"
                    placeholder="请再次输入新密码"
                    minLength={6}
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">
                    <strong>注意：</strong>重置后，用户需要使用新密码登录。建议通过安全渠道将新密码告知用户。
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowResetPasswordModal(false);
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleResetPassword}
                  className="btn-primary flex items-center"
                >
                  <Key className="h-4 w-4 mr-2" />
                  确认重置
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && userToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
              {/* Modal Header */}
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">确认删除用户</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    此操作不可撤销
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    <strong>警告：</strong>删除用户将同时删除以下数据：
                  </p>
                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                    <li>用户的所有搜索记录</li>
                    <li>用户的所有余额日志</li>
                    <li>用户的所有提现订单</li>
                    <li>用户的推荐关系（被推荐用户将失去推荐人）</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>即将删除的用户：</strong>
                  </p>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-gray-600">用户名：</span>
                      <span className="font-medium ml-2">{userToDelete.username}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">邮箱：</span>
                      <span className="font-medium ml-2">{userToDelete.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">余额：</span>
                      <span className="font-medium ml-2">¥{userToDelete.balance}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">积分：</span>
                      <span className="font-medium ml-2">{userToDelete.points}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  请确认是否要删除用户 <strong>{userToDelete.username}</strong>？
                </p>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                  }}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  确认删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
