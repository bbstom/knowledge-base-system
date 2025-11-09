import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Save } from 'lucide-react';
import { systemConfigApi } from '../../utils/realApi';
import toast from 'react-hot-toast';

interface EarnMethod {
  id: string;
  title: string;
  description: string;
  reward: string;
  icon: string;
  color: string;
  order: number;
}

interface UsageMethod {
  id: string;
  title: string;
  description: string;
  order: number;
}

const ICON_OPTIONS = ['calendar', 'users', 'shopping-cart', 'gift', 'star', 'coins'];
const COLOR_OPTIONS = ['blue', 'green', 'purple', 'yellow', 'red', 'orange'];

export const PointsDescriptionConfig: React.FC = () => {
  const [earnMethods, setEarnMethods] = useState<EarnMethod[]>([]);
  const [usageMethods, setUsageMethods] = useState<UsageMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await systemConfigApi.getPointsDescriptions();
      if (response?.success) {
        setEarnMethods(response.data.earnMethods || []);
        setUsageMethods(response.data.usageMethods || []);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
      toast.error('加载配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // 验证
    if (earnMethods.length === 0) {
      toast.error('至少需要一个获取方式');
      return;
    }
    if (usageMethods.length === 0) {
      toast.error('至少需要一个积分用途');
      return;
    }

    setSaving(true);
    try {
      await systemConfigApi.updatePointsDescriptions({
        earnMethods,
        usageMethods
      });
      toast.success('配置已保存');
    } catch (error: any) {
      toast.error(error.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 获取方式管理
  const addEarnMethod = () => {
    const newMethod: EarnMethod = {
      id: `earn-${Date.now()}`,
      title: '',
      description: '',
      reward: '',
      icon: 'calendar',
      color: 'blue',
      order: earnMethods.length + 1
    };
    setEarnMethods([...earnMethods, newMethod]);
  };

  const updateEarnMethod = (index: number, field: keyof EarnMethod, value: string | number) => {
    const updated = [...earnMethods];
    updated[index] = { ...updated[index], [field]: value };
    setEarnMethods(updated);
  };

  const deleteEarnMethod = (index: number) => {
    setEarnMethods(earnMethods.filter((_, i) => i !== index));
  };

  const moveEarnMethod = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === earnMethods.length - 1) return;

    const updated = [...earnMethods];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    
    // 更新order
    updated.forEach((method, i) => {
      method.order = i + 1;
    });
    
    setEarnMethods(updated);
  };

  // 积分用途管理
  const addUsageMethod = () => {
    const newMethod: UsageMethod = {
      id: `usage-${Date.now()}`,
      title: '',
      description: '',
      order: usageMethods.length + 1
    };
    setUsageMethods([...usageMethods, newMethod]);
  };

  const updateUsageMethod = (index: number, field: keyof UsageMethod, value: string | number) => {
    const updated = [...usageMethods];
    updated[index] = { ...updated[index], [field]: value };
    setUsageMethods(updated);
  };

  const deleteUsageMethod = (index: number) => {
    setUsageMethods(usageMethods.filter((_, i) => i !== index));
  };

  const moveUsageMethod = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === usageMethods.length - 1) return;

    const updated = [...usageMethods];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    
    // 更新order
    updated.forEach((method, i) => {
      method.order = i + 1;
    });
    
    setUsageMethods(updated);
  };

  if (loading) {
    return <div className="p-6">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 获取方式配置 */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">获取积分方式</h3>
          <button
            onClick={addEarnMethod}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            添加方式
          </button>
        </div>

        <div className="space-y-4">
          {earnMethods.map((method, index) => (
            <div key={method.id} className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    标题 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={method.title}
                    onChange={(e) => updateEarnMethod(index, 'title', e.target.value)}
                    className="input"
                    placeholder="例如：每日签到"
                    maxLength={50}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    奖励 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={method.reward}
                    onChange={(e) => updateEarnMethod(index, 'reward', e.target.value)}
                    className="input"
                    placeholder="例如：+10"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={method.description}
                    onChange={(e) => updateEarnMethod(index, 'description', e.target.value)}
                    className="input"
                    placeholder="例如：每天签到获得积分"
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    图标
                  </label>
                  <select
                    value={method.icon}
                    onChange={(e) => updateEarnMethod(index, 'icon', e.target.value)}
                    className="input"
                  >
                    {ICON_OPTIONS.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    颜色
                  </label>
                  <select
                    value={method.color}
                    onChange={(e) => updateEarnMethod(index, 'color', e.target.value)}
                    className="input"
                  >
                    {COLOR_OPTIONS.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => moveEarnMethod(index, 'up')}
                  disabled={index === 0}
                  className="btn-secondary p-2"
                  title="上移"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => moveEarnMethod(index, 'down')}
                  disabled={index === earnMethods.length - 1}
                  className="btn-secondary p-2"
                  title="下移"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteEarnMethod(index)}
                  className="btn-danger p-2 ml-auto"
                  title="删除"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 积分用途配置 */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">积分用途</h3>
          <button
            onClick={addUsageMethod}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            添加用途
          </button>
        </div>

        <div className="space-y-4">
          {usageMethods.map((method, index) => (
            <div key={method.id} className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    标题 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={method.title}
                    onChange={(e) => updateUsageMethod(index, 'title', e.target.value)}
                    className="input"
                    placeholder="例如：搜索抵扣"
                    maxLength={50}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={method.description}
                    onChange={(e) => updateUsageMethod(index, 'description', e.target.value)}
                    className="input"
                    placeholder="例如：使用积分进行数据搜索"
                    maxLength={200}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => moveUsageMethod(index, 'up')}
                  disabled={index === 0}
                  className="btn-secondary p-2"
                  title="上移"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => moveUsageMethod(index, 'down')}
                  disabled={index === usageMethods.length - 1}
                  className="btn-secondary p-2"
                  title="下移"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteUsageMethod(index)}
                  className="btn-danger p-2 ml-auto"
                  title="删除"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 保存按钮 */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? '保存中...' : '保存配置'}
        </button>
      </div>
    </div>
  );
};
