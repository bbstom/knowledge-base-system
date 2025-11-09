import React, { useState, useEffect } from 'react';
import { Users, Copy, Share2, DollarSign, TrendingUp } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { userApi } from '../../utils/api';
import { getUser } from '../../utils/auth';
import { t } from '../../utils/i18n';
import toast from 'react-hot-toast';

export const Referral: React.FC = () => {
  const user = getUser();
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
      const response = await userApi.getProfile() as any;
      if (response?.success) {
        const data = response.data;
        setReferralData({
          referralCode: data.referralCode || '',
          referralLink: `${window.location.origin}/register?ref=${data.referralCode}`,
          totalReferrals: data.totalReferrals || 0,
          totalCommission: data.totalCommission || 0,
          pendingCommission: data.pendingCommission || 0,
          referralUsers: data.referralUsers || [],
          commissionHistory: data.commissionHistory || []
        });
      }
    } catch (error) {
      console.error('Failed to load referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralData.referralLink);
    toast.success('推荐链接已复制到剪贴板');
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralData.referralCode);
    toast.success('推荐码已复制到剪贴板');
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
            推荐奖励
          </h1>
          <p className="text-gray-600">
            邀请好友注册使用，获得丰厚佣金奖励
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                <p className="text-sm font-medium text-gray-600">总佣金</p>
                <p className="text-2xl font-bold text-gray-900">
                  ¥{referralData.totalCommission.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">待结算</p>
                <p className="text-2xl font-bold text-gray-900">
                  ¥{referralData.pendingCommission.toFixed(2)}
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
            <button className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              <Share2 className="h-4 w-4 mr-2" />
              微信分享
            </button>
            <button className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              <Share2 className="h-4 w-4 mr-2" />
              QQ分享
            </button>
            <button className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
              <Share2 className="h-4 w-4 mr-2" />
              微博分享
            </button>
            <button className="flex items-center justify-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
              <Share2 className="h-4 w-4 mr-2" />
              复制链接
            </button>
          </div>
        </div>

        {/* Referral Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Referred Users */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              推荐用户列表
            </h3>
            <div className="space-y-3">
              {referralData.referralUsers.length > 0 ? (
                referralData.referralUsers.map((user: any, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        {user.username || `用户${index + 1}`}
                      </div>
                      <div className="text-sm text-gray-600">
                        注册时间: {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        +¥{(user.commission || 0).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.status || '已激活'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>还没有推荐用户</p>
                  <p className="text-sm">快去邀请好友注册吧！</p>
                </div>
              )}
            </div>
          </div>

          {/* Commission History */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              佣金记录
            </h3>
            <div className="space-y-3">
              {referralData.commissionHistory.length > 0 ? (
                referralData.commissionHistory.map((record: any, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        {record.type === 'referral' ? '推荐奖励' : '消费返佣'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(record.createdAt || Date.now()).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        +¥{(record.amount || 0).toFixed(2)}
                      </div>
                      <div className={`text-xs ${
                        record.status === 'paid' ? 'text-green-500' : 'text-yellow-500'
                      }`}>
                        {record.status === 'paid' ? '已结算' : '待结算'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>暂无佣金记录</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="card mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            推荐奖励规则
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