import React, { useState, useEffect } from 'react';
import { Clock, Save, RefreshCw, AlertCircle, Download } from 'lucide-react';
import { getToken } from '../../utils/auth';
import toast from 'react-hot-toast';

interface TimezoneConfigProps {
  onSave?: (config: any) => Promise<boolean>;
}

interface TimezoneConfig {
  value: string;
  displayFormat: string;
  enabled: boolean;
}

interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

export const TimezoneConfig: React.FC<TimezoneConfigProps> = ({ onSave }) => {
  const [config, setConfig] = useState<TimezoneConfig>({
    value: 'Asia/Shanghai',
    displayFormat: 'YYYY-MM-DD HH:mm:ss',
    enabled: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clientTimezone, setClientTimezone] = useState<string>('');
  const [clientOffset, setClientOffset] = useState<string>('');

  // 时区选项
  const timezoneOptions: TimezoneOption[] = [
    { value: 'Asia/Shanghai', label: '中国标准时间 (北京)', offset: 'UTC+8' },
    { value: 'Asia/Hong_Kong', label: '香港时间', offset: 'UTC+8' },
    { value: 'Asia/Tokyo', label: '日本标准时间 (东京)', offset: 'UTC+9' },
    { value: 'Asia/Seoul', label: '韩国标准时间 (首尔)', offset: 'UTC+9' },
    { value: 'Asia/Singapore', label: '新加坡时间', offset: 'UTC+8' },
    { value: 'Asia/Bangkok', label: '泰国时间 (曼谷)', offset: 'UTC+7' },
    { value: 'Asia/Dubai', label: '阿联酋时间 (迪拜)', offset: 'UTC+4' },
    { value: 'Europe/London', label: '英国时间 (伦敦)', offset: 'UTC+0' },
    { value: 'Europe/Paris', label: '法国时间 (巴黎)', offset: 'UTC+1' },
    { value: 'Europe/Berlin', label: '德国时间 (柏林)', offset: 'UTC+1' },
    { value: 'Europe/Moscow', label: '俄罗斯时间 (莫斯科)', offset: 'UTC+3' },
    { value: 'America/New_York', label: '美国东部时间 (纽约)', offset: 'UTC-5' },
    { value: 'America/Chicago', label: '美国中部时间 (芝加哥)', offset: 'UTC-6' },
    { value: 'America/Los_Angeles', label: '美国西部时间 (洛杉矶)', offset: 'UTC-8' },
    { value: 'America/Toronto', label: '加拿大时间 (多伦多)', offset: 'UTC-5' },
    { value: 'America/Sao_Paulo', label: '巴西时间 (圣保罗)', offset: 'UTC-3' },
    { value: 'Australia/Sydney', label: '澳大利亚时间 (悉尼)', offset: 'UTC+10' },
    { value: 'Pacific/Auckland', label: '新西兰时间 (奥克兰)', offset: 'UTC+12' },
    { value: 'UTC', label: '协调世界时 (UTC)', offset: 'UTC+0' }
  ];

  // 时间格式选项
  const formatOptions = [
    { value: 'YYYY-MM-DD HH:mm:ss', label: '2024-01-01 12:00:00' },
    { value: 'YYYY/MM/DD HH:mm:ss', label: '2024/01/01 12:00:00' },
    { value: 'DD/MM/YYYY HH:mm:ss', label: '01/01/2024 12:00:00' },
    { value: 'MM/DD/YYYY HH:mm:ss', label: '01/01/2024 12:00:00' },
    { value: 'YYYY-MM-DD HH:mm', label: '2024-01-01 12:00' },
    { value: 'YYYY年MM月DD日 HH:mm:ss', label: '2024年01月01日 12:00:00' }
  ];

  useEffect(() => {
    loadConfig();
    detectClientTimezone();
    
    // 更新当前时间
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // 检测客户端时区
  const detectClientTimezone = () => {
    try {
      // 获取客户端时区
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setClientTimezone(timezone);
      
      // 获取时区偏移
      const offset = -new Date().getTimezoneOffset() / 60;
      const offsetStr = `UTC${offset >= 0 ? '+' : ''}${offset}`;
      setClientOffset(offsetStr);
      
      console.log('检测到客户端时区:', timezone, offsetStr);
    } catch (error) {
      console.error('检测客户端时区失败:', error);
    }
  };

  // 同步客户端时区
  const syncClientTimezone = () => {
    if (!clientTimezone) {
      toast.error('无法检测客户端时区');
      return;
    }

    // 检查是否在支持的时区列表中
    const supportedTimezone = timezoneOptions.find(tz => tz.value === clientTimezone);
    
    if (supportedTimezone) {
      setConfig({ ...config, value: clientTimezone });
      toast.success(`已同步客户端时区: ${supportedTimezone.label}`);
    } else {
      // 如果不在列表中，尝试找到最接近的时区
      const offset = -new Date().getTimezoneOffset() / 60;
      const closestTimezone = findClosestTimezone(offset);
      
      if (closestTimezone) {
        setConfig({ ...config, value: closestTimezone.value });
        toast.success(`已同步到最接近的时区: ${closestTimezone.label}`);
      } else {
        toast.error('未找到匹配的时区');
      }
    }
  };

  // 查找最接近的时区
  const findClosestTimezone = (targetOffset: number): TimezoneOption | null => {
    const offsetMap: { [key: string]: number } = {
      'UTC': 0,
      'Europe/London': 0,
      'Europe/Paris': 1,
      'Europe/Berlin': 1,
      'Europe/Moscow': 3,
      'Asia/Dubai': 4,
      'Asia/Bangkok': 7,
      'Asia/Shanghai': 8,
      'Asia/Hong_Kong': 8,
      'Asia/Singapore': 8,
      'Asia/Tokyo': 9,
      'Asia/Seoul': 9,
      'Australia/Sydney': 10,
      'Pacific/Auckland': 12,
      'America/Sao_Paulo': -3,
      'America/New_York': -5,
      'America/Toronto': -5,
      'America/Chicago': -6,
      'America/Los_Angeles': -8
    };

    let closestTz: TimezoneOption | null = null;
    let minDiff = Infinity;

    timezoneOptions.forEach(tz => {
      const tzOffset = offsetMap[tz.value] || 0;
      const diff = Math.abs(tzOffset - targetOffset);
      
      if (diff < minDiff) {
        minDiff = diff;
        closestTz = tz;
      }
    });

    return closestTz;
  };

  const loadConfig = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        console.error('未找到认证 token');
        return;
      }

      const response = await fetch('/api/system-config/timezone', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success && data.data) {
        setConfig(data.data);
      }
    } catch (error: any) {
      console.error('加载时区配置失败:', error);
      toast.error('加载配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (onSave) {
        const success = await onSave(config);
        if (success) {
          toast.success('时区配置已保存，建议重启服务器');
        } else {
          toast.error('保存失败');
        }
      } else {
        const token = getToken();
        if (!token) {
          toast.error('未找到认证 token');
          return;
        }

        const response = await fetch('/api/system-config/timezone', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(config)
        });

        const data = await response.json();

        if (data.success) {
          toast.success(data.message || '保存成功');
        } else {
          toast.error(data.message || '保存失败');
        }
      }
    } catch (error: any) {
      console.error('保存时区配置失败:', error);
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (date: Date, format: string): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds)
      .replace('年', '年')
      .replace('月', '月')
      .replace('日', '日');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 当前时间预览 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm opacity-90">服务器时间预览</span>
            </div>
            <div className="text-3xl font-bold">
              {formatTime(currentTime, config.displayFormat)}
            </div>
            <div className="text-sm opacity-75 mt-2">
              {timezoneOptions.find(tz => tz.value === config.value)?.label || config.value}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-75">时区偏移</div>
            <div className="text-2xl font-bold">
              {timezoneOptions.find(tz => tz.value === config.value)?.offset || 'UTC+0'}
            </div>
          </div>
        </div>
      </div>

      {/* 客户端时区信息 */}
      {clientTimezone && (
        <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm opacity-90">您的本地时间</span>
              </div>
              <div className="text-2xl font-bold">
                {currentTime.toLocaleString('zh-CN', { 
                  timeZone: clientTimezone,
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false
                })}
              </div>
              <div className="text-sm opacity-75 mt-2">
                {clientTimezone}
              </div>
            </div>
            <div className="text-right mr-4">
              <div className="text-sm opacity-75">时区偏移</div>
              <div className="text-2xl font-bold">{clientOffset}</div>
            </div>
            <button
              onClick={syncClientTimezone}
              className="px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center space-x-2 font-medium"
            >
              <Download className="w-4 h-4" />
              <span>同步此时区</span>
            </button>
          </div>
        </div>
      )}

      {/* 配置表单 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          {/* 启用状态 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-medium text-gray-700">启用时区配置</label>
              <p className="text-xs text-gray-500 mt-1">关闭后将使用系统默认时区</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* 时区选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择时区
            </label>
            <select
              value={config.value}
              onChange={(e) => setConfig({ ...config, value: e.target.value })}
              disabled={!config.enabled}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {timezoneOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.offset})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              选择系统使用的时区，影响所有时间显示和记录
            </p>
          </div>

          {/* 时间格式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              时间显示格式
            </label>
            <select
              value={config.displayFormat}
              onChange={(e) => setConfig({ ...config, displayFormat: e.target.value })}
              disabled={!config.enabled}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {formatOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              选择系统中时间的显示格式
            </p>
          </div>

          {/* 重要提示 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">重要提示</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>修改时区配置后，建议重启服务器以确保所有功能正常</li>
                  <li>时区变更会影响所有时间记录和显示</li>
                  <li>已存储的时间数据不会自动转换</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 保存按钮 */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={loadConfig}
          disabled={loading || saving}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 inline mr-2 ${loading ? 'animate-spin' : ''}`} />
          重置
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className={`w-4 h-4 inline mr-2 ${saving ? 'animate-pulse' : ''}`} />
          {saving ? '保存中...' : '保存配置'}
        </button>
      </div>
    </div>
  );
};

export default TimezoneConfig;
