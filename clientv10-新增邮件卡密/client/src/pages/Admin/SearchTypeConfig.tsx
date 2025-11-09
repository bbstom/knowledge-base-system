import React, { useState } from 'react';
import { Tag, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface SearchTypeConfigProps {
  searchTypes: any[];
  onUpdateSearchTypes: (types: any[]) => void;
}

export const SearchTypeConfig: React.FC<SearchTypeConfigProps> = ({
  searchTypes,
  onUpdateSearchTypes
}) => {
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleSave = () => {
    if (!editingItem) return;
    if (isAdding) {
      onUpdateSearchTypes([...searchTypes, { ...editingItem, id: editingItem.id || `type_${Date.now()}` }]);
    } else {
      onUpdateSearchTypes(searchTypes.map(type => type.id === editingItem.id ? editingItem : type));
    }
    toast.success(isAdding ? '添加成功' : '保存成功');
    setEditingItem(null);
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('确定要删除吗？')) return;
    onUpdateSearchTypes(searchTypes.filter(type => type.id !== id));
    toast.success('删除成功');
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingItem({
      id: '',
      label: '',
      enabled: true,
      order: searchTypes.length + 1
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">搜索类型管理</h2>
          <p className="text-gray-600 text-sm mt-1">自定义系统支持的搜索类型</p>
        </div>
        {!editingItem && (
          <button onClick={handleAdd} className="btn-primary flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            添加搜索类型
          </button>
        )}
      </div>

      {editingItem && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{isAdding ? '添加' : '编辑'}搜索类型</h3>
            <button onClick={() => { setEditingItem(null); setIsAdding(false); }} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">类型ID（英文）</label>
              <input
                type="text"
                value={editingItem?.id || ''}
                onChange={(e) => setEditingItem({ ...editingItem, id: e.target.value })}
                className="input-field"
                placeholder="例如: phone"
                disabled={!isAdding}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">显示名称</label>
              <input
                type="text"
                value={editingItem?.label || ''}
                onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                className="input-field"
                placeholder="例如: 手机号"
              />
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
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editingItem?.enabled || false}
                  onChange={(e) => setEditingItem({ ...editingItem, enabled: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">启用</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={handleSave} className="btn-primary flex items-center">
              <Save className="h-5 w-5 mr-2" />
              保存
            </button>
            <button onClick={() => { setEditingItem(null); setIsAdding(false); }} className="btn-secondary">
              取消
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {searchTypes.map(type => (
          <div key={type.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-gray-400" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{type.label}</h3>
                    <p className="text-sm text-gray-500">ID: {type.id}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  type.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {type.enabled ? '启用' : '禁用'}
                </span>
                <span className="text-sm text-gray-500">排序: {type.order}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingItem(type)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                  <Edit className="h-5 w-5" />
                </button>
                <button onClick={() => handleDelete(type.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
