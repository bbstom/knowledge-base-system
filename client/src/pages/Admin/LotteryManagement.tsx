import React, { useState, useEffect } from 'react';
import { Gift, Plus, Edit, Trash2, BarChart3, Eye, Save, X } from 'lucide-react';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { lotteryApi } from '../../utils/adminApi';
import toast from 'react-hot-toast';

export const LotteryManagement: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'activities' | 'records' | 'statistics'>('activities');
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    if (activeTab === 'activities') {
      loadActivities();
    } else if (activeTab === 'records') {
      loadRecords();
    } else if (activeTab === 'statistics') {
      loadStatistics();
    }
  }, [activeTab]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const response = await lotteryApi.getActivities({ page: 1, limit: 100 });
      if (response.success) {
        setActivities(response.data.activities || []);
      }
    } catch (error) {
      console.error('加载活动失败:', error);
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const loadRecords = async () => {
    setLoading(true);
    try {
      const response = await lotteryApi.getRecords({ page: 1, limit: 100 });
      if (response.success) {
        setRecords(response.data.records || []);
      }
    } catch (error) {
      console.error('加载记录失败:', error);
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const response = await lotteryApi.getStatistics({ dateRange: 'week' });
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('加载统计失败:', error);
      toast.error('加载统计失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (isAdding) {
        const response = await lotteryApi.createActivity(editingActivity);
        if (response.success) {
          toast.success('创建成功');
          loadActivities();
          setEditingActivity(null);
          setIsAdding(false);
        } else {
          toast.error(response.message || '创建失败');
        }
      } else {
        const response = await lotteryApi.updateActivity(editingActivity._id, editingActivity);
        if (response.success) {
          toast.success('更新成功');
          loadActivities();
          setEditingActivity(null);
        } else {
          toast.error(response.message || '更新失败');
        }
      }
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个活动吗？')) return;
    
    try {
      const response = await lotteryApi.deleteActivity(id);
      if (response.success) {
        toast.success('删除成功');
        loadActivities();
      } else {
        toast.error(response.message || '删除失败');
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingActivity({
      name: '',
      description: '',
      costPoints: 100,
      dailyLimit: 5,
      startTime: new Date().toISOString().split('T')[0],
      endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
      prizes: [
        { name: '谢谢参与', type: 'thanks', value: 0, quantity: -1, probability: 70 }
      ]
    });
  };

  const addPrize = () => {
    setEditingActivity({
      ...editingActivity,
      prizes: [
        ...editingActivity.prizes,
        { name: '', type: 'points', value: 0, quantity: 10, probability: 10 }
      ]
    });
  };

  const removePrize = (index: number) => {
    const newPrizes = editingActivity.prizes.filter((_: any, i: number) => i !== index);
    setEditingActivity({ ...editingActivity, prizes: newPrizes });
  };

  const updatePrize = (index: number, field: string, value: any) => {
    const newPrizes = [...editingActivity.prizes];
    newPrizes[index] = { ...newPrizes[index], [field]: value };
    setEditingActivity({ ...editingActivity, prizes: newPrizes });
  };

  const viewStatistics = async (id: string) => {
    try {
      const response = await lotteryApi.getStatistics(id);
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      toast.error('获取统计失败');
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
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">抽奖管理</h1>
            <p className="text-gray-600">管理抽奖活动和查看抽奖记录</p>
          </div>
          <button
            onClick={() => window.location.href = '/admin/lottery/statistics'}
            className="btn-secondary flex items-center gap-2"
          >
            <BarChart3 className="h-5 w-5" />
            数据统计
          </button>
        </div>

        {/* 标签切换 */}
        <div className="flex space-x-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('activities')}
            className={`flex items-center px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'activities'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Gift className="h-5 w-5 mr-2" />
            抽奖活动
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`flex items-center px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'records'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye className="h-5 w-5 mr-2" />
            抽奖记录
          </button>
          <button
            onClick={() => {
              setActiveTab('statistics');
              loadStatistics();
            }}
            className={`flex items-center px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'statistics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="h-5 w-5 mr-2" />
            数据统计
          </button>
        </div>

        {/* 活动列表 */}
        {activeTab === 'activities' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">活动列表</h2>
              <button onClick={handleAdd} className="btn-primary flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                添加活动
              </button>
            </div>

            {editingActivity && (
              <div className="card mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {isAdding ? '添加' : '编辑'}活动
                  </h3>
                  <button onClick={() => { setEditingActivity(null); setIsAdding(false); }} className="text-gray-400 hover:text-gray-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">活动名称</label>
                      <input
                        type="text"
                        value={editingActivity.name}
                        onChange={(e) => setEditingActivity({ ...editingActivity, name: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">消耗积分</label>
                      <input
                        type="number"
                        value={editingActivity.costPoints}
                        onChange={(e) => setEditingActivity({ ...editingActivity, costPoints: parseInt(e.target.value) })}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">活动描述</label>
                    <textarea
                      value={editingActivity.description}
                      onChange={(e) => setEditingActivity({ ...editingActivity, description: e.target.value })}
                      className="input-field"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">每日限制次数</label>
                      <input
                        type="number"
                        value={editingActivity.dailyLimit}
                        onChange={(e) => setEditingActivity({ ...editingActivity, dailyLimit: parseInt(e.target.value) })}
                        className="input-field"
                        placeholder="0表示无限制"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">动画类型</label>
                      <select
                        value={editingActivity.animationType || 'slot'}
                        onChange={(e) => setEditingActivity({ ...editingActivity, animationType: e.target.value })}
                        className="input-field"
                      >
                        <option value="slot">🎰 老虎机</option>
                        <option value="wheel">🎡 转盘</option>
                        <option value="card">🃏 翻牌</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">开始时间</label>
                      <input
                        type="date"
                        value={editingActivity.startTime}
                        onChange={(e) => setEditingActivity({ ...editingActivity, startTime: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">结束时间</label>
                      <input
                        type="date"
                        value={editingActivity.endTime}
                        onChange={(e) => setEditingActivity({ ...editingActivity, endTime: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">奖品配置</label>
                      <button onClick={addPrize} className="text-sm text-blue-600 hover:text-blue-700">
                        + 添加奖品
                      </button>
                    </div>
                    <div className="space-y-2">
                      {editingActivity.prizes?.map((prize: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded">
                          <div className="grid grid-cols-6 gap-2 items-end">
                            <div className="col-span-2">
                              <label className="block text-xs text-gray-600 mb-1">奖品名称</label>
                              <input
                                type="text"
                                value={prize.name}
                                onChange={(e) => updatePrize(index, 'name', e.target.value)}
                                placeholder="例如：100积分"
                                className="input-field"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">奖品类型</label>
                              <select
                                value={prize.type}
                                onChange={(e) => updatePrize(index, 'type', e.target.value)}
                                className="input-field"
                              >
                                <option value="points">积分</option>
                                <option value="vip">VIP天数</option>
                                <option value="coupon">优惠券</option>
                                <option value="physical">实物</option>
                                <option value="thanks">谢谢参与</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                {prize.type === 'points' ? '积分数' : prize.type === 'vip' ? 'VIP天数' : '价值'}
                              </label>
                              <input
                                type="number"
                                value={prize.value}
                                onChange={(e) => updatePrize(index, 'value', parseInt(e.target.value))}
                                placeholder="0"
                                className="input-field"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">库存数量</label>
                              <input
                                type="number"
                                value={prize.quantity}
                                onChange={(e) => updatePrize(index, 'quantity', parseInt(e.target.value))}
                                placeholder="-1=无限"
                                className="input-field"
                                title="-1表示无限库存"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">中奖概率%</label>
                              <input
                                type="number"
                                step="0.1"
                                value={prize.probability}
                                onChange={(e) => updatePrize(index, 'probability', parseFloat(e.target.value))}
                                placeholder="10"
                                className="input-field"
                              />
                            </div>
                          </div>
                          <button onClick={() => removePrize(index)} className="text-red-600 hover:text-red-700 text-sm mt-2">
                            删除此奖品
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      当前概率总和: {editingActivity.prizes?.reduce((sum: number, p: any) => sum + (p.probability || 0), 0).toFixed(2)}%
                    </p>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingActivity.isActive}
                      onChange={(e) => setEditingActivity({ ...editingActivity, isActive: e.target.checked })}
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-700">启用活动</label>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={handleSave} className="btn-primary flex items-center">
                      <Save className="h-5 w-5 mr-2" />
                      保存
                    </button>
                    <button onClick={() => { setEditingActivity(null); setIsAdding(false); }} className="btn-secondary">
                      取消
                    </button>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity._id} className="card">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{activity.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{activity.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>消耗: {activity.costPoints}积分</span>
                          <span>每日限制: {activity.dailyLimit === 0 ? '无限制' : `${activity.dailyLimit}次`}</span>
                          <span>总抽奖: {activity.totalDraws}次</span>
                          <span>中奖: {activity.totalWinners}人</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${activity.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {activity.isActive ? '启用' : '禁用'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => viewStatistics(activity._id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                          <Eye className="h-5 w-5" />
                        </button>
                        <button onClick={() => setEditingActivity(activity)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                          <Edit className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(activity._id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 抽奖记录 */}
        {activeTab === 'records' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">抽奖记录</h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">活动</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">奖品</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {records.map((record) => (
                      <tr key={record._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{record.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{record.activityName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{record.prizeName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{prizeTypeLabels[record.prizeType]}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            record.status === 'claimed' ? 'bg-green-100 text-green-800' :
                            record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {statusLabels[record.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(record.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 统计弹窗 */}
        {statistics && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setStatistics(null)}>
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4">活动统计 - {statistics.activityName}</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-blue-50 rounded">
                  <div className="text-sm text-gray-600">总抽奖次数</div>
                  <div className="text-2xl font-bold text-blue-600">{statistics.totalDraws}</div>
                </div>
                <div className="p-4 bg-green-50 rounded">
                  <div className="text-sm text-gray-600">总中奖人数</div>
                  <div className="text-2xl font-bold text-green-600">{statistics.totalWinners}</div>
                </div>
                <div className="p-4 bg-purple-50 rounded">
                  <div className="text-sm text-gray-600">参与用户数</div>
                  <div className="text-2xl font-bold text-purple-600">{statistics.participantCount}</div>
                </div>
                <div className="p-4 bg-orange-50 rounded">
                  <div className="text-sm text-gray-600">中奖率</div>
                  <div className="text-2xl font-bold text-orange-600">{statistics.winRate}%</div>
                </div>
              </div>
              <h4 className="font-semibold mb-2">奖品统计</h4>
              <div className="space-y-2">
                {statistics.prizeStats?.map((stat: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span>{stat.prizeName} ({prizeTypeLabels[stat.prizeType]})</span>
                    <span className="text-sm text-gray-600">
                      中奖{stat.winCount}次 | 概率{stat.probability}%
                    </span>
                  </div>
                ))}
              </div>
              <button onClick={() => setStatistics(null)} className="btn-primary mt-4 w-full">
                关闭
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
