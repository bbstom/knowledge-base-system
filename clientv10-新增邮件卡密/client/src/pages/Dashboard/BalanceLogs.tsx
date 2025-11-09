import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout/Layout';
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../utils/api';
import toast from 'react-hot-toast';

interface BalanceLog {
  _id: string;
  type: 'recharge' | 'consume' | 'refund' | 'reward' | 'commission' | 'vip' | 'search' | 'exchange' | 'withdraw' | 'commission_to_balance';
  currency: 'points' | 'balance' | 'commission';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
  relatedUserId?: string;
}

export const BalanceLogs: React.FC = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<BalanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currencyFilter, setCurrencyFilter] = useState<'all' | 'points' | 'balance' | 'commission'>('all');

  useEffect(() => {
    loadLogs();
  }, [page]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await userApi.getBalanceLogs(page, 20);
      
      if (response.success) {
        if (page === 1) {
          setLogs(response.data.logs || []);
        } else {
          setLogs(prev => [...prev, ...(response.data.logs || [])]);
        }
        
        setHasMore(response.data.hasMore || false);
      }
    } catch (error: any) {
      toast.error(error.message || '加载记录失败');
    } finally {
      setLoading(false);
    }
  };

  const getCurrencyLabel = (currency: string) => {
    switch (currency) {
      case 'points':
        return '积分';
      case 'balance':
        return '余额';
      case 'commission':
        return '佣金';
      default:
        return '积分';
    }
  };

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'recharge':
        return { label: '充值积分', color: 'text-green-600', icon: TrendingUp };
      case 'consume':
        return { label: '消费', color: 'text-red-600', icon: TrendingDown };
      case 'refund':
        return { label: '退款', color: 'text-blue-600', icon: TrendingUp };
      case 'commission':
        return { label: '推荐佣金', color: 'text-purple-600', icon: TrendingUp };
      case 'vip':
        return { label: 'VIP充值', color: 'text-yellow-600', icon: TrendingUp };
      case 'search':
        return { label: '搜索消费', color: 'text-red-600', icon: TrendingDown };
      case 'exchange':
        return { label: '余额兑换', color: 'text-blue-600', icon: RefreshCw };
      case 'withdraw':
        return { label: '提现', color: 'text-orange-600', icon: TrendingDown };
      case 'commission_to_balance':
        return { label: '佣金转余额', color: 'text-indigo-600', icon: RefreshCw };
      default:
        return { label: '其他', color: 'text-gray-600', icon: TrendingUp };
    }
  };

  const filteredLogs = currencyFilter === 'all' 
    ? logs 
    : logs.filter(log => log.currency === currencyFilter);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout showSidebar>
      <div className="p-6">
        {/* 头部 */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            返回
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">资产记录</h1>
              <p className="text-gray-600">查看您的积分、余额、佣金变动历史</p>
            </div>
            
            <button
              onClick={() => {
                setPage(1);
                loadLogs();
              }}
              disabled={loading}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </button>
          </div>
        </div>

        {/* 货币过滤器 */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setCurrencyFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currencyFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setCurrencyFilter('points')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currencyFilter === 'points'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            积分
          </button>
          <button
            onClick={() => setCurrencyFilter('balance')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currencyFilter === 'balance'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            余额
          </button>
          <button
            onClick={() => setCurrencyFilter('commission')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currencyFilter === 'commission'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            佣金
          </button>
        </div>

        {/* 记录列表 */}
        <div className="card">
          {loading && logs.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw className="h-12 w-12 text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">加载中...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">暂无记录</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredLogs.map((log) => {
                const typeInfo = getTypeInfo(log.type);
                const Icon = typeInfo.icon;
                const isPositive = log.amount > 0;
                const currencyLabel = getCurrencyLabel(log.currency);
                
                return (
                  <div key={log._id} className="py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          isPositive ? 'bg-green-50' : 'bg-red-50'
                        }`}>
                          <Icon className={`h-5 w-5 ${typeInfo.color}`} />
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {log.description}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              isPositive 
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {typeInfo.label}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              log.currency === 'points' 
                                ? 'bg-blue-100 text-blue-700'
                                : log.currency === 'balance'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {currencyLabel}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDate(log.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-lg font-semibold ${
                          isPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {isPositive ? '+' : ''}
                          {log.currency === 'points' 
                            ? log.amount 
                            : `¥${Math.abs(log.amount).toFixed(2)}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {currencyLabel}: {log.currency === 'points' 
                            ? log.balanceAfter 
                            : `¥${log.balanceAfter.toFixed(2)}`}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* 加载更多 */}
          {hasMore && logs.length > 0 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={loading}
                className="btn-secondary"
              >
                {loading ? '加载中...' : '加载更多'}
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
