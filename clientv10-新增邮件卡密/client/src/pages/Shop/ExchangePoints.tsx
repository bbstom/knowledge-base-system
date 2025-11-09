import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coins, Wallet, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { userApi, shopApi } from '../../utils/api';

interface ExchangeRate {
  exchangeRate: number;
  description: string;
}

interface ExchangeLog {
  _id: string;
  type: string;
  currency: string;
  amount: number;
  description: string;
  createdAt: string;
}

const ExchangePoints: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [user, setUser] = useState<any>(null);
  const [amount, setAmount] = useState<string>('');
  const [exchangeLogs, setExchangeLogs] = useState<ExchangeLog[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rateRes, profileRes, logsRes] = await Promise.all([
        shopApi.getExchangeRate(),
        userApi.getProfile(),
        userApi.getBalanceLogs(1, 10)
      ]);

      if (rateRes.success) {
        setExchangeRate(rateRes.data);
      }

      if (profileRes.success) {
        setUser(profileRes.user);
      }

      if (logsRes.success) {
        const exchangeOnlyLogs = logsRes.data.logs.filter(
          (log: ExchangeLog) => log.type === 'exchange'
        );
        setExchangeLogs(exchangeOnlyLogs);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const calculateCost = (points: number): number => {
    if (!exchangeRate) return 0;
    return points / exchangeRate.exchangeRate;
  };

  const handleExchange = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setMessage({ type: 'error', text: '请输入有效的积分数量' });
      return;
    }

    const pointsAmount = parseFloat(amount);
    const cost = calculateCost(pointsAmount);

    if (user && user.balance < cost) {
      setMessage({ type: 'error', text: '余额不足' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await userApi.exchangePoints(pointsAmount);

      if (response.success) {
        setMessage({ type: 'success', text: response.message || '兑换成功' });
        setAmount('');
        // Refresh data
        await fetchData();
      } else {
        setMessage({ type: 'error', text: response.message || '兑换失败' });
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || '兑换失败，请重试'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  };

  return (
    <Layout showSidebar>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/shop')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            返回商城
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Coins className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              余额兑换积分
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            使用余额兑换积分，继续使用搜索功能
          </p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5" />
              <span className="text-sm opacity-90">当前余额</span>
            </div>
            <div className="text-3xl font-bold">
              ${user?.balance?.toFixed(2) || '0.00'}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-5 h-5" />
              <span className="text-sm opacity-90">当前积分</span>
            </div>
            <div className="text-3xl font-bold">
              {user?.points || 0}
            </div>
          </div>
        </div>

        {/* Exchange Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            兑换积分
          </h2>

          {/* Exchange Rate Info */}
          {exchangeRate && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{exchangeRate.description}</span>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              兑换积分数量
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="请输入要兑换的积分数量"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              min="1"
              step="1"
            />
          </div>

          {/* Calculation Preview */}
          {amount && parseFloat(amount) > 0 && exchangeRate && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400">兑换积分</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {parseFloat(amount)} 积分
                </span>
              </div>
              <div className="flex items-center justify-center my-2">
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">需要余额</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  ${calculateCost(parseFloat(amount)).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleExchange}
            disabled={loading || !amount || parseFloat(amount) <= 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {loading ? '兑换中...' : '确认兑换'}
          </button>
        </div>

        {/* Exchange History */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            兑换记录
          </h2>

          {exchangeLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              暂无兑换记录
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
              {exchangeLogs.map((log) => (
                <div
                  key={log._id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {log.description}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(log.createdAt)}
                    </div>
                  </div>
                  <div className={`font-semibold ${
                    log.amount > 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {log.currency === 'points' ? (
                      `+${log.amount} 积分`
                    ) : (
                      `-$${Math.abs(log.amount).toFixed(2)}`
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ExchangePoints;
