import React, { useState, useEffect } from 'react';
import { Save, CreditCard, ExternalLink, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { systemConfigApi } from '../../utils/realApi';
import { AdminLayout } from '../../components/Layout/AdminLayout';

export const RechargeCardConfig: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    enabled: true,
    title: '充值卡密购买',
    description: '购买充值卡密，快速充值积分或开通VIP',
    purchaseUrl: '',
    instructions: '1. 点击购买链接\n2. 选择需要的卡密类型\n3. 完成支付后获取卡密\n4. 在充值页面输入卡密即可使用'
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await systemConfigApi.getRechargeCardConfig();
      if (response.success && response.data) {
        setConfig(response.data);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
      toast.error('加载配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // 验证
    if (!config.title.trim()) {
      toast.error('请输入标题');
      return;
    }
    if (!config.description.trim()) {
      toast.error('请输入描述');
      return;
    }

    setSaving(true);
    try {
      await systemConfigApi.updateRechargeCardConfig(config);
      toast.success('保存成功');
    } catch (error: any) {
      console.error('Failed to save config:', error);
      toast.error(error.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">加载中...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">卡密购买配置</h1>
        <p className="text-gray-600">配置充值卡密的购买说明和购买链接</p>
      </div>

      {/* 配置表单 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-4xl">
        <div className="space-y-6">
          {/* 启用开关 */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">启用卡密购买</h3>
              <p className="text-sm text-gray-600">关闭后用户将无法看到卡密购买入口</p>
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

          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="inline h-4 w-4 mr-1" />
              标题
            </label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              placeholder="充值卡密购买"
              maxLength={100}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              {config.title.length}/100 字符
            </p>
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              描述
            </label>
            <textarea
              value={config.description}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              placeholder="购买充值卡密，快速充值积分或开通VIP"
              maxLength={500}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              {config.description.length}/500 字符
            </p>
          </div>

          {/* 购买链接 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ExternalLink className="inline h-4 w-4 mr-1" />
              购买链接
            </label>
            <input
              type="url"
              value={config.purchaseUrl}
              onChange={(e) => setConfig({ ...config, purchaseUrl: e.target.value })}
              placeholder="https://example.com/buy-card"
              maxLength={500}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              用户点击"购买卡密"按钮后将跳转到此链接
            </p>
          </div>

          {/* 使用说明 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              使用说明
            </label>
            <textarea
              value={config.instructions}
              onChange={(e) => setConfig({ ...config, instructions: e.target.value })}
              placeholder="输入使用说明，支持换行"
              maxLength={2000}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              {config.instructions.length}/2000 字符 · 支持换行，每行一条说明
            </p>
          </div>

          {/* 预览 */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">预览效果</h4>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center mb-2">
                <CreditCard className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">{config.title}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">{config.description}</p>
              {config.purchaseUrl && (
                <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium py-2 px-4 rounded-lg mb-3">
                  购买卡密
                </button>
              )}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">使用说明</h4>
                <div className="text-xs text-gray-700 whitespace-pre-line">
                  {config.instructions}
                </div>
              </div>
            </div>
          </div>

          {/* 保存按钮 */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? '保存中...' : '保存配置'}
            </button>
          </div>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
};
