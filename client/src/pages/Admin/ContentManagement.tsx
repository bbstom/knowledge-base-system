import React, { useState, useEffect } from 'react';
import { Database, HelpCircle, TrendingUp, Plus, Edit, Trash2, Save, X, Megaphone } from 'lucide-react';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { databaseApi, faqApi, topicApi, advertisementApi } from '../../utils/adminApi';
import toast from 'react-hot-toast';

type ContentType = 'databases' | 'faq' | 'topics' | 'ads';

// 安全地处理换行符，防止XSS攻击
const formatTextWithLineBreaks = (text: string) => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\n/g, '<br>');
};

export const ContentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ContentType>('databases');
  const [databases, setDatabases] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [availableSearchTypes, setAvailableSearchTypes] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContent();
  }, [activeTab]); // 当标签切换时重新加载

  const loadContent = async () => {
    // 加载可用的搜索类型 - 从系统配置中获取
    try {
      const token = document.cookie.split('token=')[1]?.split(';')[0];
      const response = await fetch('/api/system-config', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      const data = await response.json();
      if (data.success && data.data.searchTypes) {
        // 只显示启用的搜索类型
        const enabledTypes = data.data.searchTypes.filter((t: any) => t.enabled);
        setAvailableSearchTypes(enabledTypes);
      } else {
        // 如果加载失败，使用默认值
        setAvailableSearchTypes([
          { id: 'idcard', label: '身份证' },
          { id: 'phone', label: '手机号' },
          { id: 'name', label: '姓名' },
          { id: 'qq', label: 'QQ号' },
          { id: 'weibo', label: '微博号' },
          { id: 'wechat', label: '微信号' },
          { id: 'email', label: '邮箱' },
          { id: 'address', label: '地址' },
          { id: 'company', label: '公司' }
        ]);
      }
    } catch (error) {
      console.error('加载搜索类型失败:', error);
      // 使用默认值
      setAvailableSearchTypes([
        { id: 'idcard', label: '身份证' },
        { id: 'phone', label: '手机号' },
        { id: 'name', label: '姓名' },
        { id: 'qq', label: 'QQ号' },
        { id: 'weibo', label: '微博号' },
        { id: 'wechat', label: '微信号' },
        { id: 'email', label: '邮箱' },
        { id: 'address', label: '地址' },
        { id: 'company', label: '公司' }
      ]);
    }

    // 加载数据库列表
    if (activeTab === 'databases') {
      setLoading(true);
      try {
        const response = await databaseApi.getAll({ page: 1, limit: 100 });
        if (response.success) {
          setDatabases(response.data.databases || []);
        } else {
          toast.error('加载数据库列表失败');
        }
      } catch (error) {
        console.error('加载数据库列表失败:', error);
        toast.error('加载数据库列表失败，请重试');
      } finally {
        setLoading(false);
      }
    }

    // 加载FAQ列表
    if (activeTab === 'faq') {
      setLoading(true);
      try {
        const response = await faqApi.getAll({ page: 1, limit: 100 });
        if (response.success) {
          setFaqs(response.data.faqs || []);
        } else {
          toast.error('加载FAQ失败');
        }
      } catch (error) {
        console.error('加载FAQ失败:', error);
        toast.error('加载FAQ失败，请重试');
      } finally {
        setLoading(false);
      }
    }

    // 加载话题列表
    if (activeTab === 'topics') {
      setLoading(true);
      try {
        const response = await topicApi.getAll({ page: 1, limit: 100 });
        if (response.success) {
          setTopics(response.data.topics || []);
        } else {
          toast.error('加载话题失败');
        }
      } catch (error) {
        console.error('加载话题失败:', error);
        toast.error('加载话题失败，请重试');
      } finally {
        setLoading(false);
      }
    }

    // 加载广告列表
    if (activeTab === 'ads') {
      setLoading(true);
      try {
        const response = await advertisementApi.getAll({ page: 1, limit: 100 });
        if (response.success) {
          setAds(response.data.advertisements || []);
        } else {
          toast.error('加载广告失败');
        }
      } catch (error) {
        console.error('加载广告失败:', error);
        toast.error('加载广告失败，请重试');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!editingItem) return;

    setSaving(true);
    try {
      if (activeTab === 'databases') {
        // 打印调试信息
        console.log('保存数据清单:', editingItem);
        console.log('supportedTypes:', editingItem.supportedTypes);
        
        if (isAdding) {
          const response = await databaseApi.create(editingItem);
          console.log('创建响应:', response);
          if (response.success) {
            toast.success('数据库已创建');
            await loadContent();
          } else {
            toast.error(response.message || '创建失败');
          }
        } else {
          const response = await databaseApi.update(editingItem._id, editingItem);
          console.log('更新响应:', response);
          if (response.success) {
            toast.success('数据库已更新');
            await loadContent();
          } else {
            toast.error(response.message || '更新失败');
          }
        }
      } else if (activeTab === 'faq') {
        if (isAdding) {
          const response = await faqApi.create(editingItem);
          if (response.success) {
            toast.success('FAQ已创建');
            await loadContent();
          } else {
            toast.error(response.message || '创建失败');
          }
        } else {
          const response = await faqApi.update(editingItem._id || editingItem.id, editingItem);
          if (response.success) {
            toast.success('FAQ已更新');
            await loadContent();
          } else {
            toast.error(response.message || '更新失败');
          }
        }
      } else if (activeTab === 'topics') {
        console.log('保存话题数据:', editingItem);
        console.log('customUpdatedAt:', editingItem.customUpdatedAt);
        
        if (isAdding) {
          const response = await topicApi.create(editingItem);
          console.log('创建话题响应:', response);
          if (response.success) {
            toast.success('话题已创建');
            await loadContent();
          } else {
            toast.error(response.message || '创建失败');
          }
        } else {
          const response = await topicApi.update(editingItem._id || editingItem.id, editingItem);
          console.log('更新话题响应:', response);
          if (response.success) {
            toast.success('话题已更新');
            await loadContent();
          } else {
            toast.error(response.message || '更新失败');
          }
        }
      } else if (activeTab === 'ads') {
        // 保存前清理轮播数据（过滤空行）
        const adData = { ...editingItem };
        if (adData.type === 'carousel') {
          adData.carouselImages = (adData.carouselImages || []).filter((url: string) => url.trim());
          adData.carouselLinks = (adData.carouselLinks || []).filter((url: string) => url.trim());
          // 确保content字段存在
          if (!adData.content) {
            adData.content = '';
          }
        }
        
        console.log('保存广告数据:', adData);
        
        if (isAdding) {
          const response = await advertisementApi.create(adData);
          console.log('创建广告响应:', response);
          if (response.success) {
            toast.success('广告已创建');
            await loadContent();
          } else {
            toast.error(response.message || '创建失败');
          }
        } else {
          const response = await advertisementApi.update(adData._id || adData.id, adData);
          if (response.success) {
            toast.success('广告已更新');
            await loadContent();
          } else {
            toast.error(response.message || '更新失败');
          }
        }
      }

      if (activeTab !== 'databases' && activeTab !== 'ads') {
        toast.success(isAdding ? '添加成功' : '保存成功');
      }
      setEditingItem(null);
      setIsAdding(false);
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除吗？')) return;

    try {
      if (activeTab === 'databases') {
        const response = await databaseApi.delete(id);
        if (response.success) {
          toast.success('数据库已删除');
          await loadContent();
        } else {
          toast.error(response.message || '删除失败');
        }
      } else if (activeTab === 'faq') {
        const response = await faqApi.delete(id);
        if (response.success) {
          toast.success('FAQ已删除');
          await loadContent();
        } else {
          toast.error(response.message || '删除失败');
        }
      } else if (activeTab === 'topics') {
        const response = await topicApi.delete(id);
        if (response.success) {
          toast.success('话题已删除');
          await loadContent();
        } else {
          toast.error(response.message || '删除失败');
        }
      } else if (activeTab === 'ads') {
        const response = await advertisementApi.delete(id);
        if (response.success) {
          toast.success('广告已删除');
          await loadContent();
        } else {
          toast.error(response.message || '删除失败');
        }
      }

        if (activeTab !== 'databases' && activeTab !== 'ads') {
          toast.success('删除成功');
        }
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败，请重试');
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    if (activeTab === 'databases') {
      setEditingItem({
        name: '',
        description: '',
        source: '官方数据',
        isActive: true,
        status: 'normal',
        recordCount: 0,
        lastUpdated: '',  // 留空，让用户选择
        leakDate: null,
        supportedTypes: []
      });
    } else if (activeTab === 'faq') {
      setEditingItem({
        question: '',
        answer: '',
        category: 'account',
        order: faqs.length + 1
      });
    } else if (activeTab === 'topics') {
      setEditingItem({
        title: '',
        content: '',
        category: 'announcement',
        isHot: false,
        tags: []
      });
    } else if (activeTab === 'ads') {
      setEditingItem({
        title: '',
        content: '',
        position: 'search',
        isActive: true,
        order: ads.length + 1
      });
    }
  };

  const renderDatabaseForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">数据清单名称</label>
        <input
          type="text"
          value={editingItem?.name || ''}
          onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
          className="input-field"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
        <textarea
          value={editingItem?.description || ''}
          onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
          className="input-field"
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">数据来源</label>
          <input
            type="text"
            value={editingItem?.source || ''}
            onChange={(e) => setEditingItem({ ...editingItem, source: e.target.value })}
            className="input-field"
            placeholder="例如：官方数据、第三方数据"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">记录数量</label>
          <input
            type="number"
            value={editingItem?.recordCount || 0}
            onChange={(e) => setEditingItem({ ...editingItem, recordCount: parseInt(e.target.value) })}
            className="input-field"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">更新时间</label>
          <input
            type="date"
            value={editingItem?.lastUpdated ? new Date(editingItem.lastUpdated).toISOString().split('T')[0] : ''}
            onChange={(e) => setEditingItem({ ...editingItem, lastUpdated: e.target.value })}
            className="input-field"
            placeholder="选择更新时间"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">泄露时间（可选）</label>
          <input
            type="date"
            value={editingItem?.leakDate ? new Date(editingItem.leakDate).toISOString().split('T')[0] : ''}
            onChange={(e) => setEditingItem({ ...editingItem, leakDate: e.target.value || null })}
            className="input-field"
            placeholder="选择泄露时间"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">支持的搜索类型</label>
        <p className="text-sm text-gray-500 mb-2">在"系统设置 → 搜索类型"中可以自定义搜索类型</p>
        <div className="flex flex-wrap gap-2">
          {availableSearchTypes.map(type => (
            <label key={type.id} className="flex items-center px-3 py-2 border rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={editingItem?.supportedTypes?.includes(type.id)}
                onChange={(e) => {
                  const types = editingItem?.supportedTypes || [];
                  setEditingItem({
                    ...editingItem,
                    supportedTypes: e.target.checked
                      ? [...types, type.id]
                      : types.filter((t: string) => t !== type.id)
                  });
                }}
                className="mr-2"
              />
              <span className="text-sm">{type.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
          <select
            value={editingItem?.status || 'normal'}
            onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
            className="input-field"
          >
            <option value="normal">正常</option>
            <option value="maintenance">维护中</option>
            <option value="offline">已下线</option>
          </select>
        </div>
        <div>
          <label className="flex items-center pt-8">
            <input
              type="checkbox"
              checked={editingItem?.isActive || false}
              onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">启用</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderFAQForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">问题</label>
        <input
          type="text"
          value={editingItem?.question || ''}
          onChange={(e) => setEditingItem({ ...editingItem, question: e.target.value })}
          className="input-field"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">答案</label>
        <textarea
          value={editingItem?.answer || ''}
          onChange={(e) => setEditingItem({ ...editingItem, answer: e.target.value })}
          className="input-field"
          rows={4}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
          <select
            value={editingItem?.category || 'account'}
            onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
            className="input-field"
          >
            <option value="account">账户相关</option>
            <option value="search">搜索功能</option>
            <option value="payment">充值提现</option>
            <option value="referral">推荐奖励</option>
            <option value="vip">VIP会员</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">排序</label>
          <input
            type="number"
            value={editingItem?.order || 1}
            onChange={(e) => setEditingItem({ ...editingItem, order: parseInt(e.target.value) })}
            className="input-field"
          />
        </div>
      </div>
    </div>
  );

  const renderTopicForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
        <input
          type="text"
          value={editingItem?.title || ''}
          onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
          className="input-field"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">内容</label>
        <textarea
          value={editingItem?.content || ''}
          onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
          className="input-field"
          rows={6}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
          <select
            value={editingItem?.category || 'announcement'}
            onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
            className="input-field"
          >
            <option value="security">信息安全</option>
            <option value="legal">法律法规</option>
            <option value="tips">使用技巧</option>
            <option value="vip">VIP相关</option>
            <option value="announcement">平台公告</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">标签（逗号分隔）</label>
          <input
            type="text"
            value={editingItem?.tags?.join(',') || ''}
            onChange={(e) => setEditingItem({ ...editingItem, tags: e.target.value.split(',').map((t: string) => t.trim()) })}
            className="input-field"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">自定义更新时间</label>
        <input
          type="datetime-local"
          value={(() => {
            if (!editingItem?.customUpdatedAt) return '';
            try {
              const date = new Date(editingItem.customUpdatedAt);
              // 转换为本地时间的 datetime-local 格式
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              const hours = String(date.getHours()).padStart(2, '0');
              const minutes = String(date.getMinutes()).padStart(2, '0');
              return `${year}-${month}-${day}T${hours}:${minutes}`;
            } catch (e) {
              return '';
            }
          })()}
          onChange={(e) => {
            const newValue = e.target.value ? new Date(e.target.value).toISOString() : null;
            setEditingItem({ ...editingItem, customUpdatedAt: newValue });
          }}
          className="input-field"
        />
        <p className="text-xs text-gray-500 mt-1">留空则使用系统自动更新时间</p>
      </div>
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={editingItem?.isHot || false}
            onChange={(e) => setEditingItem({ ...editingItem, isHot: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm font-medium text-gray-700">设为热门</span>
        </label>
      </div>
    </div>
  );

  const renderAdForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
        <input
          type="text"
          value={editingItem?.title || ''}
          onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
          className="input-field"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">广告类型</label>
        <select
          value={editingItem?.type || 'html'}
          onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value })}
          className="input-field"
        >
          <option value="html">普通HTML广告</option>
          <option value="carousel">图片轮播广告</option>
        </select>
      </div>

      {editingItem?.type === 'carousel' ? (
        // 轮播广告配置
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              轮播图片URL（每行一个）
            </label>
            <textarea
              value={(editingItem?.carouselImages || []).join('\n')}
              onChange={(e) => setEditingItem({ 
                ...editingItem, 
                carouselImages: e.target.value.split('\n')
              })}
              className="input-field font-mono text-sm"
              rows={5}
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">每行输入一个图片URL，按Enter换行</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              对应链接URL（每行一个，可选）
            </label>
            <textarea
              value={(editingItem?.carouselLinks || []).join('\n')}
              onChange={(e) => setEditingItem({ 
                ...editingItem, 
                carouselLinks: e.target.value.split('\n')
              })}
              className="input-field font-mono text-sm"
              rows={5}
              placeholder="https://example.com/page1&#10;https://example.com/page2&#10;https://example.com/page3"
            />
            <p className="text-xs text-gray-500 mt-1">点击图片时跳转的链接，留空则不可点击，按Enter换行</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">切换间隔（毫秒）</label>
              <input
                type="number"
                value={editingItem?.carouselInterval || 5000}
                onChange={(e) => setEditingItem({ ...editingItem, carouselInterval: parseInt(e.target.value) })}
                className="input-field"
                min="1000"
                step="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">高度</label>
              <input
                type="text"
                value={editingItem?.carouselHeight || '400px'}
                onChange={(e) => setEditingItem({ ...editingItem, carouselHeight: e.target.value })}
                className="input-field"
                placeholder="400px"
              />
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={editingItem?.showControls !== false}
                  onChange={(e) => setEditingItem({ ...editingItem, showControls: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm">显示箭头</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editingItem?.showIndicators !== false}
                  onChange={(e) => setEditingItem({ ...editingItem, showIndicators: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm">显示指示器</span>
              </label>
            </div>
          </div>
        </>
      ) : (
        // 普通HTML广告
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">内容（支持HTML）</label>
            <textarea
              value={editingItem?.content || ''}
              onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
              className="input-field font-mono text-sm"
              rows={8}
              placeholder="<div>HTML内容</div>"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">预览</label>
            <div 
              className="border rounded-lg p-4 bg-gray-50"
              dangerouslySetInnerHTML={{ __html: editingItem?.content || '' }}
            />
          </div>
        </>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">显示位置</label>
          <select
            value={editingItem?.position || 'search'}
            onChange={(e) => setEditingItem({ ...editingItem, position: e.target.value })}
            className="input-field"
          >
            <option value="search">搜索页面</option>
            <option value="home">首页</option>
            <option value="databases">数据库列表</option>
            <option value="sidebar">侧边栏</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">排序</label>
          <input
            type="number"
            value={editingItem?.order || 0}
            onChange={(e) => setEditingItem({ ...editingItem, order: parseInt(e.target.value) })}
            className="input-field"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">开始日期（可选）</label>
          <input
            type="date"
            value={editingItem?.startDate ? new Date(editingItem.startDate).toISOString().split('T')[0] : ''}
            onChange={(e) => setEditingItem({ ...editingItem, startDate: e.target.value || null })}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">结束日期（可选）</label>
          <input
            type="date"
            value={editingItem?.endDate ? new Date(editingItem.endDate).toISOString().split('T')[0] : ''}
            onChange={(e) => setEditingItem({ ...editingItem, endDate: e.target.value || null })}
            className="input-field"
          />
        </div>
      </div>
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={editingItem?.isActive || false}
            onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm font-medium text-gray-700">启用</span>
        </label>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">内容管理</h1>
          <p className="text-gray-600">管理数据库、常见问题和热门话题</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('databases')}
            className={`flex items-center px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'databases'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Database className="h-5 w-5 mr-2" />
            数据清单
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex items-center px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'faq'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <HelpCircle className="h-5 w-5 mr-2" />
            常见问题
          </button>
          <button
            onClick={() => setActiveTab('topics')}
            className={`flex items-center px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'topics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            热门话题
          </button>
          <button
            onClick={() => setActiveTab('ads')}
            className={`flex items-center px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'ads'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Megaphone className="h-5 w-5 mr-2" />
            广告管理
          </button>
        </div>

        {/* Add Button */}
        {!editingItem && (
          <div className="mb-6">
            <button onClick={handleAdd} className="btn-primary flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              添加{activeTab === 'databases' ? '数据清单' : activeTab === 'faq' ? '问题' : activeTab === 'topics' ? '话题' : '广告'}
            </button>
          </div>
        )}

        {/* Edit Form */}
        {editingItem && (
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {isAdding ? '添加' : '编辑'}{activeTab === 'databases' ? '数据清单' : activeTab === 'faq' ? '问题' : activeTab === 'topics' ? '话题' : '广告'}
              </h3>
              <button onClick={() => { setEditingItem(null); setIsAdding(false); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            {activeTab === 'databases' && renderDatabaseForm()}
            {activeTab === 'faq' && renderFAQForm()}
            {activeTab === 'topics' && renderTopicForm()}
            {activeTab === 'ads' && renderAdForm()}
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center">
                <Save className="h-5 w-5 mr-2" />
                {saving ? '保存中...' : '保存'}
              </button>
              <button onClick={() => { setEditingItem(null); setIsAdding(false); }} className="btn-secondary">
                取消
              </button>
            </div>
          </div>
        )}

        {/* Content List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
        <div className="space-y-4">
          {activeTab === 'databases' && databases.map(db => {
            const statusLabels: Record<string, string> = {
              normal: '正常',
              maintenance: '维护中',
              offline: '已下线'
            };
            const statusColors: Record<string, string> = {
              normal: 'bg-green-100 text-green-800',
              maintenance: 'bg-yellow-100 text-yellow-800',
              offline: 'bg-gray-100 text-gray-800'
            };
            return (
            <div key={db._id || db.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{db.name}</h3>
                  <div 
                    className="text-gray-600 text-sm mt-1" 
                    dangerouslySetInnerHTML={{ __html: formatTextWithLineBreaks(db.description || '') }}
                  />
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>来源: {db.source || '官方数据'}</span>
                    <span>记录: {db.recordCount.toLocaleString()}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[db.status || 'normal']}`}>
                      {statusLabels[db.status || 'normal']}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${db.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {db.isActive ? '启用' : '禁用'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingItem(db)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                    <Edit className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDelete(db._id || db.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          );
          })}

          {activeTab === 'faq' && faqs.map(faq => (
            <div key={faq._id || faq.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                  <div 
                    className="text-gray-600 text-sm mt-1" 
                    dangerouslySetInnerHTML={{ __html: formatTextWithLineBreaks(faq.answer || '') }}
                  />
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>分类: {faq.category}</span>
                    <span>排序: {faq.order}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingItem(faq)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                    <Edit className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDelete(faq._id || faq.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {activeTab === 'topics' && topics.map(topic => (
            <div key={topic._id || topic.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{topic.title}</h3>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{topic.content}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>分类: {topic.category}</span>
                    <span>浏览: {topic.views}</span>
                    <span>更新: {new Date(topic.customUpdatedAt || topic.updatedAt).toLocaleString('zh-CN')}</span>
                    {topic.isHot && <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">热门</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingItem(topic)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                    <Edit className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDelete(topic._id || topic.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {activeTab === 'ads' && ads.map(ad => {
            const adId = ad._id || ad.id;
            const positionLabels: Record<string, string> = {
              search: '搜索页面',
              home: '首页',
              databases: '数据库列表',
              sidebar: '侧边栏'
            };
            return (
            <div key={adId} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{ad.title}</h3>
                    {ad.type === 'carousel' && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        轮播广告
                      </span>
                    )}
                  </div>
                  
                  {ad.type === 'carousel' ? (
                    // 轮播广告预览
                    <div className="text-gray-600 text-sm mt-2">
                      <p className="mb-1">📸 图片数量: {ad.carouselImages?.length || 0}</p>
                      <p className="mb-1">⏱️ 切换间隔: {ad.carouselInterval || 5000}ms</p>
                      <p className="mb-1">📏 高度: {ad.carouselHeight || '400px'}</p>
                      {ad.carouselImages && ad.carouselImages.length > 0 && (
                        <div className="mt-2 flex gap-2 overflow-x-auto">
                          {ad.carouselImages.slice(0, 3).map((img: string, idx: number) => (
                            <img 
                              key={idx} 
                              src={img} 
                              alt={`预览 ${idx + 1}`}
                              className="h-20 w-auto object-cover rounded border"
                            />
                          ))}
                          {ad.carouselImages.length > 3 && (
                            <div className="h-20 w-20 flex items-center justify-center bg-gray-100 rounded border text-gray-500 text-sm">
                              +{ad.carouselImages.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    // 普通HTML广告预览
                    <div 
                      className="text-gray-600 text-sm mt-2 bg-gray-50 rounded overflow-hidden ad-content"
                      dangerouslySetInnerHTML={{ __html: ad.content }}
                    />
                  )}
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>位置: {positionLabels[ad.position] || ad.position}</span>
                    <span>排序: {ad.order}</span>
                    {ad.startDate && <span>开始: {new Date(ad.startDate).toLocaleDateString()}</span>}
                    {ad.endDate && <span>结束: {new Date(ad.endDate).toLocaleDateString()}</span>}
                    <span className={`px-2 py-1 rounded-full text-xs ${ad.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {ad.isActive ? '启用' : '禁用'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingItem(ad)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                    <Edit className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDelete(adId)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          );
          })}
        </div>
        )}
      </div>
    </AdminLayout>
  );
};
