import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout/Layout';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authApi } from '../../utils/api';
import toast from 'react-hot-toast';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('请输入邮箱地址');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.forgotPassword(email) as any;
      
      if (response?.success) {
        setSent(true);
        toast.success('重置邮件已发送');
      } else {
        toast.error(response?.message || '发送失败');
      }
    } catch (error) {
      toast.error('发送失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <div className="card text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                邮件已发送
              </h2>
              <p className="text-gray-600 mb-6">
                我们已向 <span className="font-medium text-gray-900">{email}</span> 发送了密码重置邮件。
                请查收邮件并按照说明重置密码。
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>提示：</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1 text-left">
                  <li>• 邮件可能需要几分钟才能送达</li>
                  <li>• 请检查垃圾邮件文件夹</li>
                  <li>• 重置链接24小时内有效</li>
                </ul>
              </div>
              <Link
                to="/login"
                className="btn-primary inline-flex items-center"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                返回登录
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              忘记密码
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              输入您的邮箱地址，我们将发送密码重置链接
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱地址
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="请输入注册时使用的邮箱"
                  required
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? '发送中...' : '发送重置邮件'}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-blue-600 hover:text-blue-500 inline-flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                返回登录
              </Link>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};
