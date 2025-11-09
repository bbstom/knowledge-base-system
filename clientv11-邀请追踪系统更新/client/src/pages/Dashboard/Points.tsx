import React, { useState, useEffect } from 'react';
import { Award, Gift, Users, ShoppingCart, Calendar, TrendingUp, Star, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout/Layout';
import { userApi } from '../../utils/api';
import { systemConfigApi } from '../../utils/realApi';
import { t } from '../../utils/i18n';
import toast from 'react-hot-toast';

// 图标映射
const iconMap: Record<string, React.ComponentType<any>> = {
  'calendar': Calendar,
  'users': Users,
  'shopping-cart': ShoppingCart,
  'gift': Gift,
  'star': Star,
  'coins': Coins,
};

// 颜色映射
const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
  'blue': { bg: 'bg-blue-100', text: 'text-blue-600', icon: 'text-blue-500' },
  'green': { bg: 'bg-green-100', text: 'text-green-600', icon: 'text-green-500' },
  'purple': { bg: 'bg-purple-100', text: 'text-purple-600', icon: 'text-purple-500' },
  'yellow': { bg: 'bg-yellow-100', text: 'text-yellow-600', icon: 'text-yellow-500' },
  'red': { bg: 'bg-red-100', text: 'text-red-600', icon: 'text-red-500' },
  'orange': { bg: 'bg-orange-100', text: 'text-orange-600', icon: 'text-orange-500' },
};

export const Points: React.FC = () => {
  const [pointsData, setPointsData] = useState({
    totalPoints: 0,
    availablePoints: 0,
    usedPoints: 0,
    pointsHistory: [],
    canClaimDaily: false,
    dailyReward: 10
  });
  const [descriptions, setDescriptions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    loadPointsData();
    loadDescriptions();
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

  const loadDescriptions = async () => {
    try {
      const response = await systemConfigApi.getPointsDescriptions();
      if (response?.success) {
        setDescriptions(response.data);
      }
    } catch (error) {
      console.error('Failed to load points descriptions:', error);
      // 使用默认配置
      setDescriptions({
        earnMethods: [
          { id: 'daily-checkin', title: '每日签到', description: '每天签到获得积分', reward: '+10', icon: 'calendar', color: 'blue', order: 1 },
          { id: 'referral', title: '推荐好友', description: '好友注册并验证邮箱', reward: '+50', icon: 'users', color: 'green', order: 2 },
          { id: 'purchase', title: '消费返积分', description: '每消费1元返1积分', reward: '1:1', icon: 'shopping-cart', color: 'purple', order: 3 },
          { id: 'activity', title: '活动奖励', description: '参与平台活动', reward: '不定期', icon: 'gift', color: 'yellow', order: 4 }
        ],
        usageMethods: [
          { id: 'search', title: '搜索抵扣', description: '使用积分进行数据搜索', order: 1 },
          { id: 'exchange', title: '兑换商品', description: '积分可兑换平台商品', order: 2 },
          { id: 'vip', title: 'VIP升级', description: '使用积分升级VIP会员', order: 3 }
        ]
      });
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
      case 'recharge':
        return '充值获得';
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
              {descriptions?.earnMethods?.map((method: any) => {
                const IconComponent = iconMap[method.icon] || Award;
                const colors = colorMap[method.color] || colorMap['blue'];
                return (
                  <div key={method.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <IconComponent className={`h-5 w-5 ${colors.icon} mr-3`} />
                      <div>
                        <div className="font-medium text-gray-900">{method.title}</div>
                        <div className="text-sm text-gray-600">{method.description}</div>
                      </div>
                    </div>
                    <div className={`${colors.text} font-medium`}>{method.reward}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              积分用途
            </h3>
            <div className="space-y-4">
              {descriptions?.usageMethods?.map((method: any) => (
                <div key={method.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900 mb-1">{method.title}</div>
                  <div className="text-sm text-gray-600">{method.description}</div>
                </div>
              ))}
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

          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-white">
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
                        <span className={`font-medium ${record.amount > 0 ? 'text-green-600' : 'text-red-600'
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