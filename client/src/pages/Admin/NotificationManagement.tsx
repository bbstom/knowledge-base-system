import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { 
  Bell, Plus, Edit2, Trash2, Eye, 
  Image as ImageIcon, FileText, Code, Calendar,
  Users, CheckCircle
} from 'lucide-react';
import { notificationApi } from '../../utils/adminApi';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'image' | 'html';
  imageUrl?: string;
  status: 'draft' | 'active' | 'expired';
  startDate: string;
  endDate: string;
  targetUsers: 'all' | 'vip' | 'new' | 'active';
  priority: 'low' | 'medium' | 'high';
  viewCount: number;
  createdAt: string;
}

export const NotificationManagement: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'text' as 'text' | 'image' | 'html',
    imageUrl: '',
    status: 'draft' as 'draft' | 'active' | 'expired',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    targetUsers: 'all' as 'all' | 'vip' | 'new' | 'active',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationApi.getAll({
        page: 1,
        limit: 100 // 加载所有通知
      });
      
      if (response.success) {
        const notifications = response.data.notifications || [];
        setNotifications(notifications);
      } else {
        toast.error('加载通知失败');
      }
    } catch (error) {
      console.error('加载通知失败:', error);
      toast.error('加载通知失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast.error('请填写标题和内容');
      return;
    }

    setSaving(true);
    try {
      if (editingNotification) {
        // 更新
        const response = await notificationApi.update(editingNotification.id, formData);
        if (response.success) {
          toast.success('通知已更新');
          await loadNotifications();
        } else {
          toast.error(response.message || '更新失败');
        }
      } else {
        // 新增
        const response = await notificationApi.create(formData);
        if (response.success) {
          toast.success('通知已创建');
          await loadNotifications();
        } else {
          toast.error(response.message || '创建失败');
        }
      }
      resetForm();
    } catch (error) {
      console.error('保存通知失败:', error);
      toast.error('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'text',
      imageUrl: '',
      status: 'draft',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      targetUsers: 'all',
      priority: 'medium'
    });
    setEditingNotification(null);
    setShowModal(false);
    setPreviewMode(false);
  };

  const handleEdit = (notification: Notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      content: notification.content,
      type: notification.type,
      imageUrl: notification.imageUrl || '',
      status: notification.status,
      startDate: notification.startDate,
      endDate: notification.endDate,
      targetUsers: notification.targetUsers,
      priority: notification.priority
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这条通知吗？')) {
      try {
        const response = await notificationApi.delete(id);
        if (response.success) {
          toast.success('通知已删除');
          await loadNotifications();
        } else {
          toast.error(response.message || '删除失败');
        }
      } catch (error) {
        console.error('删除通知失败:', error);
        toast.error('删除失败，请重试');
      }
    }
  };

  const handlePreview = (notification: Notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      content: notification.content,
      type: notification.type,
      imageUrl: notification.imageUrl || '',
      status: notification.status,
      startDate: notification.startDate,
      endDate: notification.endDate,
      targetUsers: notification.targetUsers,
      priority: notification.priority
    });
    setPreviewMode(true);
    setShowModal(true);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800'
    };
    const labels = {
      draft: '草稿',
      active: '生效中',
      expired: '已过期'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    const labels = {
      low: '低',
      medium: '中',
      high: '高'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[priority as keyof typeof badges]}`}>
        {labels[priority as keyof typeof labels]}
      </span>
    );
  };

  const getTargetLabel = (target: string) => {
    const labels = {
      all: '所有用户',
      vip: 'VIP用户',
      new: '新用户',
      active: '活跃用户'
    };
    return labels[target as keyof typeof labels];
  };

  const renderPreview = () => {
    if (formData.type === 'text') {
      return (
        <div className="p-6 bg-white rounded-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{formData.title}</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{formData.content}</p>
        </div>
      );
    } else if (formData.type === 'image') {
      return (
        <div className="p-6 bg-white rounded-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{formData.title}</h3>
          {formData.imageUrl && (
            <img 
              src={formData.imageUrl} 
              alt={formData.title}
              className="w-full rounded-lg mb-4"
            />
          )}
          <p className="text-gray-700 whitespace-pre-wrap">{formData.content}</p>
        </div>
      );
    } else {
      return (
        <div className="p-6 bg-white rounded-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{formData.title}</h3>
          <div dangerouslySetInnerHTML={{ __html: formData.content }} />
        </div>
      );
    }
  };

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">通知管理</h1>
            <p className="text-gray-600 mt-1">管理用户登录后的弹窗通知</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            创建通知
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总通知数</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">生效中</p>
                <p className="text-2xl font-bold text-green-600">
                  {notifications.filter(n => n.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">草稿</p>
                <p className="text-2xl font-bold text-gray-600">
                  {notifications.filter(n => n.status === 'draft').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-gray-500" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总浏览量</p>
                <p className="text-2xl font-bold text-purple-600">
                  {notifications.reduce((sum, n) => sum + n.viewCount, 0).toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="card">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">标题</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">目标用户</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">优先级</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">有效期</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">浏览量</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <tr key={notification.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        {notification.type === 'text' && <FileText className="h-4 w-4 mr-1" />}
                        {notification.type === 'image' && <ImageIcon className="h-4 w-4 mr-1" />}
                        {notification.type === 'html' && <Code className="h-4 w-4 mr-1" />}
                        {notification.type}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {getTargetLabel(notification.targetUsers)}
                    </td>
                    <td className="px-6 py-4">
                      {getPriorityBadge(notification.priority)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(notification.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {notification.startDate} ~ {notification.endDate || '永久'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {notification.viewCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePreview(notification)}
                          className="text-blue-600 hover:text-blue-800"
                          title="预览"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(notification)}
                          className="text-green-600 hover:text-green-800"
                          title="编辑"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="text-red-600 hover:text-red-800"
                          title="删除"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {previewMode ? '预览通知' : editingNotification ? '编辑通知' : '创建通知'}
                </h2>

                {previewMode ? (
                  <div className="space-y-6">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-4">用户登录后将看到以下内容：</p>
                      {renderPreview()}
                    </div>
                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={resetForm}
                        className="btn-secondary"
                      >
                        关闭
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          通知标题 *
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="input-field"
                          placeholder="请输入通知标题"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          通知类型 *
                        </label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                          className="input-field"
                        >
                          <option value="text">纯文本</option>
                          <option value="image">图片+文字</option>
                          <option value="html">HTML格式</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          目标用户 *
                        </label>
                        <select
                          value={formData.targetUsers}
                          onChange={(e) => setFormData({ ...formData, targetUsers: e.target.value as any })}
                          className="input-field"
                        >
                          <option value="all">所有用户</option>
                          <option value="vip">VIP用户</option>
                          <option value="new">新用户（注册7天内）</option>
                          <option value="active">活跃用户</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          优先级 *
                        </label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                          className="input-field"
                        >
                          <option value="low">低</option>
                          <option value="medium">中</option>
                          <option value="high">高</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          状态 *
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                          className="input-field"
                        >
                          <option value="draft">草稿</option>
                          <option value="active">生效中</option>
                          <option value="expired">已过期</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          开始日期 *
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="input-field"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          结束日期（留空表示永久）
                        </label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="input-field"
                        />
                      </div>

                      {formData.type === 'image' && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            图片URL
                          </label>
                          <input
                            type="url"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            className="input-field"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                      )}

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          通知内容 *
                        </label>
                        <textarea
                          value={formData.content}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          className="input-field"
                          rows={formData.type === 'html' ? 10 : 6}
                          placeholder={
                            formData.type === 'html' 
                              ? '请输入HTML代码...' 
                              : '请输入通知内容...'
                          }
                          required
                        />
                        {formData.type === 'html' && (
                          <p className="text-xs text-gray-500 mt-1">
                            支持HTML标签，可以使用Tailwind CSS类名
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">预览</h3>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        {renderPreview()}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="btn-secondary"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary"
                      >
                        {saving ? '保存中...' : (editingNotification ? '更新' : '创建')}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
