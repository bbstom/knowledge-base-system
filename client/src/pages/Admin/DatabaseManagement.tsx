import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { Database, Plus, Edit, Trash2, Save, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { getToken } from '../../utils/auth';

interface DatabaseItem {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  supportedTypes: string[];
  recordCount: number;
  isActive: boolean;
  status: 'normal' | 'maintenance' | 'offline';
  source: string;
  lastUpdated: string;
  rating?: number;
}

interface SearchType {
  id: string;
  label: string;
  enabled: boolean;
  order: number;
}

export const DatabaseManagement: React.FC = () => {
  const [databases, setDatabases] = useState<DatabaseItem[]>([]);
  const [searchTypes, setSearchTypes] = useState<SearchType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<DatabaseItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadDatabases(), loadSearchTypes()]);
    setLoading(false);
  };

  const loadDatabases = async () => {
    try {
      const token = getToken();
      const response = await fetch('/api/databases', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        setDatabases(data.data.databases || []);
      }
    } catch (error) {
      console.error('加载数据清单失败:', error);
      toast.error('加载数据清单失败');
    }
  };

  const loadSearchTypes = async () => {
    try {
      const token = getToken();
      const response = await fetch('/api/system-config', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success && data.data.searchTypes) {
        setSearchTypes(data.data.searchTypes.filter((t: SearchType) => t.enabled));
      }
    } catch (error) {
      console.error('加载搜索类型失败:', error);
    }
  };

  const handleSave = async () => {
    if (!editingItem) return;

    try {
      const token = getToken();
      const url = isAdding ? '/api/databases' : `/api/databases/${editingItem._id || editingItem.id}`;
      const method = isAdding ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(editingItem)
      });

      const data = await response.json();

      if (data.success) {
        toast.success(isAdding ? '添加成功' : '保存成功');
        setEditingItem(null);
        setIsAdding(false);
        await loadDatabases();
      } else {
        toast.error(data.message || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败，请重试');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个数据清单吗？')) return;

    try {
      const token = getToken();
      const response = await fetch(`/api/databases/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        toast.success('删除成功');
        await loadDatabases();
      } else {
        toast.error(data.message || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败，请重试');
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingItem({
      name: '',
      description: '',
      supportedTypes: [],
      recordCount: 0,
      isActive: true,
      status: 'normal',
      source: '官方数据',
      lastUpdated: new Date().toISOString(),
      rating: 4.8
    });
  };

  const toggleSearchType = (typeId: string) => {
    if (!editingItem) return;
    
    const types = editingItem.supportedTypes || [];
    const index = types.indexOf(typeId);
    
    if (index > -1) {
      setEditingItem({
        ...editingItem,
        supportedTypes: types.filter(t => t !== typeId)
      });
    } else {
      setEditingItem({
        ...editingItem,
        supportedTypes: [...types, typeId]
      });
    }
  };

  const filteredDatabases = databases.filter(db =>
    db.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    db.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">加载中...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">数据清单管理</h1>
            <p className="text-gray-600 mt-1">管理系统中的数据源</p>
          </div>
          {!editingItem && (
            <button onClick={handleAdd} className="btn-primary flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              添加数据清单
            </button>
          )}
        </div>

        {/* Search */}
        {!editingItem && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="搜索数据清单..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
        )}

        {/* Edit Form */}
        {editingItem && (
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">{isAdding ? '添加' : '编辑'}数据清单</h2>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsAdding(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  数据库名称 *
                </label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="input-field"
                  placeholder="例如: 全国身份证数据库"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  数据来源
                </label>
                <input
                  type="text"
                  value={editingItem.source}
                  onChange={(e) => setEditingItem({ ...editingItem, source: e.target.value })}
                  className="input-field"
                  placeholder="例如: 官方数据"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述
                </label>
                <textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="数据库的详细描述..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  记录数量
                </label>
                <input
                  type="number"
                  value={editingItem.recordCount}
                  onChange={(e) => setEditingItem({ ...editingItem, recordCount: parseInt(e.target.value) || 0 })}
                  className="input-field"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  评分
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={editingItem.rating || 4.8}
                  onChange={(e) => setEditingItem({ ...editingItem, rating: parseFloat(e.target.value) || 4.8 })}
                  className="input-field"
                  placeholder="4.8"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  状态
                </label>
                <select
                  value={editingItem.status}
                  onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as any })}
                  className="input-field"
                >
                  <option value="normal">正常</option>
                  <option value="maintenance">维护中</option>
                  <option value="offline">已下线</option>
                </select>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingItem.isActive}
                    onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">启用</span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  支持的搜索类型 *
                </label>
                <div className="flex flex-wrap gap-2">
                  {searchTypes.map(type => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => toggleSearchType(type.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        editingItem.supportedTypes?.includes(type.id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
                {searchTypes.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    请先在"系统设置 → 搜索类型"中添加搜索类型
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="btn-primary flex items-center">
                <Save className="h-5 w-5 mr-2" />
                保存
              </button>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsAdding(false);
                }}
                className="btn-secondary"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* List */}
        {!editingItem && (
          <div className="space-y-4">
            {filteredDatabases.map(db => (
              <div key={db._id || db.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Database className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{db.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          db.status === 'normal' ? 'bg-green-100 text-green-800' :
                          db.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {db.status === 'normal' ? '正常' : db.status === 'maintenance' ? '维护中' : '已下线'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          db.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {db.isActive ? '启用' : '禁用'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{db.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>记录数: {db.recordCount?.toLocaleString()}</span>
                        <span>来源: {db.source}</span>
                        <span>评分: {db.rating || 4.8}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {db.supportedTypes?.map(typeId => {
                          const type = searchTypes.find(t => t.id === typeId);
                          return (
                            <span key={typeId} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                              {type?.label || typeId}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingItem(db)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(db._id || db.id || '')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredDatabases.length === 0 && (
              <div className="text-center py-12">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {databases.length === 0 ? '暂无数据清单' : '未找到匹配的数据清单'}
                </h3>
                <p className="text-gray-600">
                  {databases.length === 0 ? '点击上方按钮添加第一个数据清单' : '请尝试使用不同的关键词搜索'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
