import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout/Layout';
import { 
  ShoppingBag, 
  Search, 
  DollarSign, 
  ArrowUpRight,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { userApi } from '../../utils/api';
import toast from 'react-hot-toast';

interface Order {
  _id: string;
  orderId: string;
  type: string;
  amount: number;
  actualAmount: number;
  currency: string;
  status: string;
  points?: number;
  vipDays?: number;
  createdAt: string;
  paidAt?: string;
}

interface SearchLog {
  _id: string;
  type: string;
  query: string;
  pointsCost: number;
  resultCount: number;
  createdAt: string;
}

interface WithdrawRecord {
  _id: string;
  amount: number;
  walletAddress: string;
  status: string;
  createdAt: string;
}

export const Orders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'recharge' | 'search' | 'withdraw'>('recharge');
  const [rechargeOrders, setRechargeOrders] = useState<Order[]>([]);
  const [searchLogs, setSearchLogs] = useState<SearchLog[]>([]);
  const [withdrawRecords, setWithdrawRecords] = useState<WithdrawRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRecharge: 0,
    totalSearch: 0,
    totalWithdraw: 0,
    orderCount: 0
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = document.cookie.split('token=')[1]?.split(';')[0];
      
      if (!token) {
        toast.error('请先登录');
        return;
      }

      if (activeTab === 'recharge') {
        const response = await fetch('/api/recharge/history?page=1&limit=15', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.orders) {
          setRechargeOrders(data.orders);
          const total = data.orders
            .filter((o: Order) => o.status === 'paid')
            .reduce((sum: number, o: Order) => sum + o.amount, 0);
          setStats(prev => ({ ...prev, totalRecharge: total, orderCount: data.orders.length }));
        } else {
          setRechargeOrders([]);
        }
      } else if (activeTab === 'search') {
        const response = await userApi.getSearchHistory(1, 50);
        if (response.success && response.data?.history) {
          setSearchLogs(response.data.history);
          const total = response.data.history.reduce((sum: number, log: SearchLog) => sum + (log.pointsCost || 0), 0);
          setStats(prev => ({ ...prev, totalSearch: total }));
        } else {
          setSearchLogs([]);
        }
      } else if (activeTab === 'withdraw') {
        const response = await fetch('/api/withdraw/history?page=1&limit=15', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.data?.withdrawals) {
          setWithdrawRecords(data.data.withdrawals);
          const total = data.data.withdrawals
            .filter((w: WithdrawRecord) => w.status === 'completed')
            .reduce((sum: number, w: WithdrawRecord) => sum + w.amount, 0);
          setStats(prev => ({ ...prev, totalWithdraw: total }));
        } else {
          setWithdrawRecords([]);
        }
      }
    } catch (error) {
      console.error('Load data error:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: '待支付', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      paid: { label: '已完成', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      expired: { label: '已过期', color: 'bg-gray-100 text-gray-800', icon: XCircle },
      completed: { label: '已完成', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      processing: { label: '处理中', color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
      rejected: { label: '已拒绝', color: 'bg-red-100 text-red-800', icon: XCircle },
    };

    const config = statusMap[status] || statusMap.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  return (
    <Layout showSidebar>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            订单中心
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            查看您的充值、消费和提现记录
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总充值</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${stats.totalRecharge.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Search className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总消费</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalSearch} 积分
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <ArrowUpRight className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总提现</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${stats.totalWithdraw.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">订单数</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.orderCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('recharge')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'recharge'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <ShoppingBag className="h-5 w-5" />
            充值记录
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'search'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Search className="h-5 w-5" />
            消费记录
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'withdraw'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <ArrowUpRight className="h-5 w-5" />
            提现记录
          </button>
        </div>

        {/* Content */}
        <div className="card">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-12 w-12 text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">加载中...</p>
            </div>
          ) : (
            <>
              {/* Recharge Orders */}
              {activeTab === 'recharge' && (
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">订单号</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">类型</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">金额</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">获得</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">状态</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rechargeOrders.length > 0 ? (
                        rechargeOrders.map((order) => (
                          <tr key={order._id} className="border-b border-gray-100 dark:border-gray-800">
                            <td className="py-3 px-4 text-gray-900 dark:text-white font-mono text-sm">
                              {order.orderId}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                {order.type === 'points' ? '积分充值' : 'VIP充值'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-900 dark:text-white">
                              ${order.amount.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-gray-900 dark:text-white">
                              {order.points ? `${order.points} 积分` : `${order.vipDays} 天VIP`}
                            </td>
                            <td className="py-3 px-4">
                              {getStatusBadge(order.status)}
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                              {formatDate(order.createdAt)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                            暂无充值记录
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Search Logs */}
              {activeTab === 'search' && (
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">搜索类型</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">查询内容</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">消耗积分</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">结果数</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchLogs.length > 0 ? (
                        searchLogs.map((log) => {
                          // 搜索类型映射
                          const typeMap: Record<string, string> = {
                            'phone': '手机号',
                            'idcard': '身份证',
                            'name': '姓名',
                            'email': '邮箱',
                            'address': '地址',
                            'company': '公司',
                            'vehicle': '车辆',
                            'other': '其他'
                          };
                          const typeLabel = typeMap[log.type] || log.type || '未知';
                          
                          return (
                            <tr key={log._id} className="border-b border-gray-100 dark:border-gray-800">
                              <td className="py-3 px-4">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                                  {typeLabel}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-900 dark:text-white">
                                {log.query || 'N/A'}
                              </td>
                              <td className="py-3 px-4 text-gray-900 dark:text-white">
                                {log.pointsCost || 0} 积分
                              </td>
                              <td className="py-3 px-4 text-gray-900 dark:text-white">
                                {log.resultCount || 0} 条
                              </td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                {formatDate(log.createdAt)}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                            暂无消费记录
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Withdraw Records */}
              {activeTab === 'withdraw' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">金额</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">钱包地址</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">状态</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawRecords.length > 0 ? (
                        withdrawRecords.map((record) => (
                          <tr key={record._id} className="border-b border-gray-100 dark:border-gray-800">
                            <td className="py-3 px-4 text-gray-900 dark:text-white">
                              ${record.amount.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-gray-900 dark:text-white font-mono text-sm">
                              {record.walletAddress.substring(0, 10)}...{record.walletAddress.substring(record.walletAddress.length - 10)}
                            </td>
                            <td className="py-3 px-4">
                              {getStatusBadge(record.status)}
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                              {formatDate(record.createdAt)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-gray-500 dark:text-gray-400">
                            暂无提现记录
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};
