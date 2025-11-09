import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Award, Users, Gift, Crown } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { authApi, getCurrentUser } from '../../utils/api';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
      
      // 从后端获取最新用户信息
      const response = await authApi.getCurrentUser();
      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDailyClaim = async () => {
    if (claiming) return;
    
    setClaiming(true);
    try {
      const response = await authApi.claimDailyPoints();
      if (response.success) {
        toast.success(`签到成功！获得 ${response.data.pointsEarned} 积分`);
        // 更新用户数据
        await loadUserData();
      }
    } catch (error: any) {
      toast.error(error.message || '签到失败');
    } finally {
      setClaiming(false);
    }
  };

  const canClaimToday = () => {
    if (!user?.lastDailyClaimAt) return true;
    
    const lastClaim = new Date(user.lastDailyClaimAt);
    const today = new Date();
    
    return lastClaim.toDateString() !== today.toDateString();
  };

  const stats = [
    {
      title: '积分',
      value: loading ? '...' : (user?.points || 0).toString(),
      description: '用于搜索',
      icon: Award,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: '余额',
      value: loading ? '...' : `¥${(user?.balance || 0).toFixed(2)}`,
      description: '可兑换积分',
      icon: Wallet,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: '佣金',
      value: loading ? '...' : `¥${(user?.commission || 0).toFixed(2)}`,
      description: '可提现',
      icon: Gift,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: '推荐用户',
      value: loading ? '...' : (user?.referralCount || 0).toString(),
      description: '邀请好友',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <Layout showSidebar>
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                欢迎回来，{user?.username || '用户'}！
              </h1>
              <p className="text-gray-600">
                这是您的账户概览和最新活动
              </p>
            </div>
            
            {user?.isVip && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg text-white">
                <Crown className="h-5 w-5" />
                <span className="font-semibold">VIP会员</span>
              </div>
            )}
          </div>
        </div>

        {/* 每日签到卡片 */}
        <div className="mb-6">
          <div className="card bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Gift className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">每日签到</h3>
                  <p className="text-sm text-white/80">
                    {canClaimToday() ? '签到领取 10 积分' : '今天已经签到过了'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleDailyClaim}
                disabled={!canClaimToday() || claiming}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  canClaimToday() && !claiming
                    ? 'bg-white text-blue-600 hover:bg-gray-100'
                    : 'bg-white/20 text-white/50 cursor-not-allowed'
                }`}
              >
                {claiming ? '签到中...' : canClaimToday() ? '立即签到' : '已签到'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    {stat.description && (
                      <p className="text-xs text-gray-500 mt-1">
                        {stat.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/shop')}
            className="card text-center hover:shadow-lg transition-shadow cursor-pointer"
          >
            <Gift className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">商城</h3>
            <p className="text-sm text-gray-600">余额兑换积分</p>
          </button>
          
          <button 
            onClick={() => navigate('/dashboard/recharge-center')}
            className="card text-center hover:shadow-lg transition-shadow cursor-pointer"
          >
            <Wallet className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">充值中心</h3>
            <p className="text-sm text-gray-600">积分充值/VIP开通</p>
          </button>
          
          <button 
            onClick={() => navigate('/dashboard/referral')}
            className="card text-center hover:shadow-lg transition-shadow cursor-pointer"
          >
            <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">邀请好友</h3>
            <p className="text-sm text-gray-600">获得推荐奖励</p>
          </button>
          
          <button 
            onClick={() => navigate('/dashboard/points')}
            className="card text-center hover:shadow-lg transition-shadow cursor-pointer"
          >
            <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">积分中心</h3>
            <p className="text-sm text-gray-600">查看积分详情</p>
          </button>
        </div>
      </div>
    </Layout>
  );
};