import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { User, Mail, Lock, Gift, AlertCircle, Sparkles, Shield, UserPlus } from 'lucide-react';
import { CaptchaInput } from '../../components/CaptchaInput';
import { LoginNotificationModal } from '../../components/LoginNotificationModal';
import { authApi } from '../../utils/api';
import { setToken, setUser } from '../../utils/auth';
import { useUser } from '../../hooks/useUser';
import { useSiteConfig } from '../../hooks/useSiteConfig';
import { t } from '../../utils/i18n';
import toast from 'react-hot-toast';
import { getReferralCode } from '../../utils/referralTracking';
import axios from 'axios';

export const ModernRegister: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useUser();
  const { config: siteConfig } = useSiteConfig();
  const [searchParams] = useSearchParams();
  const { referralCode: urlReferralCode } = useParams();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState(urlReferralCode || searchParams.get('ref') || '');
  const [captcha, setCaptcha] = useState('');
  const [captchaValid, setCaptchaValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authPageConfig, setAuthPageConfig] = useState<any>(null);

  // 加载注册页配置
  useEffect(() => {
    const loadAuthPageConfig = async () => {
      try {
        const response = await axios.get('/api/system-config/auth-page');
        if (response.data.success) {
          setAuthPageConfig(response.data.data);
        }
      } catch (error) {
        console.error('加载注册页配置失败:', error);
      }
    };
    loadAuthPageConfig();
  }, []);

  // 使用混合方案获取邀请码
  useEffect(() => {
    const loadReferralCode = async () => {
      if (!referralCode) {
        const code = await getReferralCode();
        if (code) {
          setReferralCode(code);
        }
      }
    };
    loadReferralCode();
  }, []);

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

    if (!captchaValid) {
      toast.error('请输入正确的验证码');
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
        if (response.data.token) {
          setToken(response.data.token);
        }
        if (response.data.user) {
          setUser(response.data.user);
        }
        
        await refreshUser();
        toast.success('注册成功！');
        navigate('/dashboard', { replace: true });
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

  const loginImage = authPageConfig?.loginImage || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200';
  const registerTips = authPageConfig?.registerTips || '创建账户即可开始使用我们的专业服务，享受更多功能。';

  return (
    <>
      <LoginNotificationModal />
      <div className="h-screen flex bg-gradient-to-br from-purple-50 via-white to-pink-50 overflow-hidden">
        {/* 左侧 - 注册表单 */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-2">
        <div className="w-full max-w-md">
          {/* 返回首页 */}
          <Link
            to="/"
            className="inline-flex items-center text-xs text-gray-600 hover:text-purple-600 mb-2 transition-colors group"
          >
            <svg className="w-3 h-3 mr-1 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回首页
          </Link>

          {/* 注册卡片 */}
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
            {/* 顶部装饰 */}
            <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>
            
            <div className="p-4">
              {/* 标题 */}
              <div className="text-center mb-2">
                <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  创建账户
                </h2>
                <p className="mt-0.5 text-xs text-gray-600">
                  加入 {siteConfig?.siteName || '信息查询系统'}
                </p>
              </div>

              {/* 注册表单 */}
              <form onSubmit={handleSubmit} className="space-y-2">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">
                    用户名
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="input-field pl-10 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="请输入用户名"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    邮箱地址
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field pl-10 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                    密码
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                    </div>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pl-10 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="至少6位密码"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                    确认密码
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                    </div>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field pl-10 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="再次输入密码"
                      required
                      minLength={6}
                    />
                  </div>
                  {password && confirmPassword && password !== confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      两次输入的密码不一致
                    </p>
                  )}
                </div>

                <CaptchaInput
                  value={captcha}
                  onChange={setCaptcha}
                  onValidate={setCaptchaValid}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      注册中...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Sparkles className="w-5 h-5 mr-2" />
                      立即注册
                    </span>
                  )}
                </button>
              </form>

              {/* 登录链接 */}
              <div className="mt-3 text-center">
                <Link
                  to="/login"
                  className="text-xs text-purple-600 hover:text-purple-700 hover:underline transition-all"
                >
                  立即登录
                </Link>
              </div>

              {/* 推荐信息显示 - 移到底部 */}
              {referralCode && (
                <div className="mt-2 bg-gradient-to-r from-green-50 to-emerald-50 border-l-2 border-green-500 rounded p-2 shadow-sm">
                  <div className="flex">
                    <Gift className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="ml-2">
                      <p className="text-xs font-semibold text-green-800">
                        🎉 通过推荐链接注册
                      </p>
                      <p className="text-xs text-green-700 mt-0.5">
                        注册成功后您和推荐人都将获得奖励积分
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 右侧 - 大图展示 */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 to-pink-600/90 mix-blend-multiply"></div>
        <img
          src={loginImage}
          alt="注册背景"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="max-w-xl">
            <h3 className="text-4xl font-bold mb-6 leading-tight">
              开启您的专业之旅
            </h3>
            <p className="text-xl text-gray-100 mb-8 leading-relaxed">
              {siteConfig?.siteDescription || '专业的信息查询平台'}
            </p>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Gift className="w-6 h-6" />
                </div>
                <span className="ml-4 text-lg">注册即送新手礼包</span>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="ml-4 text-lg">安全可靠的数据保护</span>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="ml-4 text-lg">专业的技术支持团队</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};
