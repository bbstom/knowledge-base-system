import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Sparkles, Shield } from 'lucide-react';
import { CaptchaInput } from '../../components/CaptchaInput';
import { authApi } from '../../utils/api';
import { setToken, setUser } from '../../utils/auth';
import { useUser } from '../../hooks/useUser';
import { useSiteConfig } from '../../hooks/useSiteConfig';
import toast from 'react-hot-toast';
import axios from 'axios';

export const ModernLogin: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useUser();
  const { config: siteConfig } = useSiteConfig();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaValid, setCaptchaValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authPageConfig, setAuthPageConfig] = useState<any>(null);

  useEffect(() => {
    const loadAuthPageConfig = async () => {
      try {
        const response = await axios.get('/api/system-config/auth-page');
        if (response.data.success) {
          setAuthPageConfig(response.data.data);
        }
      } catch (error) {
        console.error('加载登录页配置失败:', error);
      }
    };
    loadAuthPageConfig();
  }, []);

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
        if (response.data.token) {
          setToken(response.data.token);
        }
        if (response.data.user) {
          setUser(response.data.user);
        }
        
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

  const loginImage = authPageConfig?.loginImage || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200';
  const loginTips = authPageConfig?.loginTips || '欢迎回来！请登录您的账户以继续使用我们的服务。';

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 左侧 - 登录表单 */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-lg">
          {/* 返回首页 */}
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 mb-8 transition-colors group"
          >
            <svg className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回首页
          </Link>

          {/* 登录卡片 */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* 顶部装饰 */}
            <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            
            <div className="p-8">
              {/* Logo和标题 */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-3 shadow-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  欢迎回来
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  登录到 {siteConfig?.siteName || '信息查询系统'}
                </p>
              </div>

              {/* 登录表单 */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    邮箱地址
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field pl-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      密码
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
                    >
                      忘记密码？
                    </Link>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pl-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <CaptchaInput
                  value={captcha}
                  onChange={setCaptcha}
                  onValidate={setCaptchaValid}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      登录中...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Sparkles className="w-5 h-5 mr-2" />
                      立即登录
                    </span>
                  )}
                </button>
              </form>

              {/* 注册链接 */}
              <div className="mt-5 text-center">
                <p className="text-sm text-gray-600">
                  还没有账户？{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    立即注册
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* 温馨提示 - 放在表单下方 */}
          {loginTips && (
            <div className="mt-6 bg-gradient-to-r from-red-50 to-purple-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                    {loginTips}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 右侧 - 大图展示 */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-purple-600/90 mix-blend-multiply"></div>
        <img
          src={loginImage}
          alt="登录背景"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="max-w-xl">
            <h3 className="text-4xl font-bold mb-6 leading-tight">
              {siteConfig?.siteName || '信息查询系统'}
            </h3>
            <p className="text-xl text-gray-100 mb-8 leading-relaxed">
              {siteConfig?.siteDescription || '专业的信息查询平台'}
            </p>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="ml-4 text-lg">安全可靠的数据查询</span>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="ml-4 text-lg">快速响应的技术支持</span>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="ml-4 text-lg">专业的数据分析服务</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
