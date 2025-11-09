import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../../components/Layout/Layout';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { authApi } from '../../utils/api';
import toast from 'react-hot-toast';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('验证链接无效');
    }
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await authApi.verifyEmail(token) as any;
      
      if (response?.success) {
        setStatus('success');
        setMessage('邮箱验证成功！');
        toast.success('邮箱验证成功');
        
        // 3秒后跳转到登录页
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(response?.message || '验证失败');
      }
    } catch (error) {
      setStatus('error');
      setMessage('验证失败，请重试');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="card text-center">
            {status === 'loading' && (
              <>
                <Loader className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  正在验证邮箱...
                </h2>
                <p className="text-gray-600">
                  请稍候，我们正在验证您的邮箱地址
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  验证成功！
                </h2>
                <p className="text-gray-600 mb-6">
                  {message}
                </p>
                <p className="text-sm text-gray-500">
                  3秒后自动跳转到登录页面...
                </p>
                <Link
                  to="/login"
                  className="btn-primary mt-4 inline-block"
                >
                  立即登录
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  验证失败
                </h2>
                <p className="text-gray-600 mb-6">
                  {message}
                </p>
                <div className="space-y-3">
                  <Link
                    to="/resend-verification"
                    className="btn-primary block"
                  >
                    重新发送验证邮件
                  </Link>
                  <Link
                    to="/login"
                    className="btn-secondary block"
                  >
                    返回登录
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
