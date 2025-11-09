import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Wallet, ArrowUpRight, Filter } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { userApi, withdrawApi } from '../../utils/api';
import { t } from '../../utils/i18n';
import toast from 'react-hot-toast';

export const Commission: React.FC = () => {
  const [commissionData, setCommissionData] = useState<{
    totalCommission: number;
    availableCommission: number;
    pendingCommission: number;
    totalWithdrawn: number;
    commissionHistory: any[];
  }>({
    totalCommission: 0,
    availableCommission: 0,
    pendingCommission: 0,
    totalWithdrawn: 0,
    commissionHistory: []
  });
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, income, withdraw

  useEffect(() => {
    loadCommissionData();
  }, []);

  const loadCommissionData = async () => {
    try {
      const [commissionResponse, profileResponse] = await Promise.all([
        userApi.getCommissions() as any,
        userApi.getProfile() as any
      ]);

      if (commissionResponse?.success && profileResponse?.success) {
        const data = commissionResponse.data || {};
        const user = profileResponse.data?.user || {};
        
        setCommissionData({
          totalCommission: data.totalCommission || 0,
          availableCommission: user.commission || 0, // 从用户信息中获取当前可用佣金
          pendingCommission: data.pendingCommission || 0,
          totalWithdrawn: (data.totalCommission || 0) - (user.commission || 0), // 总佣金 - 当前佣金 = 已提现
          commissionHistory: Array.isArray(data.commissions) ? data.commissions : []
        });
      }
    } catch (error) {
      console.error('Failed to load commission data:', error);
      toast.error('加载佣金数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !walletAddress) {
      toast.error('请填写提现金额和钱包地址');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount <= 0 || amount > commissionData.availableCommission) {
      toast.error('提现金额无效');
      return;
    }

    if (amount < 10) {
      toast.error('最低提现金额为10元');
      return;
    }

    setWithdrawing(true);
    try {
      const response = await withdrawApi.createWithdraw(amount, walletAddress) as any;
      if (response?.success) {
        toast.success('提现申请已提交，请等待审核');
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        setWalletAddress('');
        loadCommissionData();
      } else {
        toast.error(response?.message || '提现申请失败');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '提现申请失败');
    } finally {
      setWithdrawing(false);
    }
  };

  const filteredHistory = (commissionData.commissionHistory || []).filter((record: any) => {
    if (filter === 'all') return true;
    if (filter === 'income') return record.amount > 0;
    if (filter === 'withdraw') return record.amount < 0;
    return true;
  });

  if (loading) {
    return (
      <Layout showSidebar>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">{t('common.loading')}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            佣金管理
          </h1>
          <p className="text-gray-600">
            查看佣金收入和提现记录
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总佣金</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${commissionData.totalCommission.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">可提现</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${commissionData.availableCommission.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">待结算</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${commissionData.pendingCommission.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <ArrowUpRight className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已提现</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${commissionData.totalWithdrawn.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Withdraw Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={commissionData.availableCommission < 10}
            className="btn-primary flex items-center"
          >
            <Wallet className="h-5 w-5 mr-2" />
            申请提现
          </button>
          {commissionData.availableCommission < 10 && (
            <p className="text-sm text-gray-500 mt-2">
              最低提现金额为10元
            </p>
          )}
        </div>

        {/* Commission History */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              佣金记录
            </h3>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-field w-auto"
              >
                <option value="all">全部</option>
                <option value="income">收入</option>
                <option value="withdraw">支出</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">类型</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">来源用户</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">金额</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">状态</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">时间</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((record: any, index) => (
                    <tr key={record._id || index} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {record.description || '佣金收入'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {record.relatedUserId ? '推荐用户' : '系统'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${record.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {record.amount > 0 ? '+' : ''}${Math.abs(record.amount || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          已结算
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(record.createdAt || Date.now()).toLocaleDateString('zh-CN')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      暂无佣金记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                申请提现
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    提现金额 (USDT)
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="请输入提现金额"
                    min="10"
                    max={commissionData.availableCommission}
                    className="input-field"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    可提现金额: ${commissionData.availableCommission.toFixed(2)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    USDT 钱包地址
                  </label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="请输入USDT钱包地址"
                    className="input-field"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    请确保钱包地址正确，错误地址可能导致资金丢失
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="btn-secondary flex-1"
                >
                  取消
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={withdrawing}
                  className="btn-primary flex-1"
                >
                  {withdrawing ? '提交中...' : '确认提现'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};