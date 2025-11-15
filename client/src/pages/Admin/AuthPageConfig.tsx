import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { Save, Image, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export const AuthPageConfig: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    loginImage: '',
    loginTips: '',
    registerTips: ''
  });

  // 加载配置
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/system-config/auth-page');
      if (response.data.success) {
        setConfig(response.data.data);
      }
    } catch (error: any) {
      console.error('加载配置失败:', error);
      toast.error(error.response?.data?.message || '加载配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await axios.put('/api/system-config/auth-page', config);
      if (response.data.success) {
        toast.success('保存成功');
      }
    } catch (error: any) {
      console.error('保存失败:', error);
      toast.error(error.response?.data?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">登录注册页配置</h1>
            <p className="mt-1 text-sm text-gray-500">
              配置登录和注册页面的展示内容
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? '保存中...' : '保存配置'}
          </button>
        </div>

        {/* 配置表单 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 space-y-6">
            {/* 右侧大图配置 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Image className="w-4 h-4 mr-2" />
                右侧展示图片
              </label>
              <input
                type="url"
                value={config.loginImage}
                onChange={(e) => setConfig({ ...config, loginImage: e.target.value })}
                className="input-field"
                placeholder="请输入图片URL，例如：https://example.com/image.jpg"
              />
              <p className="mt-2 text-xs text-gray-500">
                建议尺寸：1200x1600px，支持 JPG、PNG 格式
              </p>
              
              {/* 图片预览 */}
              {config.loginImage && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">预览：</p>
                  <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={config.loginImage}
                      alt="预览"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1200x1600?text=图片加载失败';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">温馨提示配置</h3>
              
              {/* 登录页提示 */}
              <div className="mb-6">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Info className="w-4 h-4 mr-2" />
                  登录页提示
                </label>
                <textarea
                  value={config.loginTips}
                  onChange={(e) => setConfig({ ...config, loginTips: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="请输入登录页的温馨提示内容"
                />
                <p className="mt-2 text-xs text-gray-500">
                  显示在登录表单上方，用于引导用户登录
                </p>
              </div>

              {/* 注册页提示 */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Info className="w-4 h-4 mr-2" />
                  注册页提示
                </label>
                <textarea
                  value={config.registerTips}
                  onChange={(e) => setConfig({ ...config, registerTips: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="请输入注册页的温馨提示内容"
                />
                <p className="mt-2 text-xs text-gray-500">
                  显示在注册表单上方，用于引导用户注册
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 示例说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">💡 配置建议</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 右侧图片建议使用高质量、与业务相关的图片</li>
            <li>• 可以使用 Unsplash、Pexels 等免费图片网站</li>
            <li>• 温馨提示内容应简洁明了，突出服务特点</li>
            <li>• 支持换行，可以分点说明</li>
          </ul>
        </div>

        {/* 推荐图片网站 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">🖼️ 推荐免费图片网站</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <a
              href="https://unsplash.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Unsplash - 高质量免费图片
            </a>
            <a
              href="https://www.pexels.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Pexels - 免费素材图片
            </a>
            <a
              href="https://pixabay.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Pixabay - 免费图片和视频
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
