import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface ExchangeRates {
  USDT: number;
  TRX: number;
}

interface ExchangeRateDisplayProps {
  onRatesUpdate?: (rates: ExchangeRates) => void;
  showRefreshButton?: boolean;
  compact?: boolean;
}

/**
 * 实时汇率显示组件
 * 可在任何需要显示汇率的地方使用
 */
export const ExchangeRateDisplay: React.FC<ExchangeRateDisplayProps> = ({
  onRatesUpdate,
  showRefreshButton = true,
  compact = false
}) => {
  const [rates, setRates] = useState<ExchangeRates>({
    USDT: 1.0,
    TRX: 6.25
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    try {
      const response = await fetch('/api/exchange-rate');
      const data = await response.json();
      
      if (data.success && data.rates) {
        setRates(data.rates);
        setLastUpdate(data.lastUpdate);
        
        // 通知父组件汇率已更新
        if (onRatesUpdate) {
          onRatesUpdate(data.rates);
        }
      }
    } catch (error) {
      console.error('加载汇率失败:', error);
    }
  };

  const refreshRates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/exchange-rate/refresh', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success && data.rates) {
        setRates(data.rates);
        setLastUpdate(data.lastUpdate);
        toast.success('汇率已更新');
        
        // 通知父组件汇率已更新
        if (onRatesUpdate) {
          onRatesUpdate(data.rates);
        }
      } else {
        toast.error('刷新汇率失败');
      }
    } catch (error) {
      console.error('刷新汇率失败:', error);
      toast.error('刷新汇率失败');
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <span>USDT: ${rates.USDT.toFixed(2)}</span>
        <span>TRX: ${(1/rates.TRX).toFixed(4)}</span>
        {showRefreshButton && (
          <button
            onClick={refreshRates}
            disabled={loading}
            className="text-blue-600 hover:text-blue-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          实时汇率
        </h3>
        {showRefreshButton && (
          <button
            onClick={refreshRates}
            disabled={loading}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            {loading ? '更新中...' : '刷新'}
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">USDT</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            ${rates.USDT.toFixed(2)}
          </div>
          <div className="text-xs text-green-600 mt-1">1:1 稳定币</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">TRX</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            ${(1/rates.TRX).toFixed(4)}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            1 USD ≈ {rates.TRX.toFixed(2)} TRX
          </div>
        </div>
      </div>
      
      {lastUpdate && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          更新时间: {new Date(lastUpdate).toLocaleString('zh-CN')}
        </div>
      )}
    </div>
  );
};
