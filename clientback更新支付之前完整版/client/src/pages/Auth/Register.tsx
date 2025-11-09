import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { User, Mail, Lock, Gift } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { authApi } from '../../utils/api';
import { setToken, setUser } from '../../utils/auth';
import { t } from '../../utils/i18n';
import toast from 'react-hot-toast';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { referralCode: urlReferralCode } = useParams();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode] = useState(urlReferralCode || searchParams.get('ref') || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      toast.error('请填写所有必填字段');
      return;
    }

    if (password.length < 6) {
      toast.error('密码至少6位');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.register({
        username,
        email,
        password,
        referralCode: referralCode || undefined
      }) as any;
      
      if (response?.success && response?.data) {
        // 保存token和用户信息
        if (response.data.token) {
          setToken(response.data.token);
          console.log('✅ Token已保存');
        }
        if (response.data.user) {
          setUser(response.data.user);
          console.log('✅ 用户信息已保存:', response.data.user);
        }
        
        toast.success('注册成功！正在跳转...');
        
        // 延迟跳转到Dashboard，确保数据已保存
        setTimeout(() => {
          console.log('🚀 跳转到Dashboard');
          navigate('/dashboard', { replace: true });
        }, 800);
      } else {
        toast.error(response?.message || '注册失败');
      }
    } catch (error: any) {
      console.error('注册错误:', error);
      toast.error(error?.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              注册
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              已有账户？{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                立即登录
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('form.username')}
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-field pl-10"
                    placeholder="请输入用户名"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('form.email')}
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="请输入邮箱地址"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('form.password')}
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10"
                    placeholder="请输入密码（至少6位）"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  确认密码
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pl-10"
                    placeholder="请再次输入密码"
                    required
                    minLength={6}
                  />
                </div>
                {password && confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    两次输入的密码不一致
                  </p>
                )}
              </div>

              {/* 推荐信息显示（如果有） */}
              {referralCode && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Gift className="h-5 w-5 text-green-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        通过推荐链接注册
                      </p>
                      <p className="text-xs text-green-600">
                        注册成功后您和推荐人都将获得奖励积分
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? t('common.loading') : t('common.register')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};