import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { Mail, Save, TestTube, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const EmailConfig: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [showTestModal, setShowTestModal] = useState(false);
  
  const [config, setConfig] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: '',
    smtpPassword: '',
    fromName: '',
    fromEmail: ''
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/system-config/smtp', {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setConfig(data.data);
      }
    } catch (error) {
      console.error('Load config error:', error);
      toast.error('加载配置失败');
    }
  };

  const handleSave = async () => {
    if (!config.smtpHost || !config.smtpUser) {
      toast.error('请填写SMTP服务器和用户名');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/system-config/smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        },
        body: JSON.stringify(config)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('配置已保存');
        loadConfig(); // 重新加载以获取加密后的密码显示
      } else {
        toast.error(data.message || '保存失败');
      }
    } catch (error) {
      console.error('Save config error:', error);
      toast.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    if (!testEmail) {
      toast.error('请输入测试邮箱地址');
      return;
    }

    setTesting(true);

    try {
      const response = await fetch('/api/system-config/smtp/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        },
        body: JSON.stringify({ testEmail })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setShowTestModal(false);
        setTestEmail('');
      } else {
        toast.error(data.message || '测试失败');
      }
    } catch (error) {
      console.error('Test error:', error);
      toast.error('测试失败');
    } finally {
      setTesting(false);
    }
  };

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">邮件配置</h1>
          <p className="text-gray-600">配置SMTP邮件服务，用于发送验证码和通知邮件</p>
        </div>

        {/* 安全提示 */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">安全存储</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>• SMTP密码将使用AES-256加密存储在数据库中</p>
                <p>• 配置信息不会保存在.env文件中</p>
                <p>• 只有管理员可以查看和修改配置</p>
              </div>
            </div>
          </div>
        </div>

        {/* 配置表单 */}
        <div className="card max-w-3xl">
          <div className="space-y-6">
            {/* SMTP服务器 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP服务器 *
                </label>
                <input
                  type="text"
                  value={config.smtpHost}
                  onChange={(e) => setConfig({ ...config, smtpHost: e.target.value })}
                  className="input-field"
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  端口 *
                </label>
                <input
                  type="number"
                  value={config.smtpPort}
                  onChange={(e) => setConfig({ ...config, smtpPort: parseInt(e.target.value) })}
                  className="input-field"
                  placeholder="587"
                />
              </div>
            </div>

            {/* SSL/TLS */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.smtpSecure}
                  onChange={(e) => setConfig({ ...config, smtpSecure: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  使用SSL/TLS（端口465时启用）
                </span>
              </label>
            </div>

            {/* 用户名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP用户名 *
              </label>
              <input
                type="text"
                value={config.smtpUser}
                onChange={(e) => setConfig({ ...config, smtpUser: e.target.value })}
                className="input-field"
                placeholder="your-email@gmail.com"
              />
            </div>

            {/* 密码 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP密码 *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={config.smtpPassword}
                  onChange={(e) => setConfig({ ...config, smtpPassword: e.target.value })}
                  className="input-field pr-10"
                  placeholder="应用专用密码"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Gmail用户请使用应用专用密码，不是登录密码
              </p>
            </div>

            {/* 发件人信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  发件人名称
                </label>
                <input
                  type="text"
                  value={config.fromName}
                  onChange={(e) => setConfig({ ...config, fromName: e.target.value })}
                  className="input-field"
                  placeholder="信息查询系统"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  发件人邮箱
                </label>
                <input
                  type="email"
                  value={config.fromEmail}
                  onChange={(e) => setConfig({ ...config, fromEmail: e.target.value })}
                  className="input-field"
                  placeholder="noreply@example.com"
                />
              </div>
            </div>

            {/* 常用配置示例 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">常用配置示例</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <strong>Gmail:</strong> smtp.gmail.com, 端口587, 需要应用专用密码
                </div>
                <div>
                  <strong>QQ邮箱:</strong> smtp.qq.com, 端口587, 需要授权码
                </div>
                <div>
                  <strong>163邮箱:</strong> smtp.163.com, 端口465, 需要授权码, 启用SSL
                </div>
              </div>
            </div>

            {/* 按钮 */}
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setShowTestModal(true)}
                className="btn-secondary flex items-center"
              >
                <TestTube className="h-5 w-5 mr-2" />
                测试配置
              </button>

              <button
                onClick={handleSave}
                disabled={loading}
                className="btn-primary flex items-center"
              >
                <Save className="h-5 w-5 mr-2" />
                {loading ? '保存中...' : '保存配置'}
              </button>
            </div>
          </div>
        </div>

        {/* 测试模态框 */}
        {showTestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">测试SMTP配置</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  测试邮箱地址
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="input-field"
                  placeholder="test@example.com"
                />
                <p className="mt-1 text-xs text-gray-500">
                  将发送测试邮件到此地址
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowTestModal(false);
                    setTestEmail('');
                  }}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleTest}
                  disabled={testing}
                  className="btn-primary"
                >
                  {testing ? '发送中...' : '发送测试邮件'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
