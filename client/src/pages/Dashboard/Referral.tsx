import React, { useState, useEffect } from 'react';
import { Users, Copy, Share2, DollarSign } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { userApi } from '../../utils/api';
import { t } from '../../utils/i18n';
import toast from 'react-hot-toast';

export const Referral: React.FC = () => {
  const [referralData, setReferralData] = useState({
    referralCode: '',
    referralLink: '',
    totalReferrals: 0,
    totalCommission: 0,
    pendingCommission: 0,
    referralUsers: [],
    commissionHistory: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const [profileResponse, referralStatsResponse] = await Promise.all([
        userApi.getProfile() as any,
        userApi.getReferralStats() as any
      ]);
      
      if (profileResponse?.success) {
        const user = profileResponse.user || profileResponse.data;
        const referralStats = referralStatsResponse?.data || {};
        
        setReferralData({
          referralCode: user.referralCode || '',
          referralLink: `${window.location.origin}/register?ref=${user.referralCode}`,
          totalReferrals: referralStats.totalReferrals || 0,
          totalCommission: user.commission || 0,
          pendingCommission: 0,
          referralUsers: referralStats.referredUsers || [],
          commissionHistory: []
        });
      }
    } catch (error) {
      console.error('Failed to load referral data:', error);
      toast.error('加载推荐数据失败');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    // 方法1: 尝试使用现代 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    } else {
      // 方法2: 使用传统方法（兼容性更好）
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      return new Promise<void>((resolve, reject) => {
        try {
          document.execCommand('copy');
          textArea.remove();
          resolve();
        } catch (error) {
          textArea.remove();
          reject(error);
        }
      });
    }
  };

  const copyReferralLink = async () => {
    try {
      if (!referralData.referralLink) {
        toast.error('推荐链接不可用');
        return;
      }
      await copyToClipboard(referralData.referralLink);
      toast.success('推荐链接已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      toast.error('复制失败，请手动复制');
    }
  };

  if (loading) {
    return (
      <Layout showSidebar>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">{t('common.loading')}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            推广赚钱
          </h1>
          <p className="text-gray-600">
            邀请好友注册使用，获得丰厚佣金奖励
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">推荐用户</p>
                <p className="text-2xl font-bold text-gray-900">
                  {referralData.totalReferrals}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">当前佣金</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${referralData.totalCommission.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Share2 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">佣金比例</p>
                <p className="text-2xl font-bold text-gray-900">15%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Tools */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            我的专属推荐链接
          </h3>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-4">
            <div className="flex items-center space-x-2 mb-3">
              <input
                type="text"
                value={referralData.referralLink}
                readOnly
                className="input-field flex-1 text-sm font-mono"
              />
              <button
                onClick={copyReferralLink}
                className="btn-primary flex items-center"
              >
                <Copy className="h-4 w-4 mr-2" />
                复制链接
              </button>
            </div>
            <p className="text-sm text-gray-600">
              分享这个专属链接，好友通过链接注册后您将获得15%的佣金奖励
            </p>
          </div>

          {/* Social Share Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button 
              onClick={() => toast('微信分享功能开发中')}
              className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Share2 className="h-4 w-4 mr-2" />
              微信分享
            </button>
            <button 
              onClick={() => toast('QQ分享功能开发中')}
              className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Share2 className="h-4 w-4 mr-2" />
              QQ分享
            </button>
            <button 
              onClick={() => toast('微博分享功能开发中')}
              className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Share2 className="h-4 w-4 mr-2" />
              微博分享
            </button>
            <button 
              onClick={copyReferralLink}
              className="flex items-center justify-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Copy className="h-4 w-4 mr-2" />
              复制链接
            </button>
          </div>
        </div>

        {/* Referral Users */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            推荐用户列表
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">用户名</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">注册时间</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">状态</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">累计消费</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">我的佣金</th>
                </tr>
              </thead>
              <tbody>
                {referralData.referralUsers.length > 0 ? (
                  referralData.referralUsers.map((user: any, index) => (
                    <tr key={user._id || index} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-900">
                        {user.username || `用户${index + 1}`}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(user.createdAt || Date.now()).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          已激活
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        ${(user.totalSpent || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-green-600">
                          ${(user.commissionEarned || 0).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">还没有推荐用户</p>
                      <p className="text-sm text-gray-400 mt-1">快去邀请好友注册吧！</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* How it works */}
        <div className="card mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            推广赚钱规则
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                1
              </div>
              <h4 className="font-medium text-gray-900 mb-2">分享推荐</h4>
              <p className="text-sm text-gray-600">
                分享你的推荐码或链接给好友
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                2
              </div>
              <h4 className="font-medium text-gray-900 mb-2">好友注册</h4>
              <p className="text-sm text-gray-600">
                好友通过你的推荐注册并完成验证
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                3
              </div>
              <h4 className="font-medium text-gray-900 mb-2">获得奖励</h4>
              <p className="text-sm text-gray-600">
                好友消费时你将获得15%的佣金奖励
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};