import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { CaptchaInput } from '../../components/CaptchaInput';
import { authApi } from '../../utils/api';
import { setToken, setUser } from '../../utils/auth';
import { useUser } from '../../hooks/useUser';
import { t } from '../../utils/i18n';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaValid, setCaptchaValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('请填写邮箱和密码');
      return;
    }

    if (!captchaValid) {
      toast.error('请输入正确的验证码');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.login(email, password) as any;
      
      if (response?.success && response?.data) {
        // 保存token和用户信息
        if (response.data.token) {
          setToken(response.data.token);
        }
        if (response.data.user) {
          setUser(response.data.user);
        }
        
        // 刷新UserContext以更新全局用户状态
        await refreshUser();
        
        toast.success('登录成功');
        navigate('/dashboard');
      } else {
        toast.error(response?.message || '登录失败');
      }
    } catch (error: any) {
      console.error('登录错误:', error);
      toast.error(error?.message || '登录失败，请重试');
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
              登录
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              还没有账户？{' '}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                立即注册
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    {t('form.password')}
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    忘记密码？
                  </Link>
                </div>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10"
                    placeholder="请输入密码"
                    required
                  />
                </div>
              </div>

              <CaptchaInput
                value={captcha}
                onChange={setCaptcha}
                onValidate={setCaptchaValid}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? t('common.loading') : t('common.login')}
              </button>
            </div>
          </form>


        </div>
      </div>
    </Layout>
  );
};