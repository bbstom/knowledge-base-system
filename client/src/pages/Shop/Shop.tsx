import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Coins, Gift, Star, CreditCard } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { systemConfigApi } from '../../utils/realApi';

const Shop: React.FC = () => {
  const navigate = useNavigate();
  const [cardConfig, setCardConfig] = useState<any>(null);

  useEffect(() => {
    loadCardConfig();
  }, []);

  const loadCardConfig = async () => {
    try {
      const response = await systemConfigApi.getRechargeCardConfig();
      if (response.success && response.data) {
        setCardConfig(response.data);
      }
    } catch (error) {
      console.error('Failed to load card config:', error);
    }
  };

  const shopItems = [
    {
      id: 'exchange-points',
      title: '余额兑换积分',
      description: '使用余额兑换积分，继续使用搜索功能',
      icon: Coins,
      path: '/shop/exchange',
      color: 'bg-blue-500',
      available: true
    },
    {
      id: 'vip-packages',
      title: 'VIP会员套餐',
      description: '购买VIP会员，享受更多特权',
      icon: Star,
      path: '/dashboard/recharge-center?tab=vip',
      color: 'bg-purple-500',
      available: true
    },
    // 卡密购买卡片 - 根据配置动态显示
    ...(cardConfig && cardConfig.enabled ? [{
      id: 'recharge-card',
      title: cardConfig.title || '充值卡密购买',
      description: cardConfig.description || '购买充值卡密，快速充值积分或开通VIP',
      icon: CreditCard,
      path: cardConfig.purchaseUrl || '/dashboard/recharge-center?tab=card',
      color: 'bg-gradient-to-r from-purple-500 to-blue-500',
      available: true,
      isExternal: !!cardConfig.purchaseUrl
    }] : []),
    {
      id: 'gift-cards',
      title: '礼品卡',
      description: '购买礼品卡，赠送给好友',
      icon: Gift,
      path: '#',
      color: 'bg-pink-500',
      available: false
    }
  ];

  return (
    <Layout showSidebar>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              商城
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            选择您需要的服务和商品
          </p>
        </div>

        {/* Shop Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shopItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-200 ${
                  item.available
                    ? 'hover:shadow-lg cursor-pointer'
                    : 'opacity-60 cursor-not-allowed'
                }`}
                onClick={() => {
                  if (item.available) {
                    if ((item as any).isExternal) {
                      window.open(item.path, '_blank');
                    } else {
                      navigate(item.path);
                    }
                  }
                }}
              >
                <div className={`${item.color} p-6`}>
                  <Icon className="w-12 h-12 text-white" />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                    {item.available && (
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {item.description}
                  </p>
                  {!item.available && (
                    <span className="inline-block px-3 py-1 text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 rounded-full">
                      即将推出
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            💡 温馨提示
          </h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li>• 余额可通过<strong>佣金提现</strong>或<strong>卡密充值</strong>获得</li>
            <li>• 余额可以兑换成积分用于搜索</li>
            <li>• 积分充值和VIP购买可获得推荐佣金</li>
            <li>• 佣金可以提现到USDT钱包或转入余额</li>
            <li>• VIP会员享受无限搜索，无需消耗积分</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default Shop;
