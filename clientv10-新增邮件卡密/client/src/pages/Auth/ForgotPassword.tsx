import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Key, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { SliderCaptcha } from '../../components/SliderCaptcha';

export const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<'email' | 'verify' | 'reset' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [resetToken, setResetToken] = useState('');

  // 显示滑块验证
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('请输入邮箱地址');
      return;
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('请输入有效的邮箱地址');
      return;
    }

    // 显示滑块验证
    setShowCaptcha(true);
  };

  // 滑块验证成功后发送验证码
  const handleCaptchaSuccess = async (token: string) => {
    setCaptchaToken(token);
    setShowCaptcha(false);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, captchaToken: token })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('验证码已发送到您的邮箱');
        setStep('verify');
        startCountdown();
      } else {
        toast.error(data.message || '发送失败，请重试');
      }
    } catch (error) {
      console.error('Send code error:', error);
      toast.error('发送失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 验证验证码
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode) {
      toast.error('请输入验证码');
      return;
    }

    if (verificationCode.length !== 6) {
      toast.error('验证码为6位数字');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, code: verificationCode })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('验证成功，请设置新密码');
        setResetToken(data.resetToken); // 保存重置token
        setStep('reset');
      } else {
        toast.error(data.message || '验证码错误或已过期');
      }
    } catch (error) {
      console.error('Verify code error:', error);
      toast.error('验证失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 重置密码
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error('请输入新密码');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('密码至少6位');
      return;
    }

    if (!resetToken) {
      toast.error('重置令牌无效，请重新验证');
      setStep('verify');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          resetToken,
          newPassword 
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('密码重置成功');
        setStep('success');
      } else {
        toast.error(data.message || '重置失败，请重试');
        // 如果token过期，返回验证码步骤
        if (data.message?.includes('过期')) {
          setTimeout(() => {
            setStep('verify');
            setResetToken('');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('重置失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 重新发送验证码
  const handleResendCode = async () => {
    if (countdown > 0) return;

    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('验证码已重新发送');
        startCountdown();
      } else {
        toast.error(data.message || '发送失败');
      }
    } catch (error) {
      toast.error('发送失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 倒计时
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Key className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {step === 'email' && '忘记密码'}
            {step === 'verify' && '验证邮箱'}
            {step === 'reset' && '设置新密码'}
            {step === 'success' && '重置成功'}
          </h1>
          <p className="text-gray-600">
            {step === 'email' && '输入您的邮箱地址，我们将发送验证码'}
            {step === 'verify' && '请输入发送到您邮箱的验证码'}
            {step === 'reset' && '请设置您的新密码'}
            {step === 'success' && '您的密码已成功重置'}
          </p>
        </div>

        {/* Step 1: 输入邮箱 */}
        {step === 'email' && (
          <form onSubmit={handleSendCode} className="space-y-6">
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
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* 滑块验证 */}
            {showCaptcha && (
              <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                <p className="text-sm text-gray-700 mb-4">请完成安全验证</p>
                <SliderCaptcha
                  onSuccess={handleCaptchaSuccess}
                  onFail={() => toast.error('验证失败，请重试')}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || showCaptcha}
              className="btn-primary w-full"
            >
              {loading ? '发送中...' : showCaptcha ? '请完成验证' : '发送验证码'}
            </button>
          </form>
        )}

        {/* Step 2: 验证验证码 */}
        {step === 'verify' && (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                验证码
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input-field text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
              />
              <p className="mt-2 text-sm text-gray-600">
                验证码已发送到 <span className="font-medium">{email}</span>
              </p>
            </div>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-gray-600 hover:text-gray-900"
              >
                修改邮箱
              </button>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={countdown > 0 || loading}
                className={`${
                  countdown > 0 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                {countdown > 0 ? `${countdown}秒后重发` : '重新发送'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="btn-primary w-full"
            >
              {loading ? '验证中...' : '验证'}
            </button>
          </form>
        )}

        {/* Step 3: 设置新密码 */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                新密码
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
                placeholder="请输入新密码（至少6位）"
                minLength={6}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                确认新密码
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="请再次输入新密码"
                minLength={6}
                required
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>密码要求：</strong>
                <br />• 至少6个字符
                <br />• 建议包含大小写字母、数字和特殊字符
                <br />• 请在15分钟内完成密码设置
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? '重置中...' : '重置密码'}
            </button>
          </form>
        )}

        {/* Step 4: 成功 */}
        {step === 'success' && (
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-gray-600">
              您的密码已成功重置，现在可以使用新密码登录了
            </p>
            <Link to="/login" className="btn-primary w-full inline-block">
              前往登录
            </Link>
          </div>
        )}

        {/* Back to Login */}
        {step !== 'success' && (
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              返回登录
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
