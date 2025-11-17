import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout/Layout';
import { 
  Coins, Crown, Check, Zap, Shield, Star, 
  Sparkles, CreditCard, Key, XCircle, ExternalLink
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useUser } from '../../hooks/useUser';

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
  const location = useLocation();
  const { refreshUser } = useUser();
  const [activeTab, setActiveTab] = useState<'points' | 'vip' | 'card'>('points');
  const [pointsPackages, setPointsPackages] = useState<RechargePackage[]>([]);
  const [vipPackages, setVipPackages] = useState<VipPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardCode, setCardCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [cardInfo, setCardInfo] = useState<any>(null);
  const [rechargeCardConfig, setRechargeCardConfig] = useState<any>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultInfo, setResultInfo] = useState<{
    success: boolean;
    title: string;
    message: string;
    type: 'points' | 'vip' | 'card';
  } | null>(null);

  useEffect(() => {
    loadPackages();
    loadRechargeCardConfig();
    
    // 检查URL参数
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab === 'vip') {
      setActiveTab('vip');
    } else if (tab === 'card') {
      setActiveTab('card');
    }
  }, [location]);

  const loadRechargeCardConfig = async () => {
    try {
      const response = await fetch('/api/system-config/recharge-card');
      const data = await response.json();
      if (data.success && data.data) {
        setRechargeCardConfig(data.data);
      }
    } catch (error) {
      console.error('Failed to load recharge card config:', error);
    }
  };

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
          <p className="text-gray-600">选择积分充值、开通VIP会员或使用卡密充值</p>
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
            <button
              onClick={() => setActiveTab('card')}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'card'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CreditCard className="h-5 w-5 mr-2" />
              卡密充值
            </button>
          </div>
        </div>

        {/* 积分充值套餐 */}
        {activeTab === 'points' && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {pointsPackages.map((pkg, index) => {
                // 根据套餐大小选择不同的渐变色
                const gradients = [
                  'from-blue-400 to-blue-600',
                  'from-indigo-400 to-indigo-600',
                  'from-purple-400 to-purple-600',
                  'from-pink-400 to-pink-600',
                  'from-orange-400 to-orange-600',
                  'from-red-400 to-red-600'
                ];
                const gradient = gradients[index % gradients.length];
                
                return (
                  <div
                    key={pkg.id}
                    className="relative bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden"
                    onClick={() => handlePointsRecharge(pkg)}
                  >
                    {/* 背景装饰 */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`}></div>
                    
                    {/* 优惠角标 */}
                    {pkg.originalAmount && pkg.originalAmount > pkg.amount && (
                      <div className="absolute top-3 right-3 z-10">
                        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg animate-pulse">
                          省{(((pkg.originalAmount - pkg.amount) / pkg.originalAmount) * 100).toFixed(0)}%
                        </div>
                      </div>
                    )}
                    
                    <div className="relative p-6 text-center">
                      {/* 图标 */}
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Coins className="h-8 w-8" />
                      </div>
                      
                      {/* 积分数量 */}
                      <div className="mb-3">
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                          {pkg.points.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">
                          积分
                        </div>
                      </div>
                      
                      {/* 价格 */}
                      <div className="mb-4">
                        {pkg.originalAmount && pkg.originalAmount > pkg.amount ? (
                          <div className="space-y-1">
                            <div className="text-sm text-gray-400 line-through">
                              原价 ${pkg.originalAmount.toFixed(2)}
                            </div>
                            <div className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                              ${pkg.amount.toFixed(2)}
                            </div>
                          </div>
                        ) : (
                          <div className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                            ${pkg.amount.toFixed(2)}
                          </div>
                        )}
                      </div>
                      
                      {/* 性价比标签 */}
                      <div className="mb-4 text-xs text-gray-500">
                        ≈ ${(pkg.amount / pkg.points * 100).toFixed(2)}/100积分
                      </div>
                      
                      {/* 按钮 */}
                      <button className={`w-full bg-gradient-to-r ${gradient} hover:shadow-lg text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform group-hover:scale-105`}>
                        立即充值
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {pointsPackages.length === 0 && (
              <div className="text-center py-12">
                <Coins className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">暂无可用的积分充值套餐</p>
              </div>
            )}

            {/* 积分说明 */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center text-sm">
                <Sparkles className="h-4 w-4 text-blue-600 mr-2" />
                积分用途
              </h3>
              <ul className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-blue-600 mr-1.5 flex-shrink-0" />
                  <span>搜索消耗积分</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-blue-600 mr-1.5 flex-shrink-0" />
                  <span>积分永久有效</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-blue-600 mr-1.5 flex-shrink-0" />
                  <span>推荐好友奖励</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-blue-600 mr-1.5 flex-shrink-0" />
                  <span>充值越多越优惠</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* VIP会员套餐 */}
        {activeTab === 'vip' && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {vipPackages.map((pkg, index) => (
                <div
                  key={pkg.id}
                  className={`relative bg-white rounded-lg border-2 hover:shadow-lg transition-all cursor-pointer group ${
                    index === 1 
                      ? 'border-yellow-400 shadow-md' 
                      : 'border-gray-200 hover:border-yellow-400'
                  }`}
                  onClick={() => handleVipRecharge(pkg)}
                >
                  {/* 推荐标签 */}
                  {index === 1 && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded z-10">
                      推荐
                    </div>
                  )}
                  
                  {/* 优惠角标 */}
                  {pkg.originalAmount && pkg.originalAmount > pkg.amount && index !== 1 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                      -{(((pkg.originalAmount - pkg.amount) / pkg.originalAmount) * 100).toFixed(0)}%
                    </div>
                  )}
                  
                  <div className="p-5 text-center">
                    {/* 图标 */}
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                      index === 1 
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' 
                        : 'bg-yellow-50 text-yellow-600'
                    }`}>
                      <Crown className="h-6 w-6" />
                    </div>
                    
                    {/* VIP名称 */}
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {pkg.name}
                    </h3>
                    
                    {/* 有效期 */}
                    <div className="text-xs text-gray-500 mb-3">
                      {pkg.days} 天
                    </div>
                    
                    {/* 价格展示 */}
                    <div className="mb-4">
                      {pkg.originalAmount && pkg.originalAmount > pkg.amount ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-sm text-gray-400 line-through">
                              ${pkg.originalAmount.toFixed(2)}
                            </span>
                            <span className="text-xs bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded">
                              -{(((pkg.originalAmount - pkg.amount) / pkg.originalAmount) * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="text-3xl font-bold text-yellow-600">
                            ${pkg.amount.toFixed(2)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-3xl font-bold text-yellow-600">
                          ${pkg.amount.toFixed(2)}
                        </div>
                      )}
                    </div>

                    {/* VIP特权列表 */}
                    <div className="text-left mb-4 space-y-1.5">
                      {pkg.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start text-xs text-gray-600">
                          <Check className="h-4 w-4 text-green-500 mr-1.5 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
                      index === 1
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                        : 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500'
                    }`}>
                      立即开通
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
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm">无限搜索</h4>
                </div>
                <p className="text-xs text-gray-600">
                  无限次搜索权限，不消耗积分
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center mr-2">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm">专属服务</h4>
                </div>
                <p className="text-xs text-gray-600">
                  专属客服通道，优先处理
                </p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center mr-2">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm">尊贵标识</h4>
                </div>
                <p className="text-xs text-gray-600">
                  专属VIP标识，彰显身份
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 卡密充值 */}
        {activeTab === 'card' && (
          <div className="max-w-2xl mx-auto">
            {/* 卡密充值表单 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-600 mb-4">
                  <CreditCard className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">卡密充值</h2>
                <p className="text-gray-600 text-sm">输入您的充值卡密，立即到账</p>
              </div>

              {/* 获取充值卡按钮 */}
              {rechargeCardConfig?.purchaseUrl && (
                <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-purple-900 mb-1">
                        还没有充值卡？
                      </h3>
                      <p className="text-xs text-purple-700">
                        点击按钮前往购买充值卡密
                      </p>
                    </div>
                    <a
                      href={rechargeCardConfig.purchaseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      立即获取充值卡
                    </a>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    充值卡密
                  </label>
                  <input
                    type="text"
                    value={cardCode}
                    onChange={(e) => {
                      setCardCode(e.target.value.trim());
                      setCardInfo(null); // 清除之前的卡密信息
                    }}
                    placeholder="请输入充值卡密"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  
                  {/* 卡密信息显示 */}
                  {cardInfo && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-900">卡密有效</p>
                          <div className="mt-1 text-sm text-green-700">
                            {cardInfo.type === 'balance' && (
                              <p>余额充值卡：<span className="font-bold">${cardInfo.amount}</span></p>
                            )}
                            {cardInfo.type === 'points' && (
                              <p>积分充值卡：<span className="font-bold">{cardInfo.points} 积分</span></p>
                            )}
                            {cardInfo.type === 'vip' && (
                              <p>VIP充值卡：<span className="font-bold">{cardInfo.vipDays} 天</span></p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      if (!cardCode) {
                        toast.error('请输入充值卡密');
                        return;
                      }

                      try {
                        const token = document.cookie.split('token=')[1]?.split(';')[0];
                        const response = await fetch('/api/recharge-card/verify', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                          },
                          body: JSON.stringify({ code: cardCode })
                        });

                        const data = await response.json();

                        if (data.success && data.card) {
                          setCardInfo(data.card);
                          toast.success('卡密检测成功');
                        } else {
                          setCardInfo(null);
                          toast.error(data.message || '卡密无效或已使用');
                        }
                      } catch (error) {
                        console.error('Verify error:', error);
                        setCardInfo(null);
                        toast.error('检测失败，请稍后重试');
                      }
                    }}
                    disabled={!cardCode}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all disabled:cursor-not-allowed"
                  >
                    检测卡密
                  </button>

                  <button
                    onClick={async () => {
                      if (!cardCode) {
                        toast.error('请输入充值卡密');
                        return;
                      }

                      setRedeeming(true);
                      try {
                        const token = document.cookie.split('token=')[1]?.split(';')[0];
                        const response = await fetch('/api/recharge-card/use', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                          },
                          body: JSON.stringify({ code: cardCode })
                        });

                        const data = await response.json();

                        if (data.success) {
                          // 刷新用户信息
                          refreshUser();
                          
                          // 显示成功弹窗
                          let message = '';
                          if (cardInfo) {
                            if (cardInfo.type === 'balance') {
                              message = `成功充值 $${cardInfo.amount} 余额`;
                            } else if (cardInfo.type === 'points') {
                              message = `成功充值 ${cardInfo.points} 积分`;
                            } else if (cardInfo.type === 'vip') {
                              message = `成功开通 ${cardInfo.vipDays} 天VIP`;
                            }
                          }
                          setResultInfo({
                            success: true,
                            title: '充值成功',
                            message: message || data.message || '充值成功！',
                            type: 'card'
                          });
                          setShowResultModal(true);
                          setCardCode('');
                          setCardInfo(null);
                        } else {
                          // 显示失败弹窗
                          setResultInfo({
                            success: false,
                            title: '充值失败',
                            message: data.message || '充值失败，请检查卡密是否正确',
                            type: 'card'
                          });
                          setShowResultModal(true);
                        }
                      } catch (error) {
                        console.error('Redeem error:', error);
                        setResultInfo({
                          success: false,
                          title: '充值失败',
                          message: '充值失败，请稍后重试',
                          type: 'card'
                        });
                        setShowResultModal(true);
                      } finally {
                        setRedeeming(false);
                      }
                    }}
                    disabled={redeeming || !cardCode}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                  >
                    {redeeming ? '充值中...' : '立即充值'}
                  </button>
                </div>
              </div>

              {/* 使用说明 */}
              <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center text-sm">
                  <Key className="h-4 w-4 text-purple-600 mr-2" />
                  使用说明
                </h3>
                <ul className="space-y-1.5 text-xs text-gray-700">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-purple-600 mr-1.5 flex-shrink-0 mt-0.5" />
                    <span>输入完整的充值卡密（区分大小写）</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-purple-600 mr-1.5 flex-shrink-0 mt-0.5" />
                    <span>每个卡密只能使用一次</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-purple-600 mr-1.5 flex-shrink-0 mt-0.5" />
                    <span>充值成功后立即到账</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-purple-600 mr-1.5 flex-shrink-0 mt-0.5" />
                    <span>如有问题请联系客服</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 结果弹窗（无遮罩） */}
      {showResultModal && resultInfo && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-gray-200">
            {/* 图标 */}
            <div className="text-center mb-4">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                resultInfo.success ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {resultInfo.success ? (
                  <Check className="h-10 w-10 text-green-600" />
                ) : (
                  <XCircle className="h-10 w-10 text-red-600" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{resultInfo.title}</h2>
              <p className="text-gray-600">{resultInfo.message}</p>
            </div>

            {/* 按钮 */}
            <div className="flex gap-3 mt-6">
              {resultInfo.success ? (
                <>
                  <button
                    onClick={() => {
                      setShowResultModal(false);
                      window.location.reload();
                    }}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    刷新页面
                  </button>
                  <button
                    onClick={() => setShowResultModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    继续操作
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowResultModal(false)}
                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  关闭
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
