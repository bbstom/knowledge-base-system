import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout/Layout';
import { 
  Coins, Crown, Check, Zap, Shield, Star, 
  ArrowRight, Sparkles, CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RechargePackage {
  id: string;
  points: number;
  amount: number;
  originalAmount?: number;
  enabled: boolean;
}

interface VipPackage {
  id: string;
  name: string;
  days: number;
  amount: number;
  originalAmount?: number;
  features: string[];
  enabled: boolean;
}

export const RechargeCenter: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'points' | 'vip'>('points');
  const [pointsPackages, setPointsPackages] = useState<RechargePackage[]>([]);
  const [vipPackages, setVipPackages] = useState<VipPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      // 从数据库API加载配置
      const response = await fetch('/api/site-config/recharge');
      const data = await response.json();
      
      if (data.success && data.config) {
        setPointsPackages(data.config.pointsPackages?.filter((p: RechargePackage) => p.enabled) || []);
        setVipPackages(data.config.vipPackages?.filter((p: VipPackage) => p.enabled) || []);
      } else {
        // 如果API失败，尝试从localStorage加载（向后兼容）
        let savedConfig = localStorage.getItem('rechargeConfig');
        if (savedConfig) {
          const config = JSON.parse(savedConfig);
          setPointsPackages(config.pointsPackages?.filter((p: RechargePackage) => p.enabled) || []);
          setVipPackages(config.vipPackages?.filter((p: VipPackage) => p.enabled) || []);
        } else {
          // 默认套餐
          setPointsPackages([
            { id: '1', points: 100, amount: 1.5, originalAmount: 2, enabled: true },
            { id: '2', points: 500, amount: 7, originalAmount: 9, enabled: true },
            { id: '3', points: 1000, amount: 14, originalAmount: 17, enabled: true },
            { id: '4', points: 2000, amount: 28, originalAmount: 35, enabled: true },
            { id: '5', points: 5000, amount: 70, originalAmount: 90, enabled: true },
            { id: '6', points: 10000, amount: 140, originalAmount: 180, enabled: true }
          ]);
          setVipPackages([
            { 
              id: '1', 
              name: '月度VIP', 
              days: 30, 
              amount: 4.5,
              originalAmount: 6,
              features: ['无限搜索次数', '专属客服', '优先数据更新', '去除广告'],
              enabled: true 
            },
            { 
              id: '2', 
              name: '季度VIP', 
              days: 90, 
              amount: 12,
              originalAmount: 17,
              features: ['无限搜索次数', '专属客服', '优先数据更新', '去除广告', '赠送500积分'],
              enabled: true 
            },
            { 
              id: '3', 
              name: '年度VIP', 
              days: 365, 
              amount: 42,
              originalAmount: 68,
              features: ['无限搜索次数', '专属客服', '优先数据更新', '去除广告', '赠送2000积分', 'VIP专属标识'],
              enabled: true 
            }
          ]);
        }
      }
    } catch (error) {
      console.error('Failed to load packages:', error);
      // 加载默认套餐
      setPointsPackages([
        { id: '1', points: 100, amount: 1.5, originalAmount: 2, enabled: true },
        { id: '2', points: 500, amount: 7, originalAmount: 9, enabled: true },
        { id: '3', points: 1000, amount: 14, originalAmount: 17, enabled: true },
        { id: '4', points: 2000, amount: 28, originalAmount: 35, enabled: true },
        { id: '5', points: 5000, amount: 70, originalAmount: 90, enabled: true },
        { id: '6', points: 10000, amount: 140, originalAmount: 180, enabled: true }
      ]);
      setVipPackages([
        { 
          id: '1', 
          name: '月度VIP', 
          days: 30, 
          amount: 4.5,
          originalAmount: 6,
          features: ['无限搜索次数', '专属客服', '优先数据更新', '去除广告'],
          enabled: true 
        },
        { 
          id: '2', 
          name: '季度VIP', 
          days: 90, 
          amount: 12,
          originalAmount: 17,
          features: ['无限搜索次数', '专属客服', '优先数据更新', '去除广告', '赠送500积分'],
          enabled: true 
        },
        { 
          id: '3', 
          name: '年度VIP', 
          days: 365, 
          amount: 42,
          originalAmount: 68,
          features: ['无限搜索次数', '专属客服', '优先数据更新', '去除广告', '赠送2000积分', 'VIP专属标识'],
          enabled: true 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePointsRecharge = (pkg: RechargePackage) => {
    // 跳转到支付页面，传递套餐信息（不创建订单）
    navigate('/dashboard/recharge', { 
      state: { 
        packageInfo: {
          type: 'points',
          points: pkg.points,
          amount: pkg.amount,
          originalAmount: pkg.originalAmount
        }
      } 
    });
  };

  const handleVipRecharge = (pkg: VipPackage) => {
    // 跳转到支付页面，传递套餐信息（不创建订单）
    navigate('/dashboard/recharge', { 
      state: { 
        packageInfo: {
          type: 'vip',
          name: pkg.name,
          days: pkg.days,
          amount: pkg.amount,
          originalAmount: pkg.originalAmount,
          features: pkg.features
        }
      } 
    });
  };

  if (loading) {
    return (
      <Layout showSidebar>
        <div className="p-6 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">加载中...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">充值中心</h1>
          <p className="text-gray-600">选择积分充值或开通VIP会员，享受更多特权</p>
          
          {/* 卡密充值入口 */}
          <div className="mt-4">
            <button
              onClick={() => navigate('/dashboard/recharge-card')}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              使用卡密充值
            </button>
          </div>
        </div>

        {/* Tab切换 */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50">
            <button
              onClick={() => setActiveTab('points')}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'points'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Coins className="h-5 w-5 mr-2" />
              积分充值
            </button>
            <button
              onClick={() => setActiveTab('vip')}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'vip'
                  ? 'bg-white text-yellow-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Crown className="h-5 w-5 mr-2" />
              VIP会员
            </button>
          </div>
        </div>

        {/* 积分充值套餐 */}
        {activeTab === 'points' && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pointsPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="relative bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                  onClick={() => handlePointsRecharge(pkg)}
                >
                  {/* 优惠角标 */}
                  {pkg.originalAmount && pkg.originalAmount > pkg.amount && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                      省${(pkg.originalAmount - pkg.amount).toFixed(2)}
                    </div>
                  )}
                  
                  <div className="p-8 text-center">
                    {/* 图标 */}
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 text-blue-500 mb-5">
                      <Coins className="h-8 w-8" />
                    </div>
                    
                    {/* 积分数量 */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {pkg.points} 积分
                    </h3>
                    
                    {/* 价格 */}
                    {pkg.originalAmount && pkg.originalAmount > pkg.amount ? (
                      <div className="mb-4">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="text-gray-400 line-through text-base">${pkg.originalAmount.toFixed(2)}</span>
                          <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded">
                            -{(((pkg.originalAmount - pkg.amount) / pkg.originalAmount) * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mb-3">
                          ${pkg.amount.toFixed(2)}
                        </div>
                        <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                          立省 ${(pkg.originalAmount - pkg.amount).toFixed(2)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mb-4">
                        ${pkg.amount.toFixed(2)}
                      </div>
                    )}
                    
                    {/* 单价 */}
                    <div className="text-sm text-gray-500 mb-5">
                      {(pkg.points / pkg.amount).toFixed(1)} 积分/USD
                    </div>
                    
                    {/* 按钮 */}
                    <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group-hover:scale-105 transform duration-200">
                      立即充值
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {pointsPackages.length === 0 && (
              <div className="text-center py-12">
                <Coins className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">暂无可用的积分充值套餐</p>
              </div>
            )}

            {/* 积分说明 */}
            <div className="mt-8 card bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Sparkles className="h-5 w-5 text-blue-600 mr-2" />
                积分用途
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                  <span>每次搜索消耗相应积分</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                  <span>积分永久有效，不会过期</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                  <span>推荐好友可获得额外积分奖励</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                  <span>充值越多，单价越优惠</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* VIP会员套餐 */}
        {activeTab === 'vip' && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vipPackages.map((pkg, index) => (
                <div
                  key={pkg.id}
                  className={`relative bg-white rounded-xl border-2 hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden ${
                    index === 1 
                      ? 'border-yellow-400 shadow-md' 
                      : 'border-gray-100 hover:border-yellow-400'
                  }`}
                  onClick={() => handleVipRecharge(pkg)}
                >
                  {/* 推荐标签 */}
                  {index === 1 && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
                      ⭐ 推荐
                    </div>
                  )}
                  
                  {/* 优惠角标 */}
                  {pkg.originalAmount && pkg.originalAmount > pkg.amount && index !== 1 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                      省${(pkg.originalAmount - pkg.amount).toFixed(2)}
                    </div>
                  )}
                  
                  <div className="p-6 text-center">
                    {/* 图标 */}
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 ${
                      index === 1 
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' 
                        : 'bg-yellow-50 text-yellow-600'
                    }`}>
                      <Crown className="h-7 w-7" />
                    </div>
                    
                    {/* VIP名称 */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {pkg.name}
                    </h3>
                    
                    {/* 有效期 */}
                    <div className="text-sm text-gray-500 mb-3">
                      有效期 {pkg.days} 天
                    </div>
                    
                    {/* 价格展示 */}
                    <div className="mb-6">
                      {pkg.originalAmount && pkg.originalAmount > pkg.amount ? (
                        <div className="space-y-2">
                          {/* 原价和折扣标签 - 更醒目 */}
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-xl text-gray-500 line-through">
                              ${pkg.originalAmount.toFixed(2)}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 border border-red-300">
                              -{(((pkg.originalAmount - pkg.amount) / pkg.originalAmount) * 100).toFixed(0)}% OFF
                            </span>
                          </div>
                          {/* 现价 */}
                          <div className="text-5xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                            ${pkg.amount.toFixed(2)}
                          </div>
                          {/* 优惠金额 - 更突出 */}
                          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold shadow-lg">
                            🎉 立省 ${(pkg.originalAmount - pkg.amount).toFixed(2)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-5xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                          ${pkg.amount.toFixed(2)}
                        </div>
                      )}
                    </div>

                    {/* VIP特权列表 */}
                    <div className="text-left mb-6 space-y-2">
                      {pkg.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start text-sm text-gray-700">
                          <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button className={`w-full py-3 rounded-lg font-medium transition-all ${
                      index === 1
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                        : 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500'
                    }`}>
                      立即开通
                      <ArrowRight className="h-4 w-4 ml-2 inline" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {vipPackages.length === 0 && (
              <div className="text-center py-12">
                <Crown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">暂无可用的VIP套餐</p>
              </div>
            )}

            {/* VIP特权说明 */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900">无限搜索</h4>
                </div>
                <p className="text-sm text-gray-700">
                  VIP会员享有无限次搜索权限，不消耗积分
                </p>
              </div>

              <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center mr-3">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900">专属服务</h4>
                </div>
                <p className="text-sm text-gray-700">
                  专属客服通道，优先处理您的问题和需求
                </p>
              </div>

              <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center mr-3">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900">尊贵标识</h4>
                </div>
                <p className="text-sm text-gray-700">
                  专属VIP标识，彰显尊贵身份
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
