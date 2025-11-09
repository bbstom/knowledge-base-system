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
  const [withdrawHistory, setWithdrawHistory] = useState<any[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [withdrawType, setWithdrawType] = useState<'balance' | 'usdt'>('balance');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, income, withdraw
  const [systemConfig, setSystemConfig] = useState<{
    minWithdrawAmountBalance: number;
    minWithdrawAmountUsdt: number;
  }>({
    minWithdrawAmountBalance: 1,
    minWithdrawAmountUsdt: 10
  });

  useEffect(() => {
    loadSystemConfig();
    loadCommissionData();
  }, []);

  const loadSystemConfig = async () => {
    try {
      const response = await fetch('/api/system-config/public-config');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setSystemConfig({
            minWithdrawAmountBalance: result.data.withdraw?.minWithdrawAmountBalance || 1,
            minWithdrawAmountUsdt: result.data.withdraw?.minWithdrawAmount || 10
          });
        }
      }
    } catch (error) {
      console.error('获取系统配置失败:', error);
    }
  };

  const loadCommissionData = async () => {
    try {
      // 分别获取数据，避免一个失败导致全部失败
      const commissionResponse = await userApi.getCommissions() as any;
      const profileResponse = await userApi.getProfile() as any;
      
      // 提现记录可能失败，使用try-catch单独处理
      let withdrawResponse: any = null;
      try {
        withdrawResponse = await withdrawApi.getWithdrawHistory(1, 100, 'commission') as any;
      } catch (withdrawError) {
        console.warn('Failed to load withdraw history:', withdrawError);
        // 提现记录加载失败不影响佣金数据显示
      }

      if (commissionResponse?.success && profileResponse?.success) {
        const data = commissionResponse.data || {};
        const withdrawData = withdrawResponse?.data || {};
        
        // 使用 API 返回的佣金数据（从 BalanceLog 计算的准确值）
        const totalCommission = data.totalCommission || 0;
        const availableCommission = data.availableCommission || 0;
        const totalWithdrawn = data.totalWithdrawn || 0;
        
        // 从提现订单中计算待结算
        const withdrawOrders = Array.isArray(withdrawData.withdrawals) ? withdrawData.withdrawals : [];
        
        // 保存提现记录
        setWithdrawHistory(withdrawOrders);
        
        // 待结算：pending和processing状态的提现订单
        const pendingAmount = withdrawOrders
          .filter((order: any) => ['pending', 'processing'].includes(order.status))
          .reduce((sum: number, order: any) => sum + (order.amount || 0), 0);
        
        setCommissionData({
          totalCommission: totalCommission,
          availableCommission: availableCommission,
          pendingCommission: pendingAmount,
          totalWithdrawn: totalWithdrawn,
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
    // 验证金额
    if (!withdrawAmount) {
      toast.error('请填写提现金额');
      return;
    }

    // 验证 USDT 钱包地址
    if (withdrawType === 'usdt' && !walletAddress) {
      toast.error('请填写USDT钱包地址');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('请输入有效的提现金额');
      return;
    }

    if (amount > commissionData.availableCommission) {
      toast.error('提现金额超过可用佣金');
      return;
    }

    // 最低提现金额检查（从系统配置获取）
    const minAmount = withdrawType === 'balance' 
      ? systemConfig.minWithdrawAmountBalance 
      : systemConfig.minWithdrawAmountUsdt;
    const withdrawTypeName = withdrawType === 'balance' ? '余额账户' : 'USDT钱包';
    
    if (amount < minAmount) {
      toast.error(
        `提现到${withdrawTypeName}的最低金额为 $${minAmount.toFixed(2)}`,
        {
          duration: 5000,
          position: 'top-center'
        }
      );
      return;
    }

    setWithdrawing(true);
    try {
      let response;
      
      if (withdrawType === 'balance') {
        // 提现到余额 - 即时到账
        response = await withdrawApi.withdrawToBalance(amount) as any;
      } else {
        // 提现到 USDT - 需要审核
        response = await withdrawApi.withdrawCommission(amount, 'usdt', walletAddress) as any;
      }
      
      if (response?.success) {
        if (withdrawType === 'balance') {
          toast.success('提现成功！已转入余额账户');
        } else {
          toast.success('提现申请已提交，请等待审核');
        }
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        setWalletAddress('');
        loadCommissionData();
      } else {
        toast.error(response?.message || '提现失败');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || '提现失败');
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
            disabled={commissionData.availableCommission < systemConfig.minWithdrawAmountBalance}
            className="btn-primary flex items-center"
          >
            <Wallet className="h-5 w-5 mr-2" />
            申请提现
          </button>
          {commissionData.availableCommission < systemConfig.minWithdrawAmountBalance && (
            <p className="text-sm text-gray-500 mt-2">
              最低提现金额：余额 ${systemConfig.minWithdrawAmountBalance.toFixed(2)} / USDT ${systemConfig.minWithdrawAmountUsdt.toFixed(2)}
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

        {/* Withdraw History */}
        <div className="card mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            提现记录
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">订单号</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">金额</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">手续费</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">实际到账</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">状态</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">时间</th>
                </tr>
              </thead>
              <tbody>
                {withdrawHistory.length > 0 ? (
                  withdrawHistory.map((record: any) => (
                    <tr key={record._id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm text-gray-900 font-mono">
                        {record.orderNo}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">
                          ${record.amount?.toFixed(2) || '0.00'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        ${record.fee?.toFixed(2) || '0.00'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-green-600">
                          ${record.actualAmount?.toFixed(2) || '0.00'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {record.status === 'pending' && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            待审核
                          </span>
                        )}
                        {record.status === 'completed' && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            已完成
                          </span>
                        )}
                        {record.status === 'rejected' && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            已拒绝
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(record.createdAt).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      暂无提现记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 提现详情展开 */}
          {withdrawHistory.length > 0 && (
            <div className="mt-4 text-sm text-gray-500">
              <p>提示：</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>待审核：管理员正在审核您的提现申请</li>
                <li>已完成：提现已成功，请查看您的钱包</li>
                <li>已拒绝：提现被拒绝，佣金已退还到您的账户</li>
              </ul>
            </div>
          )}
        </div>

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                申请提现
              </h3>
              
              <div className="space-y-4">
                {/* 提现方式选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    提现方式
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setWithdrawType('balance')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        withdrawType === 'balance'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Wallet className={`w-6 h-6 mx-auto mb-2 ${
                        withdrawType === 'balance' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div className="font-medium text-sm">余额账户</div>
                      <div className="text-xs text-gray-500 mt-1">
                        即时到账
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setWithdrawType('usdt')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        withdrawType === 'usdt'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <DollarSign className={`w-6 h-6 mx-auto mb-2 ${
                        withdrawType === 'usdt' ? 'text-green-600' : 'text-gray-400'
                      }`} />
                      <div className="font-medium text-sm">USDT 钱包</div>
                      <div className="text-xs text-gray-500 mt-1">
                        需要审核
                      </div>
                    </button>
                  </div>
                </div>

                {/* 提现金额 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    提现金额 {withdrawType === 'usdt' ? '(USDT)' : '(余额)'}
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder={`请输入提现金额 (可用: ${commissionData.availableCommission.toFixed(2)})`}
                    min={withdrawType === 'balance' 
                      ? systemConfig.minWithdrawAmountBalance.toString() 
                      : systemConfig.minWithdrawAmountUsdt.toString()}
                    max={commissionData.availableCommission}
                    step="0.01"
                    className="input-field"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    可提现金额: ${commissionData.availableCommission.toFixed(2)} | 
                    最低: ${withdrawType === 'balance' 
                      ? systemConfig.minWithdrawAmountBalance.toFixed(2) 
                      : systemConfig.minWithdrawAmountUsdt.toFixed(2)}
                  </p>
                </div>

                {/* 只有选择 USDT 时才显示钱包地址 */}
                {withdrawType === 'usdt' && (
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
                )}
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