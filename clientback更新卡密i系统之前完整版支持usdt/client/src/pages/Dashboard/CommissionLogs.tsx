import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout/Layout';
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../utils/api';
import toast from 'react-hot-toast';

interface CommissionLog {
  _id: string;
  type: string;
  currency: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  relatedUserId?: string;
  createdAt: string;
}

export const CommissionLogs: React.FC = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<CommissionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCommission, setTotalCommission] = useState(0);
  const [currentCommission, setCurrentCommission] = useState(0);

  useEffect(() => {
    loadLogs();
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await userApi.getProfile();
      if (response.success) {
        setCurrentCommission(response.data.user.commission || 0);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await userApi.getCommissionLogs(1, 50);
      
      if (response.success) {
        // 过滤出佣金相关的记录
        const commissionLogs = response.data.logs.filter(
          (log: CommissionLog) => log.currency === 'commission'
        );
        setLogs(commissionLogs);
        
        // 计算总佣金
        const total = commissionLogs
          .filter((log: CommissionLog) => log.amount > 0)
          .reduce((sum: number, log: CommissionLog) => sum + log.amount, 0);
        setTotalCommission(total);
      }
    } catch (error: any) {
      toast.error(error.message || '加载记录失败');
    } finally {
      setLoading(false);
    }
  };

  const getTypeInfo = (type: string, amount: number) => {
    if (amount > 0) {
      return { 
        label: '获得佣金', 
        color: 'text-green-600', 
        icon: TrendingUp,
        bgColor: 'bg-green-50'
      };
    } else {
      if (type === 'withdraw') {
        return { 
          label: '提现', 
          color: 'text-orange-600', 
          icon: TrendingDown,
          bgColor: 'bg-orange-50'
        };
      } else if (type === 'commission_to_balance') {
        return { 
          label: '转入余额', 
          color: 'text-blue-600', 
          icon: RefreshCw,
          bgColor: 'bg-blue-50'
        };
      }
    }
    return { 
      label: '其他', 
      color: 'text-gray-600', 
      icon: TrendingUp,
      bgColor: 'bg-gray-50'
    };
  };

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
              <h1 className="text-2xl font-bold text-gray-900">佣金记录</h1>
              <p className="text-gray-600">查看您的推荐佣金收益</p>
            </div>
            
            <button
              onClick={loadLogs}
              disabled={loading}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">当前佣金</p>
                <p className="text-3xl font-bold">¥{currentCommission.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <TrendingUp className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">累计获得</p>
                <p className="text-3xl font-bold">¥{totalCommission.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <TrendingUp className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>

        {/* 记录列表 */}
        <div className="card">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-12 w-12 text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">加载中...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">暂无佣金记录</p>
              <p className="text-sm text-gray-500 mt-2">邀请好友充值即可获得推荐佣金</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {logs.map((log) => {
                const typeInfo = getTypeInfo(log.type, log.amount);
                const Icon = typeInfo.icon;
                const isPositive = log.amount > 0;
                
                return (
                  <div key={log._id} className="py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${typeInfo.bgColor}`}>
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
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {typeInfo.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-gray-500">
                              {formatDate(log.createdAt)}
                            </p>
                            {log.relatedUserId && (
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <User className="h-3 w-3" />
                                推荐用户
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-lg font-semibold ${
                          isPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {isPositive ? '+' : ''}¥{Math.abs(log.amount).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          余额: ¥{log.balanceAfter.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
