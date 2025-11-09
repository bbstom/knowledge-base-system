import React, { useState } from 'react';
import { Layout } from '../../components/Layout/Layout';
import { 
  CreditCard, Check, AlertCircle, DollarSign, 
  Gift, Crown, Loader
} from 'lucide-react';
import toast from 'react-hot-toast';

export const RechargeByCard: React.FC = () => {
  const [cardCode, setCardCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cardInfo, setCardInfo] = useState<any>(null);

  // 验证卡密
  const handleVerifyCard = async () => {
    if (!cardCode.trim()) {
      toast.error('请输入卡密');
      return;
    }

    setVerifying(true);
    setCardInfo(null);

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

      if (data.success) {
        setCardInfo(data.card);
        toast.success('卡密验证成功');
      } else {
        toast.error(data.message);
        setCardInfo(null);
      }
    } catch (error) {
      console.error('验证卡密失败:', error);
      toast.error('验证卡密失败');
    } finally {
      setVerifying(false);
    }
  };

  // 使用卡密
  const handleUseCard = async () => {
    if (!cardCode.trim()) {
      toast.error('请输入卡密');
      return;
    }

    setLoading(true);

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
        toast.success('卡密使用成功！');
        
        // 显示充值结果
        const card = data.card;
        let message = '';
        if (card.type === 'balance') {
          message = `成功充值 $${card.amount} 余额`;
        } else if (card.type === 'points') {
          message = `成功充值 ${card.points} 积分`;
        } else if (card.type === 'vip') {
          message = `成功开通 ${card.vipDays} 天VIP`;
        }
        
        setTimeout(() => {
          toast.success(message);
          // 刷新页面或跳转
          window.location.reload();
        }, 1000);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('使用卡密失败:', error);
      toast.error('使用卡密失败');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    if (type === 'balance') return <DollarSign className="h-6 w-6 text-green-600" />;
    if (type === 'points') return <Gift className="h-6 w-6 text-blue-600" />;
    if (type === 'vip') return <Crown className="h-6 w-6 text-yellow-600" />;
    return null;
  };

  const getTypeLabel = (type: string) => {
    if (type === 'balance') return '余额充值';
    if (type === 'points') return '积分充值';
    if (type === 'vip') return 'VIP充值';
    return type;
  };

  const getValueDisplay = (card: any) => {
    if (card.type === 'balance') return `$${card.amount}`;
    if (card.type === 'points') return `${card.points} 积分`;
    if (card.type === 'vip') {
      return card.vipPackageName 
        ? `${card.vipPackageName} (${card.vipDays}天)` 
        : `${card.vipDays} 天VIP`;
    }
    return '';
  };

  return (
    <Layout showSidebar>
      <div className="p-6">
        {/* 页头 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <CreditCard className="h-8 w-8 mr-3 text-blue-600" />
            卡密充值
          </h1>
          <p className="text-gray-600 mt-1">使用充值卡密快速充值余额、积分或VIP</p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* 充值卡片 */}
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              输入卡密
            </h2>

            {/* 卡密输入 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                充值卡密码
              </label>
              <input
                type="text"
                value={cardCode}
                onChange={(e) => {
                  setCardCode(e.target.value.toUpperCase());
                  setCardInfo(null);
                }}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="input-field text-center text-lg font-mono tracking-wider"
                maxLength={19}
              />
              <p className="text-xs text-gray-500 mt-2">
                请输入16位卡密码，格式：XXXX-XXXX-XXXX-XXXX
              </p>
            </div>

            {/* 验证按钮 */}
            <button
              onClick={handleVerifyCard}
              disabled={verifying || !cardCode.trim()}
              className="btn-secondary w-full mb-4 flex items-center justify-center"
            >
              {verifying ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  验证中...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  验证卡密
                </>
              )}
            </button>

            {/* 卡密信息显示 */}
            {cardInfo && cardInfo.status === 'valid' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {getTypeIcon(cardInfo.type)}
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-green-800">
                      卡密有效
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <div className="flex items-center justify-between mb-2">
                        <span>类型：</span>
                        <span className="font-semibold">{getTypeLabel(cardInfo.type)}</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span>价值：</span>
                        <span className="font-semibold text-lg">{getValueDisplay(cardInfo)}</span>
                      </div>
                      {cardInfo.expiresAt && (
                        <div className="flex items-center justify-between">
                          <span>有效期至：</span>
                          <span>{new Date(cardInfo.expiresAt).toLocaleDateString('zh-CN')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 使用按钮 */}
            <button
              onClick={handleUseCard}
              disabled={loading || !cardCode.trim()}
              className="btn-primary w-full flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  使用中...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  立即使用
                </>
              )}
            </button>
          </div>

          {/* 使用说明 */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
              使用说明
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>每张卡密只能使用一次，使用后立即失效</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>卡密不区分大小写，系统会自动转换</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>余额卡密充值后立即到账，可用于消费</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>积分卡密充值后立即到账，可用于兑换</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>VIP卡密充值后立即生效，享受会员特权</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>请妥善保管卡密，遗失或泄露概不负责</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">⚠</span>
                <span className="text-red-600 font-medium">
                  请注意卡密有效期，过期卡密将无法使用
                </span>
              </li>
            </ul>
          </div>

          {/* 卡密类型说明 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="card text-center">
              <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">余额卡密</h4>
              <p className="text-sm text-gray-600">
                充值账户余额<br/>可用于各种消费
              </p>
            </div>

            <div className="card text-center">
              <Gift className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">积分卡密</h4>
              <p className="text-sm text-gray-600">
                充值账户积分<br/>可兑换余额或VIP
              </p>
            </div>

            <div className="card text-center">
              <Crown className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">VIP卡密</h4>
              <p className="text-sm text-gray-600">
                开通VIP会员<br/>享受专属特权
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
