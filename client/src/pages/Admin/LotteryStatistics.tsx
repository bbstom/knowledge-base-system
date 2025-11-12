import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, Gift, DollarSign, 
  Calendar, Award, BarChart3, PieChart 
} from 'lucide-react';
import { adminLotteryApi } from '../../utils/adminApi';
import toast from 'react-hot-toast';

export const LotteryStatistics: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadActivities();
    loadStatistics();
  }, [selectedActivity, dateRange]);

  const loadActivities = async () => {
    try {
      const response = await adminLotteryApi.getActivities({ page: 1, limit: 100 });
      if (response.success) {
        setActivities(response.data.activities || []);
      }
    } catch (error) {
      console.error('加载活动失败:', error);
    }
  };

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const response = await adminLotteryApi.getStatistics({
        activityId: selectedActivity === 'all' ? undefined : selectedActivity,
        dateRange
      });
      
      if (response.success) {
        setStats(response.data);
      } else {
        toast.error('加载统计数据失败');
      }
    } catch (error: any) {
      toast.error(error.message || '加载统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">抽奖数据分析</h1>
          <p className="text-gray-600 mt-1">查看抽奖活动的详细统计数据</p>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择活动
            </label>
            <select
              value={selectedActivity}
              onChange={(e) => setSelectedActivity(e.target.value)}
              className="input"
            >
              <option value="all">全部活动</option>
              {activities.map((activity) => (
                <option key={activity._id} value={activity._id}>
                  {activity.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              时间范围
            </label>
            <div className="flex gap-2">
              {[
                { value: 'today', label: '今日' },
                { value: 'week', label: '本周' },
                { value: 'month', label: '本月' },
                { value: 'all', label: '全部' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDateRange(option.value as any)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    dateRange === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {stats && (
        <>
          {/* 核心指标 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">总抽奖次数</p>
                  <p className="text-3xl font-bold mt-2">{stats.overview?.totalDraws || 0}</p>
                  <p className="text-blue-100 text-xs mt-1">
                    参与用户: {stats.overview?.uniqueUsers || 0}
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-blue-200" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">消耗积分</p>
                  <p className="text-3xl font-bold mt-2">{stats.overview?.totalPointsSpent || 0}</p>
                  <p className="text-green-100 text-xs mt-1">
                    平均: {stats.overview?.avgPointsPerDraw || 0}/次
                  </p>
                </div>
                <DollarSign className="h-12 w-12 text-green-200" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">发放奖品</p>
                  <p className="text-3xl font-bold mt-2">{stats.overview?.totalPrizesWon || 0}</p>
                  <p className="text-purple-100 text-xs mt-1">
                    中奖率: {stats.overview?.winRate || 0}%
                  </p>
                </div>
                <Gift className="h-12 w-12 text-purple-200" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">奖品价值</p>
                  <p className="text-3xl font-bold mt-2">{stats.overview?.totalPrizeValue || 0}</p>
                  <p className="text-orange-100 text-xs mt-1">
                    积分等值
                  </p>
                </div>
                <Award className="h-12 w-12 text-orange-200" />
              </div>
            </div>
          </div>

          {/* 奖品分布 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-blue-600" />
                  奖品类型分布
                </h2>
              </div>
              <div className="space-y-3">
                {stats.prizeDistribution?.map((item: any, index: number) => {
                  const colors = [
                    'bg-blue-500',
                    'bg-green-500',
                    'bg-purple-500',
                    'bg-yellow-500',
                    'bg-red-500',
                    'bg-pink-500'
                  ];
                  const color = colors[index % colors.length];
                  
                  return (
                    <div key={item.type}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700 font-medium">
                          {item.typeName} ({item.count}次)
                        </span>
                        <span className="text-gray-600">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${color} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                  热门奖品 TOP 5
                </h2>
              </div>
              <div className="space-y-3">
                {stats.topPrizes?.slice(0, 5).map((prize: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{prize.name}</div>
                        <div className="text-xs text-gray-500">
                          {prize.type === 'points' && `${prize.value} 积分`}
                          {prize.type === 'vip' && `${prize.value} 天VIP`}
                          {prize.type === 'coupon' && '优惠券'}
                          {prize.type === 'physical' && '实物奖品'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{prize.count}次</div>
                      <div className="text-xs text-gray-500">{prize.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 活动排行 */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                活动参与排行
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      活动名称
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      抽奖次数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      参与用户
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      消耗积分
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      中奖率
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      状态
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.activityRanking?.map((activity: any) => (
                    <tr key={activity.activityId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{activity.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {activity.totalDraws}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {activity.uniqueUsers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {activity.pointsSpent}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          activity.winRate > 50 ? 'bg-green-100 text-green-800' :
                          activity.winRate > 20 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {activity.winRate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          activity.status === 'active' ? 'bg-green-100 text-green-800' :
                          activity.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.status === 'active' ? '进行中' :
                           activity.status === 'scheduled' ? '未开始' : '已结束'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 用户参与排行 */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                用户参与排行 TOP 10
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      排名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      用户名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      抽奖次数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      中奖次数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      消耗积分
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      中奖率
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.topUsers?.slice(0, 10).map((user: any, index: number) => (
                    <tr key={user.userId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{user.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {user.totalDraws}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {user.prizesWon}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {user.pointsSpent}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-blue-600 font-medium">
                          {user.winRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
