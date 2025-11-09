import React, { useState } from 'react';
import { Database, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface DatabaseConfigProps {
  userDatabase: any;
  queryDatabases: any[];
  onUpdateUserDatabase: (db: any) => void;
  onUpdateQueryDatabases: (dbs: any[]) => void;
}

export const DatabaseConfig: React.FC<DatabaseConfigProps> = ({
  userDatabase,
  queryDatabases,
  onUpdateUserDatabase,
  onUpdateQueryDatabases
}) => {
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [dbEditType, setDbEditType] = useState<'user' | 'query'>('user');

  const handleSaveUserDatabase = () => {
    toast.success('用户数据库配置已保存');
  };

  const handleSaveQueryDatabase = () => {
    if (!editingItem) return;
    if (isAdding) {
      onUpdateQueryDatabases([...queryDatabases, { ...editingItem, id: `query_db${Date.now()}` }]);
    } else {
      onUpdateQueryDatabases(queryDatabases.map(db => db.id === editingItem.id ? editingItem : db));
    }
    toast.success(isAdding ? '添加成功' : '保存成功');
    setEditingItem(null);
    setIsAdding(false);
  };

  const handleDeleteQueryDatabase = (id: string) => {
    if (!confirm('确定要删除这个查询数据库吗？')) return;
    onUpdateQueryDatabases(queryDatabases.filter(db => db.id !== id));
    toast.success('删除成功');
  };

  const handleAddQueryDatabase = () => {
    setIsAdding(true);
    setDbEditType('query');
    setEditingItem({
      name: '',
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: '',
      password: '',
      database: '',
      connectionPool: 10,
      timeout: 30000,
      enabled: true
    });
  };

  const renderDatabaseForm = (dbConfig: any, onChange: (config: any) => void) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">数据库名称</label>
        <input
          type="text"
          value={dbConfig.name || ''}
          onChange={(e) => onChange({ ...dbConfig, name: e.target.value })}
          className="input-field"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">数据库类型</label>
        <select
          value={dbConfig.type || 'mysql'}
          onChange={(e) => onChange({ ...dbConfig, type: e.target.value })}
          className="input-field"
        >
          <option value="mysql">MySQL</option>
          <option value="postgresql">PostgreSQL</option>
          <option value="mongodb">MongoDB</option>
          <option value="sqlserver">SQL Server</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">主机地址</label>
          <input
            type="text"
            value={dbConfig.host || ''}
            onChange={(e) => onChange({ ...dbConfig, host: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">端口</label>
          <input
            type="number"
            value={dbConfig.port || 3306}
            onChange={(e) => onChange({ ...dbConfig, port: parseInt(e.target.value) })}
            className="input-field"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
          <input
            type="text"
            value={dbConfig.username || ''}
            onChange={(e) => onChange({ ...dbConfig, username: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
          <input
            type="password"
            value={dbConfig.password || ''}
            onChange={(e) => onChange({ ...dbConfig, password: e.target.value })}
            className="input-field"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">数据库名</label>
        <input
          type="text"
          value={dbConfig.database || ''}
          onChange={(e) => onChange({ ...dbConfig, database: e.target.value })}
          className="input-field"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">连接池大小</label>
          <input
            type="number"
            value={dbConfig.connectionPool || 10}
            onChange={(e) => onChange({ ...dbConfig, connectionPool: parseInt(e.target.value) })}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">超时时间（毫秒）</label>
          <input
            type="number"
            value={dbConfig.timeout || 30000}
            onChange={(e) => onChange({ ...dbConfig, timeout: parseInt(e.target.value) })}
            className="input-field"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">数据库配置</h2>
        <p className="text-gray-600 text-sm mt-1">配置用户数据库和查询数据库连接信息</p>
      </div>

      {/* 用户数据库配置 */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2 text-blue-600" />
          用户数据库
        </h3>
        <p className="text-sm text-gray-600 mb-4">存储用户账户、积分、订单等信息</p>
        {renderDatabaseForm(userDatabase, onUpdateUserDatabase)}
        <div className="flex gap-3 pt-4">
          <button onClick={handleSaveUserDatabase} className="btn-primary flex items-center">
            <Save className="h-5 w-5 mr-2" />
            保存配置
          </button>
          <button className="btn-secondary">测试连接</button>
        </div>
      </div>

      {/* 查询数据库配置 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Database className="h-5 w-5 mr-2 text-purple-600" />
              查询数据库
            </h3>
            <p className="text-sm text-gray-600 mt-1">存储搜索数据，支持配置多个数据库</p>
          </div>
          {!editingItem && (
            <button onClick={handleAddQueryDatabase} className="btn-primary flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              添加查询数据库
            </button>
          )}
        </div>

        {editingItem && dbEditType === 'query' && (
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{isAdding ? '添加' : '编辑'}查询数据库</h3>
              <button onClick={() => { setEditingItem(null); setIsAdding(false); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderDatabaseForm(editingItem, setEditingItem)}
            <div>
              <label className="flex items-center mt-4">
                <input
                  type="checkbox"
                  checked={editingItem?.enabled || false}
                  onChange={(e) => setEditingItem({ ...editingItem, enabled: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">启用此数据库</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSaveQueryDatabase} className="btn-primary flex items-center">
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
          {queryDatabases.map(db => (
            <div key={db.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{db.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      db.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {db.enabled ? '启用' : '禁用'}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {db.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>主机: {db.host}:{db.port}</div>
                    <div>数据库: {db.database}</div>
                    <div>用户: {db.username}</div>
                    <div>连接池: {db.connectionPool}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { 
                      setEditingItem(db); 
                      setDbEditType('query'); 
                      setIsAdding(false); 
                    }} 
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDeleteQueryDatabase(db.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
