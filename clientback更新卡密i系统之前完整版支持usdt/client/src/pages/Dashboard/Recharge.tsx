import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout/Layout';
import { 
  Clock, CheckCircle, XCircle,
  Copy, AlertCircle, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { useLocation } from 'react-router-dom';

interface RechargeOrder {
  orderId: string;
  amount: number;
  actualAmount: number;
  currency: 'USDT' | 'TRX';
  address: string;
  status: 'pending' | 'paid' | 'expired' | 'failed';
  createdAt: string;
  expireAt: string;
  txHash?: string;
}

export const Recharge: React.FC = () => {
  const location = useLocation();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'USDT' | 'TRX'>('USDT');
  const [currentOrder, setCurrentOrder] = useState<RechargeOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [rechargeHistory, setRechargeHistory] = useState<RechargeOrder[]>([]);

  // 预设金额
  const presetAmounts = [10, 50, 100, 200, 500, 1000];

  // 实时汇率状态
  const [exchangeRates, setExchangeRates] = useState({
    USDT: 1.0,   // 1 USD = 1 USDT (稳定币 1:1)
    TRX: 6.25    // 1 USD ≈ 6.25 TRX (默认值)
  });
  const [rateLoading, setRateLoading] = useState(false);
  const [lastRateUpdate, setLastRateUpdate] = useState<string | null>(null);

  // 套餐信息状态
  const [packageInfo, setPackageInfo] = useState<any>(null);

  useEffect(() => {
    loadRechargeHistory();
    loadExchangeRates(); // 加载实时汇率
    
    // 检查是否从充值中心传递了套餐信息
    const state = location.state as any;
    if (state?.packageInfo) {
      // 设置套餐信息，显示支付方式选择
      setPackageInfo(state.packageInfo);
      setAmount(state.packageInfo.amount.toString());
    }
  }, [location]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentOrder && currentOrder.status === 'pending') {
      // 每5秒检查一次订单状态
      timer = setInterval(() => {
        checkOrderStatus(currentOrder.orderId);
      }, 5000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentOrder]);

  const loadRechargeHistory = () => {
    // 模拟数据
    const mockHistory: RechargeOrder[] = [
      {
        orderId: 'ORDER20241019001',
        amount: 100,
        actualAmount: 13.89,
        currency: 'USDT',
        address: 'TXxx1234567890abcdefghijklmnopqrst',
        status: 'paid',
        createdAt: '2024-10-19T10:30:00Z',
        expireAt: '2024-10-19T10:45:00Z',
        txHash: '0xabcdef1234567890'
      }
    ];
    setRechargeHistory(mockHistory);
  };

  // 加载实时汇率
  const loadExchangeRates = async () => {
    try {
      const response = await fetch('/api/exchange-rate');
      const data = await response.json();
      
      if (data.success && data.rates) {
        setExchangeRates(data.rates);
        setLastRateUpdate(data.lastUpdate);
        console.log('✅ 实时汇率加载成功:', data.rates);
      }
    } catch (error) {
      console.error('加载汇率失败:', error);
      toast.error('加载汇率失败，使用默认汇率');
    }
  };

  // 刷新汇率
  const refreshExchangeRates = async () => {
    setRateLoading(true);
    try {
      const response = await fetch('/api/exchange-rate/refresh', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success && data.rates) {
        setExchangeRates(data.rates);
        setLastRateUpdate(data.lastUpdate);
        toast.success('汇率已更新');
        console.log('✅ 汇率刷新成功:', data.rates);
      } else {
        toast.error('刷新汇率失败');
      }
    } catch (error) {
      console.error('刷新汇率失败:', error);
      toast.error('刷新汇率失败');
    } finally {
      setRateLoading(false);
    }
  };

  const calculateCryptoAmount = (usdAmount: number, crypto: 'USDT' | 'TRX') => {
    // USD 金额 × 汇率 = 加密货币数量
    return (usdAmount * exchangeRates[crypto]).toFixed(2);
  };

  const handleCreateOrder = async () => {
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum < 1) {
      toast.error('充值金额不能低于$1');
      return;
    }

    setLoading(true);
    try {
      // 获取token
      const token = document.cookie.split('token=')[1]?.split(';')[0];
      
      // 构建请求数据
      const requestData: any = {
        amount: amountNum,
        currency
      };

      // 如果是套餐购买，添加套餐信息
      if (packageInfo) {
        requestData.type = packageInfo.type;
        if (packageInfo.type === 'points') {
          requestData.points = packageInfo.points;
        } else if (packageInfo.type === 'vip') {
          requestData.vipDays = packageInfo.days;
          requestData.vipPackageName = packageInfo.name;
        }
      } else {
        requestData.type = 'balance';
      }
      
      // 调用后端API创建订单
      const response = await fetch('/api/recharge/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (data.success) {
        const order: RechargeOrder = {
          orderId: data.order.orderId,
          amount: data.order.amount,
          actualAmount: data.order.actualAmount,
          currency: data.order.currency,
          address: data.order.paymentAddress,
          status: data.order.status,
          createdAt: new Date().toISOString(),
          expireAt: data.order.expireAt,
        };

        setCurrentOrder(order);
        toast.success('订单创建成功，请完成支付');
      } else {
        toast.error(data.message || '创建订单失败');
      }
    } catch (error) {
      console.error('Create order error:', error);
      toast.error('创建订单失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const checkOrderStatus = async (orderId: string) => {
    if (checking) return;
    
    setChecking(true);
    try {
      // 调用后端API查询订单状态
      const response = await fetch(`/api/recharge/query/${orderId}`);
      const data = await response.json();

      if (data.success && data.order.status === 'paid') {
        setCurrentOrder(prev => prev ? { 
          ...prev, 
          status: 'paid', 
          txHash: data.order.txHash 
        } : null);
        toast.success('支付成功！余额已到账');
        loadRechargeHistory();
      }
    } catch (error) {
      console.error('Check order error:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleCopyAddress = () => {
    if (currentOrder) {
      navigator.clipboard.writeText(currentOrder.address);
      toast.success('地址已复制');
    }
  };

  const handleCopyAmount = () => {
    if (currentOrder) {
      navigator.clipboard.writeText(currentOrder.actualAmount.toString());
      toast.success('金额已复制');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: '待支付' },
      paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: '已支付' },
      expired: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: '已过期' },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle, label: '支付失败' }
    };
    const badge = badges[status as keyof typeof badges];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.label}
      </span>
    );
  };

  const getRemainingTime = (expireAt: string) => {
    const now = new Date().getTime();
    const expire = new Date(expireAt).getTime();
    const diff = expire - now;
    
    if (diff <= 0) return '已过期';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Layout showSidebar>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {packageInfo ? (packageInfo.type === 'points' ? '购买积分' : '购买VIP') : '账户充值'}
          </h1>
          <p className="text-gray-600 mt-1">
            {packageInfo ? '确认套餐信息并选择支付方式' : '使用USDT或TRX充值账户余额'}
          </p>
        </div>

        {/* 套餐信息显示 */}
        {packageInfo && !currentOrder && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {packageInfo.type === 'points' ? `${packageInfo.points} 积分` : packageInfo.name}
                  </h3>
                  <div className="flex items-center space-x-4">
                    {packageInfo.originalAmount && packageInfo.originalAmount > packageInfo.amount && (
                      <span className="text-gray-500 line-through">${packageInfo.originalAmount.toFixed(2)}</span>
                    )}
                    <span className="text-2xl font-bold text-blue-600">${packageInfo.amount.toFixed(2)}</span>
                    {packageInfo.originalAmount && packageInfo.originalAmount > packageInfo.amount && (
                      <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-1 rounded">
                        省${(packageInfo.originalAmount - packageInfo.amount).toFixed(2)}
                      </span>
                    )}
                  </div>
                  {packageInfo.type === 'vip' && packageInfo.features && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">套餐特权：</p>
                      <div className="flex flex-wrap gap-2">
                        {packageInfo.features.map((feature: string, index: number) => (
                          <span key={index} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {!currentOrder ? (
          <div className="max-w-2xl mx-auto">
            {/* 充值表单 */}
            <div className="card mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {packageInfo ? '选择支付方式' : '选择充值金额'}
              </h2>
              
              {/* 如果没有套餐信息，显示金额选择 */}
              {!packageInfo && (
                <>
                  {/* 预设金额 */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {presetAmounts.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setAmount(preset.toString())}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          amount === preset.toString()
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-lg font-bold">${preset}</div>
                      </button>
                    ))}
                  </div>

                  {/* 自定义金额 */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      自定义金额（最低$1）
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="input-field pl-8"
                        placeholder="请输入充值金额"
                        min="1"
                        step="0.01"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* 选择币种 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    选择支付币种
                  </label>
                  <button
                    onClick={refreshExchangeRates}
                    disabled={rateLoading}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center"
                  >
                    <RefreshCw className={`h-3 w-3 mr-1 ${rateLoading ? 'animate-spin' : ''}`} />
                    {rateLoading ? '更新中...' : '刷新汇率'}
                  </button>
                </div>
                {lastRateUpdate && (
                  <p className="text-xs text-gray-500 mb-2">
                    汇率更新时间: {new Date(lastRateUpdate).toLocaleString('zh-CN')}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setCurrency('USDT')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      currency === 'USDT'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">USDT (TRC20)</div>
                    <div className="text-sm text-gray-600 mt-1">
                      汇率: $1 ≈ {exchangeRates.USDT.toFixed(2)} USDT
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      ✓ 实时汇率
                    </div>
                  </button>
                  <button
                    onClick={() => setCurrency('TRX')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      currency === 'TRX'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">TRX (TRC20)</div>
                    <div className="text-sm text-gray-600 mt-1">
                      汇率: $1 ≈ {exchangeRates.TRX.toFixed(2)} TRX
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      ✓ 实时汇率
                    </div>
                  </button>
                </div>
              </div>

              {/* 金额预览 */}
              {amount && parseFloat(amount) >= 1 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">充值金额：</span>
                    <span className="font-bold text-gray-900">${amount}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-700">需支付：</span>
                    <span className="font-bold text-blue-600">
                      {calculateCryptoAmount(parseFloat(amount), currency)} {currency}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleCreateOrder}
                disabled={loading || !amount || parseFloat(amount) < 1}
                className="btn-primary w-full"
              >
                {loading ? '创建订单中...' : '立即充值'}
              </button>
            </div>

            {/* 充值说明 */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
                充值说明
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>支持USDT (TRC20) 和 TRX (TRC20) 充值</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>最低充值金额为$1 USD</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>订单有效期为15分钟，请在有效期内完成支付</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>支付成功后，余额将在1-3分钟内自动到账</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">⚠</span>
                  <span className="text-red-600 font-medium">请务必使用TRC20网络转账，其他网络将无法到账且无法退回</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>如有问题，请联系客服处理</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {/* 支付信息 */}
            <div className="card mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">支付信息</h2>
                {getStatusBadge(currentOrder.status)}
              </div>

              {currentOrder.status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                    <div>
                      <p className="font-medium text-yellow-800">等待支付</p>
                      <p className="text-sm text-yellow-700">
                        剩余时间: {getRemainingTime(currentOrder.expireAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentOrder.status === 'paid' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="font-medium text-green-800">支付成功</p>
                      <p className="text-sm text-green-700">余额已到账，感谢您的充值</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    订单号
                  </label>
                  <div className="text-gray-900 font-mono">{currentOrder.orderId}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    充值金额
                  </label>
                  <div className="text-gray-900">${currentOrder.amount.toFixed(2)}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    支付金额
                  </label>
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <span className="text-lg font-bold text-blue-600">
                      {currentOrder.actualAmount} {currentOrder.currency}
                    </span>
                    <button
                      onClick={handleCopyAmount}
                      className="btn-secondary text-sm flex items-center"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      复制
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    收款地址
                  </label>
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <span className="text-sm font-mono text-gray-900 break-all">
                      {currentOrder.address}
                    </span>
                    <button
                      onClick={handleCopyAddress}
                      className="btn-secondary text-sm flex items-center ml-2"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      复制
                    </button>
                  </div>
                </div>

                {/* 二维码区域 */}
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <div className="inline-block p-4 bg-white rounded-lg shadow-sm">
                    <QRCodeSVG 
                      value={currentOrder.address}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-3 font-medium">
                    扫描二维码支付
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    请使用支持{currentOrder.currency === 'USDT' ? 'USDT (TRC20)' : 'TRX (TRC20)'}的钱包扫码
                  </p>
                </div>

                {currentOrder.status === 'pending' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">支付提示：</p>
                        <ul className="space-y-1">
                          <li>1. 复制收款地址和支付金额</li>
                          <li>2. 打开您的钱包APP</li>
                          <li>3. 选择TRC20网络</li>
                          <li>4. 转账到收款地址</li>
                          <li>5. 支付成功后自动到账</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex space-x-3">
                {currentOrder.status === 'pending' && (
                  <button
                    onClick={() => checkOrderStatus(currentOrder.orderId)}
                    disabled={checking}
                    className="btn-secondary flex-1 flex items-center justify-center"
                  >
                    <RefreshCw className={`h-5 w-5 mr-2 ${checking ? 'animate-spin' : ''}`} />
                    {checking ? '检查中...' : '检查支付状态'}
                  </button>
                )}
                <button
                  onClick={() => setCurrentOrder(null)}
                  className="btn-secondary flex-1"
                >
                  {currentOrder.status === 'paid' ? '完成' : '取消订单'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 充值记录 */}
        {rechargeHistory.length > 0 && !currentOrder && (
          <div className="max-w-2xl mx-auto">
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">充值记录</h3>
              <div className="space-y-3">
                {rechargeHistory.map((record) => (
                  <div key={record.orderId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">${record.amount.toFixed(2)}</span>
                      {getStatusBadge(record.status)}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>订单号: {record.orderId}</div>
                      <div>支付: {record.actualAmount} {record.currency}</div>
                      <div>时间: {new Date(record.createdAt).toLocaleString('zh-CN')}</div>
                      {record.txHash && (
                        <div className="text-xs">交易哈希: {record.txHash}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
