import React, { useState, useEffect } from 'react';
import { Award, Gift, Users, ShoppingCart, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout/Layout';
import { userApi } from '../../utils/api';
import { t } from '../../utils/i18n';
import toast from 'react-hot-toast';

export const Points: React.FC = () => {
  const [pointsData, setPointsData] = useState({
    totalPoints: 0,
    availablePoints: 0,
    usedPoints: 0,
    pointsHistory: [],
    canClaimDaily: false,
    dailyReward: 10
  });
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    loadPointsData();
  }, []);

  const loadPointsData = async () => {
    try {
      const response = await userApi.getPointsHistory() as any;
      if (response?.success) {
        setPointsData(response.data);
      }
    } catch (error) {
      console.error('Failed to load points data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimDaily = async () => {
    setClaiming(true);
    try {
      const response = await userApi.claimDailyPoints() as any;
      if (response?.success) {
        toast.success(`成功领取 ${response.data.points} 积分！`);
        loadPointsData();
      } else {
        toast.error(response?.message || '领取失败');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '领取失败');
    } finally {
      setClaiming(false);
    }
  };

  const getPointsTypeIcon = (type: string) => {
    switch (type) {
      case 'daily':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'referral':
        return <Users className="h-5 w-5 text-green-500" />;
      case 'purchase':
        return <ShoppingCart className="h-5 w-5 text-purple-500" />;
      case 'bonus':
        return <Gift className="h-5 w-5 text-yellow-500" />;
      default:
        return <Award className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPointsTypeText = (type: string) => {
    switch (type) {
      case 'daily':
        return '每日签到';
      case 'referral':
        return '推荐奖励';
      case 'purchase':
        return '消费奖励';
      case 'bonus':
        return '活动奖励';
      default:
        return '其他';
    }
  };

  const getPointsTypeColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'bg-blue-100 text-blue-800';
      case 'referral':
        return 'bg-green-100 text-green-800';
      case 'purchase':
        return 'bg-purple-100 text-purple-800';
      case 'bonus':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
            积分中心
          </h1>
          <p className="text-gray-600">
            通过各种方式获得积分，兑换优惠和奖励
          </p>
        </div>

        {/* Daily Check-in */}
        {pointsData.canClaimDaily && (
          <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-blue-500 rounded-full">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-blue-800">
                    每日签到奖励
                  </h3>
                  <p className="text-blue-600">
                    今日还未签到，立即签到获得 {pointsData.dailyReward} 积分！
                  </p>
                </div>
              </div>
              <button
                onClick={handleClaimDaily}
                disabled={claiming}
                className="btn-primary"
              >
                {claiming ? '领取中...' : '立即签到'}
              </button>
            </div>
          </div>
        )}

        {/* Points Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总积分</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pointsData.totalPoints.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">可用积分</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pointsData.availablePoints.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已使用</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pointsData.usedPoints.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Points Earning Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              获取积分方式
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-blue-500 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">每日签到</div>
                    <div className="text-sm text-gray-600">每天签到获得积分</div>
                  </div>
                </div>
                <div className="text-blue-600 font-medium">+{pointsData.dailyReward}</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-green-500 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">推荐好友</div>
                    <div className="text-sm text-gray-600">好友注册并验证邮箱</div>
                  </div>
                </div>
                <div className="text-green-600 font-medium">+50</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <ShoppingCart className="h-5 w-5 text-purple-500 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">消费返积分</div>
                    <div className="text-sm text-gray-600">每消费1元返1积分</div>
                  </div>
                </div>
                <div className="text-purple-600 font-medium">1:1</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Gift className="h-5 w-5 text-yellow-500 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">活动奖励</div>
                    <div className="text-sm text-gray-600">参与平台活动</div>
                  </div>
                </div>
                <div className="text-yellow-600 font-medium">不定期</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              积分用途
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900 mb-1">搜索抵扣</div>
                <div className="text-sm text-gray-600">100积分 = 1元搜索费用</div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900 mb-1">VIP升级</div>
                <div className="text-sm text-gray-600">使用积分购买VIP会员</div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900 mb-1">兑换礼品</div>
                <div className="text-sm text-gray-600">积分商城兑换各种礼品</div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900 mb-1">提现手续费</div>
                <div className="text-sm text-gray-600">使用积分抵扣提现手续费</div>
              </div>
            </div>
          </div>
        </div>

        {/* Points History */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              积分记录
            </h3>
            <button
              onClick={() => window.location.href = '/dashboard/balance-logs'}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              查看完整记录 →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">时间</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">类型</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">描述</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">积分变动</th>
                </tr>
              </thead>
              <tbody>
                {pointsData.pointsHistory.length > 0 ? (
                  pointsData.pointsHistory.map((record: any, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(record.createdAt || Date.now()).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {getPointsTypeIcon(record.type)}
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getPointsTypeColor(record.type)}`}>
                            {getPointsTypeText(record.type)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {record.description || '积分变动'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${
                          record.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {record.amount > 0 ? '+' : ''}{record.amount}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">暂无积分记录</p>
                      <p className="text-sm text-gray-400">开始你的积分之旅吧</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};