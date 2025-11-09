import React from 'react';
import { Coins, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface PointsConfigProps {
  pointsConfig: any;
  onUpdatePointsConfig: (config: any) => void;
  onSave?: (config: any) => Promise<boolean>;
}

export const PointsConfig: React.FC<PointsConfigProps> = ({
  pointsConfig,
  onUpdatePointsConfig,
  onSave
}) => {
  const handleSave = async () => {
    if (onSave) {
      const success = await onSave(pointsConfig);
      if (success) {
        toast.success('积分配置已保存');
      } else {
        toast.error('保存失败，请重试');
      }
    } else {
      toast.success('积分配置已保存');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">积分系统配置</h2>
        <p className="text-gray-600 text-sm mt-1">配置积分获取和消耗规则</p>
      </div>

      <div className="space-y-6">
        {/* 查询消耗配置 */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Coins className="h-5 w-5 mr-2 text-yellow-600" />
            查询消耗
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                每次查询所需积分
              </label>
              <input
                type="number"
                value={pointsConfig.searchCost || 0}
                onChange={(e) => onUpdatePointsConfig({ ...pointsConfig, searchCost: parseInt(e.target.value) })}
                className="input-field"
                min="0"
              />
              <p className="text-sm text-gray-500 mt-1">用户每次搜索需要消耗的积分数量</p>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={pointsConfig.enableSearchCost || false}
                  onChange={(e) => onUpdatePointsConfig({ ...pointsConfig, enableSearchCost: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">启用积分消耗</span>
              </label>
              <p className="text-sm text-gray-500 mt-1">关闭后用户搜索不消耗积分</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                余额兑换积分汇率
              </label>
              <input
                type="number"
                value={pointsConfig.exchangeRate || 10}
                onChange={(e) => onUpdatePointsConfig({ ...pointsConfig, exchangeRate: parseInt(e.target.value) })}
                className="input-field"
                min="1"
              />
              <p className="text-sm text-gray-500 mt-1">1元余额可兑换的积分数量（例如：10表示1元=10积分）</p>
            </div>
          </div>
        </div>

        {/* 每日签到配置 */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Coins className="h-5 w-5 mr-2 text-green-600" />
            每日签到
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                每日签到获得积分
              </label>
              <input
                type="number"
                value={pointsConfig.dailyCheckIn || 0}
                onChange={(e) => onUpdatePointsConfig({ ...pointsConfig, dailyCheckIn: parseInt(e.target.value) })}
                className="input-field"
                min="0"
              />
              <p className="text-sm text-gray-500 mt-1">用户每天签到可获得的积分数量</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                连续签到奖励（天数:积分）
              </label>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600">连续7天</label>
                    <input
                      type="number"
                      value={pointsConfig.consecutiveBonus?.day7 || 0}
                      onChange={(e) => onUpdatePointsConfig({
                        ...pointsConfig,
                        consecutiveBonus: {
                          ...pointsConfig.consecutiveBonus,
                          day7: parseInt(e.target.value)
                        }
                      })}
                      className="input-field"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">连续30天</label>
                    <input
                      type="number"
                      value={pointsConfig.consecutiveBonus?.day30 || 0}
                      onChange={(e) => onUpdatePointsConfig({
                        ...pointsConfig,
                        consecutiveBonus: {
                          ...pointsConfig.consecutiveBonus,
                          day30: parseInt(e.target.value)
                        }
                      })}
                      className="input-field"
                      min="0"
                    />
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">连续签到达到指定天数可获得额外奖励</p>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={pointsConfig.enableDailyCheckIn || false}
                  onChange={(e) => onUpdatePointsConfig({ ...pointsConfig, enableDailyCheckIn: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">启用每日签到</span>
              </label>
            </div>
          </div>
        </div>

        {/* 邀请奖励配置 */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Coins className="h-5 w-5 mr-2 text-blue-600" />
            邀请奖励
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                成功邀请一个用户获得积分
              </label>
              <input
                type="number"
                value={pointsConfig.referralReward || 0}
                onChange={(e) => onUpdatePointsConfig({ ...pointsConfig, referralReward: parseInt(e.target.value) })}
                className="input-field"
                min="0"
              />
              <p className="text-sm text-gray-500 mt-1">邀请的用户注册并完成首次搜索后，邀请人获得的积分</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                被邀请用户注册奖励
              </label>
              <input
                type="number"
                value={pointsConfig.referredUserReward || 0}
                onChange={(e) => onUpdatePointsConfig({ ...pointsConfig, referredUserReward: parseInt(e.target.value) })}
                className="input-field"
                min="0"
              />
              <p className="text-sm text-gray-500 mt-1">通过邀请链接注册的新用户获得的积分</p>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={pointsConfig.enableReferralReward || false}
                  onChange={(e) => onUpdatePointsConfig({ ...pointsConfig, enableReferralReward: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">启用邀请奖励</span>
              </label>
            </div>
          </div>
        </div>

        {/* 注册奖励配置 */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Coins className="h-5 w-5 mr-2 text-purple-600" />
            注册奖励
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                新用户注册奖励积分
              </label>
              <input
                type="number"
                value={pointsConfig.registerReward || 0}
                onChange={(e) => onUpdatePointsConfig({ ...pointsConfig, registerReward: parseInt(e.target.value) })}
                className="input-field"
                min="0"
              />
              <p className="text-sm text-gray-500 mt-1">新用户注册时获得的初始积分</p>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={pointsConfig.enableRegisterReward || false}
                  onChange={(e) => onUpdatePointsConfig({ ...pointsConfig, enableRegisterReward: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">启用注册奖励</span>
              </label>
            </div>
          </div>
        </div>

        {/* 佣金系统配置 */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Coins className="h-5 w-5 mr-2 text-red-600" />
            佣金系统
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                下级用户充值佣金比例（%）
              </label>
              <input
                type="number"
                value={pointsConfig.commissionRate || 0}
                onChange={(e) => onUpdatePointsConfig({ ...pointsConfig, commissionRate: parseFloat(e.target.value) })}
                className="input-field"
                min="0"
                max="100"
                step="0.1"
              />
              <p className="text-sm text-gray-500 mt-1">被邀请用户充值后，邀请人获得的佣金比例（例如：15表示15%）</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                佣金结算方式
              </label>
              <select
                value={pointsConfig.commissionSettlement || 'instant'}
                onChange={(e) => onUpdatePointsConfig({ ...pointsConfig, commissionSettlement: e.target.value })}
                className="input-field"
              >
                <option value="instant">即时到账</option>
                <option value="daily">每日结算</option>
                <option value="weekly">每周结算</option>
                <option value="monthly">每月结算</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">佣金发放的时间方式</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最低提现金额
              </label>
              <input
                type="number"
                value={pointsConfig.minWithdrawAmount || 0}
                onChange={(e) => onUpdatePointsConfig({ ...pointsConfig, minWithdrawAmount: parseFloat(e.target.value) })}
                className="input-field"
                min="0"
                step="0.01"
              />
              <p className="text-sm text-gray-500 mt-1">用户可以提现的最低佣金金额</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                提现手续费（%）
              </label>
              <input
                type="number"
                value={pointsConfig.withdrawFee || 0}
                onChange={(e) => onUpdatePointsConfig({ ...pointsConfig, withdrawFee: parseFloat(e.target.value) })}
                className="input-field"
                min="0"
                max="100"
                step="0.1"
              />
              <p className="text-sm text-gray-500 mt-1">提现时收取的手续费比例（例如：5表示5%）</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                提现方式
              </label>
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <input
                    type="radio"
                    checked={true}
                    readOnly
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">USDT (TRC20)</span>
                </div>
                <span className="text-xs text-gray-500">仅支持USDT提现</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">用户需要提供USDT钱包地址进行提现</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                USDT汇率（1 CNY = ? USDT）
              </label>
              <input
                type="number"
                value={pointsConfig.usdtRate || 0.14}
                onChange={(e) => onUpdatePointsConfig({ ...pointsConfig, usdtRate: parseFloat(e.target.value) })}
                className="input-field"
                min="0"
                step="0.001"
              />
              <p className="text-sm text-gray-500 mt-1">人民币兑换USDT的汇率，用于计算提现金额</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                提现审核方式
              </label>
              <select
                value={pointsConfig.withdrawApproval || 'manual'}
                onChange={(e) => onUpdatePointsConfig({ ...pointsConfig, withdrawApproval: e.target.value })}
                className="input-field"
              >
                <option value="auto">自动审核</option>
                <option value="manual">人工审核</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">提现申请的审核方式</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                自动审核金额上限
              </label>
              <input
                type="number"
                value={pointsConfig.autoApprovalLimit || 0}
                onChange={(e) => onUpdatePointsConfig({ ...pointsConfig, autoApprovalLimit: parseFloat(e.target.value) })}
                className="input-field"
                min="0"
                step="0.01"
              />
              <p className="text-sm text-gray-500 mt-1">低于此金额的提现自动审核通过，0表示全部人工审核</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                佣金层级
              </label>
              <select
                value={pointsConfig.commissionLevels || 1}
                onChange={(e) => onUpdatePointsConfig({ ...pointsConfig, commissionLevels: parseInt(e.target.value) })}
                className="input-field"
              >
                <option value="1">一级（仅直接邀请）</option>
                <option value="2">二级（邀请+间接邀请）</option>
                <option value="3">三级（三层关系）</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">佣金分配的层级深度</p>
            </div>

            {pointsConfig.commissionLevels >= 2 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  二级佣金比例（%）
                </label>
                <input
                  type="number"
                  value={pointsConfig.secondLevelCommissionRate || 0}
                  onChange={(e) => onUpdatePointsConfig({ ...pointsConfig, secondLevelCommissionRate: parseFloat(e.target.value) })}
                  className="input-field"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <p className="text-sm text-gray-500 mt-1">间接邀请用户充值时，上上级获得的佣金比例</p>
              </div>
            )}

            {pointsConfig.commissionLevels >= 3 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  三级佣金比例（%）
                </label>
                <input
                  type="number"
                  value={pointsConfig.thirdLevelCommissionRate || 0}
                  onChange={(e) => onUpdatePointsConfig({ ...pointsConfig, thirdLevelCommissionRate: parseFloat(e.target.value) })}
                  className="input-field"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <p className="text-sm text-gray-500 mt-1">三级关系用户充值时，上上上级获得的佣金比例</p>
              </div>
            )}

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={pointsConfig.enableCommission || false}
                  onChange={(e) => onUpdatePointsConfig({ ...pointsConfig, enableCommission: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">启用佣金系统</span>
              </label>
            </div>
          </div>
        </div>

        {/* 其他配置 */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Coins className="h-5 w-5 mr-2 text-orange-600" />
            其他配置
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                积分过期时间（天）
              </label>
              <input
                type="number"
                value={pointsConfig.pointsExpireDays || 0}
                onChange={(e) => onUpdatePointsConfig({ ...pointsConfig, pointsExpireDays: parseInt(e.target.value) })}
                className="input-field"
                min="0"
              />
              <p className="text-sm text-gray-500 mt-1">积分的有效期，0表示永不过期</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最大积分上限
              </label>
              <input
                type="number"
                value={pointsConfig.maxPoints || 0}
                onChange={(e) => onUpdatePointsConfig({ ...pointsConfig, maxPoints: parseInt(e.target.value) })}
                className="input-field"
                min="0"
              />
              <p className="text-sm text-gray-500 mt-1">用户可持有的最大积分数量，0表示无上限</p>
            </div>
          </div>
        </div>

        {/* 保存按钮 */}
        <div className="flex gap-3">
          <button onClick={handleSave} className="btn-primary flex items-center">
            <Save className="h-5 w-5 mr-2" />
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
};
