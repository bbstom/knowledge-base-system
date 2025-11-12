import React, { useState, useEffect } from 'react';
import { Gift, Sparkles, Clock, Award, Zap } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { lotteryApi, ApiResponse } from '../../utils/api';
import toast from 'react-hot-toast';
import { SlotMachine } from '../../components/SlotMachine';
import { LotteryWheel } from '../../components/LotteryWheel';
import { useUser } from '../../hooks/useUser';
import { Link } from 'react-router-dom';

export const Lottery: React.FC = () => {
  const { user } = useUser();
  const [activities, setActivities] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'draw' | 'records'>('draw');
  const [currentActivity, setCurrentActivity] = useState<any>(null);
  const [showRechargePrompt, setShowRechargePrompt] = useState(false);

  useEffect(() => {
    loadActivities();
    loadRecords();
  }, []);

  const loadActivities = async () => {
    try {
      const response: any = await lotteryApi.getActivities();
      if (response.success) {
        setActivities(response.data || []);
      }
    } catch (error) {
      console.error('加载活动失败:', error);
    }
  };

  const loadRecords = async () => {
    try {
      const response: any = await lotteryApi.getMyRecords({ page: 1, limit: 50 });
      if (response.success) {
        setRecords(response.data.records || []);
      }
    } catch (error) {
      console.error('加载记录失败:', error);
    }
  };

  // 点击活动卡片 - 选择活动并显示在右侧
  const handleDraw = async (activity: any) => {
    if (drawing) return;
    
    setCurrentActivity(activity);
    setResult(null); // 清除之前的结果
  };

  // 在抽奖界面点击"立即抽奖"按钮 - 检查充值并开始抽奖
  const handleStartDraw = async () => {
    if (drawing || !currentActivity) return;
    
    // 检查用户是否充值过（通过检查用户的余额或VIP状态）
    const hasRecharged = user && (user.isVip || user.balance > 0);
    if (!hasRecharged) {
      setShowRechargePrompt(true);
      return;
    }
    
    // 开始抽奖
    setDrawing(true);
    
    try {
      const response: any = await lotteryApi.draw(currentActivity._id);
      if (response.success) {
        // 设置真实结果
        setResult(response.data);
      } else {
        // 失败也显示结果
        setResult({
          prize: {
            name: '谢谢参与',
            type: 'thanks',
            value: 0
          },
          error: response.message,
          needRecharge: response.message?.includes('充值用户')
        });
        // 对于转盘，立即停止动画
        if (currentActivity.animationType === 'wheel') {
          setDrawing(false);
        }
      }
    } catch (error: any) {
      setResult({
        prize: {
          name: '谢谢参与',
          type: 'thanks',
          value: 0
        },
        error: error.message || '抽奖失败'
      });
      // 对于转盘，立即停止动画
      if (currentActivity.animationType === 'wheel') {
        setDrawing(false);
      }
    }
  };

  const handleAnimationComplete = () => {
    setDrawing(false);
    
    // 如果有错误信息，在动画结束后显示
    if (result?.error) {
      if (result.needRecharge) {
        toast.error('仅限充值用户参与抽奖，请先充值！', { duration: 4000 });
      } else {
        toast.error(result.error);
      }
      // 清除错误结果，允许重新抽奖
      setTimeout(() => setResult(null), 2000);
    } else {
      // 正常抽奖结果
      loadActivities();
      loadRecords();
      
      if (result) {
        if (result.prize.type === 'thanks' || result.prize.type === 'none') {
          toast('谢谢参与，再接再厉！', { icon: '😊' });
        } else {
          toast.success(`恭喜获得：${result.prize.name}！`, { duration: 3000 });
        }
      }
      
      // 3秒后清除结果，允许继续抽奖
      setTimeout(() => setResult(null), 3000);
    }
  };

  const handleClaim = async (recordId: string) => {
    try {
      const response: any = await lotteryApi.claimPrize(recordId);
      if (response.success) {
        toast.success('领取成功！');
        loadRecords();
      } else {
        toast.error(response.message || '领取失败');
      }
    } catch (error: any) {
      toast.error(error.message || '领取失败');
    }
  };

  const prizeTypeLabels: Record<string, string> = {
    points: '积分',
    vip: 'VIP天数',
    coupon: '优惠券',
    physical: '实物',
    thanks: '谢谢参与'
  };

  const statusLabels: Record<string, string> = {
    pending: '待领取',
    claimed: '已领取',
    expired: '已过期',
    cancelled: '已取消'
  };

  return (
    <Layout showSidebar containerSize="lg">
      <div className="py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            幸运抽奖
          </h1>
          <p className="text-gray-600">消耗积分参与抽奖，赢取丰厚奖品！</p>
        </div>

        {/* 充值提示弹窗 */}
        {showRechargePrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
              <div className="mb-6">
                <div className="text-7xl mb-4">🔒</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  仅限充值用户参与抽奖
                </h3>
                <p className="text-gray-600 mb-2">
                  您可以浏览抽奖活动，但参与抽奖需要先充值
                </p>
                <p className="text-sm text-gray-500">
                  充值后即可参与抽奖，赢取丰厚奖品！
                </p>
              </div>
              
              <div className="space-y-3">
                <Link 
                  to="/dashboard/recharge-center"
                  className="block w-full btn-primary py-3 text-center"
                  onClick={() => setShowRechargePrompt(false)}
                >
                  立即充值
                </Link>
                <button 
                  onClick={() => setShowRechargePrompt(false)}
                  className="block w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  继续浏览
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 标签切换 */}
        <div className="flex space-x-4 border-b mb-6">
          <button
            onClick={() => setActiveTab('draw')}
            className={`flex items-center px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'draw'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sparkles className="h-5 w-5 mr-2" />
            抽奖活动
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`flex items-center px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'records'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Award className="h-5 w-5 mr-2" />
            我的记录
          </button>
        </div>

        {/* 抽奖活动 */}
        {activeTab === 'draw' && (
          <>
            {/* 活动选择区域 */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">选择抽奖活动</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activities.map((activity) => (
                  <div 
                    key={activity._id} 
                    className={`card hover:shadow-lg transition-all cursor-pointer ${
                      currentActivity?._id === activity._id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => handleDraw(activity)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{activity.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      </div>
                      <Gift className="h-6 w-6 text-blue-600 flex-shrink-0 ml-2" />
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        消耗 {activity.costPoints} 积分/次
                      </div>
                      {activity.dailyLimit > 0 && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Award className="h-4 w-4 mr-2" />
                          今日剩余: {activity.remainingDraws === -1 ? '无限' : `${activity.remainingDraws}次`}
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-600">
                        <Gift className="h-4 w-4 mr-2" />
                        {activity.prizes?.length || 0} 种奖品
                      </div>
                    </div>

                    {currentActivity?._id === activity._id && (
                      <div className="text-sm text-blue-600 font-medium flex items-center">
                        <Zap className="h-4 w-4 mr-1" />
                        已选中，请在下方开始抽奖
                      </div>
                    )}
                  </div>
                ))}

                {activities.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    暂无可用的抽奖活动
                  </div>
                )}
              </div>
            </div>

            {/* 抽奖区域 - 根据动画类型显示老虎机或转盘 */}
            {currentActivity ? (
              <div className="card bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {currentActivity.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    消耗 {currentActivity.costPoints} 积分/次
                  </p>
                </div>
                
                {currentActivity.animationType === 'wheel' ? (
                  // 转盘模式
                  <div>
                    <LotteryWheel
                      prizes={currentActivity.prizes || []}
                      isSpinning={drawing}
                      targetPrize={result?.prize || null}
                      onComplete={() => {
                        handleAnimationComplete();
                      }}
                    />
                    {!drawing && !result && (
                      <button
                        onClick={handleStartDraw}
                        className="w-full mt-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                      >
                        ⚡ 立即抽奖
                      </button>
                    )}
                  </div>
                ) : (
                  // 老虎机模式（默认）
                  <SlotMachine
                    prizes={currentActivity.prizes || []}
                    result={result?.prize || null}
                    isSpinning={drawing}
                    onComplete={handleAnimationComplete}
                    onStartDraw={handleStartDraw}
                    showStartButton={!drawing && !result}
                  />
                )}
              </div>
            ) : (
              <div className="card bg-gradient-to-br from-gray-50 to-gray-100 text-center py-16">
                <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">请先选择一个抽奖活动</p>
                <p className="text-sm text-gray-500">点击上方活动卡片即可开始</p>
              </div>
            )}
          </>
        )}

        {/* 抽奖记录 */}
        {activeTab === 'records' && (
          <div className="space-y-3">
            {records.map((record) => (
              <div key={record._id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{record.prizeName}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {record.activityName} · {prizeTypeLabels[record.prizeType]}
                      {record.prizeValue > 0 && ` · ${record.prizeValue}`}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(record.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      record.status === 'claimed' ? 'bg-green-100 text-green-800' :
                      record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {statusLabels[record.status]}
                    </span>
                    {record.status === 'pending' && record.prizeType !== 'thanks' && record.prizeType !== 'none' && (
                      <button
                        onClick={() => handleClaim(record._id)}
                        className="btn-primary text-sm"
                      >
                        领取
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {records.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                还没有抽奖记录
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};
