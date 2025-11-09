import React, { useState, useEffect } from 'react';
import { Database, Plus, Edit, Trash2, Save, X, Eye, EyeOff, CheckCircle, XCircle, Loader, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getToken } from '../../utils/auth';

interface DatabaseConfigProps {
  userDatabase: any;
  queryDatabases: any[];
  onUpdateUserDatabase: (db: any) => void;
  onUpdateQueryDatabases: (dbs: any[]) => void;
  onSave?: (databases: any) => Promise<boolean>;
}

export const DatabaseConfig: React.FC<DatabaseConfigProps> = ({
  userDatabase,
  queryDatabases,
  onUpdateUserDatabase,
  onUpdateQueryDatabases,
  onSave
}) => {
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [dbEditType, setDbEditType] = useState<'user' | 'query'>('user');
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);

  // 加载连接状态
  useEffect(() => {
    loadConnectionStatus();
  }, []);

  const loadConnectionStatus = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.error('未找到认证 token');
        return;
      }
      const response = await fetch('/api/system-config/databases/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setConnectionStatus(data.data);
      }
    } catch (error) {
      console.error('Failed to load connection status:', error);
    }
  };

  const handleTestConnection = async (config: any) => {
    // 检查密码是否是遮盖的
    if (config.password === '******' || config.password === '' || !config.password) {
      toast.error('请先输入数据库密码');
      setTestResult({ success: false, message: '密码不能为空或遮盖符号' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const token = getToken();
      if (!token) {
        toast.error('未找到认证 token，请重新登录');
        setTesting(false);
        return;
      }
      const response = await fetch('/api/system-config/databases/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });

      const result = await response.json();
      setTestResult(result);

      if (result.success) {
        toast.success('连接测试成功！');
      } else {
        toast.error(`连接测试失败: ${result.message}`);
      }
    } catch (error: any) {
      toast.error('测试失败: ' + error.message);
      setTestResult({ success: false, message: error.message });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!onSave) {
      toast.error('保存功能未配置');
      return;
    }

    // 检查用户数据库密码（如果是新配置或密码为空）
    if (!userDatabase.password || userDatabase.password === '') {
      toast.error('请先输入用户数据库密码');
      return;
    }

    // 检查查询数据库密码（如果是新配置或密码为空）
    for (const db of queryDatabases) {
      if (!db.password || db.password === '') {
        toast.error(`请先输入查询数据库"${db.name}"的密码`);
        return;
      }
    }

    setSaving(true);
    try {
      const success = await onSave({
        user: userDatabase,
        query: queryDatabases
      });

      if (success) {
        toast.success('数据库配置已保存并重新连接');
        await loadConnectionStatus();
      } else {
        toast.error('保存失败');
      }
    } catch (error: any) {
      toast.error('保存失败: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveQueryDatabase = () => {
    if (!editingItem) return;
    if (isAdding) {
      onUpdateQueryDatabases([...queryDatabases, { ...editingItem, id: `query_${Date.now()}` }]);
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
      type: 'mongodb',
      host: 'localhost',
      port: 27017,
      username: '',
      password: '',
      database: '',
      connectionPool: 10,
      timeout: 30000,
      enabled: true,
      description: ''
    });
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPassword(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderConnectionStatus = (status: any) => {
    if (!status) return null;

    const isConnected = status.connected || status.readyState === 1;
    
    return (
      <div className={`flex items-center gap-2 text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
        {isConnected ? (
          <>
            <CheckCircle className="h-4 w-4" />
            <span>已连接</span>
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4" />
            <span>未连接</span>
          </>
        )}
      </div>
    );
  };

  const renderDatabaseForm = (dbConfig: any, onChange: (config: any) => void, formKey: string) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">数据库名称</label>
        <input
          type="text"
          value={dbConfig.name || ''}
          onChange={(e) => onChange({ ...dbConfig, name: e.target.value })}
          className="input-field"
          placeholder="例如: 用户数据库"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">数据库类型</label>
        <select
          value={dbConfig.type || 'mongodb'}
          onChange={(e) => onChange({ ...dbConfig, type: e.target.value })}
          className="input-field"
        >
          <option value="mongodb">MongoDB</option>
          <option value="mysql">MySQL</option>
          <option value="postgresql">PostgreSQL</option>
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
            placeholder="localhost"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">端口</label>
          <input
            type="number"
            value={dbConfig.port || 27017}
            onChange={(e) => onChange({ ...dbConfig, port: parseInt(e.target.value) || 27017 })}
            className="input-field"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">用户名（可选）</label>
          <input
            type="text"
            value={dbConfig.username || ''}
            onChange={(e) => onChange({ ...dbConfig, username: e.target.value })}
            className="input-field"
            placeholder="数据库用户名"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">密码（可选）</label>
          <div className="relative">
            <input
              type={showPassword[formKey] ? 'text' : 'password'}
              value={dbConfig.password || ''}
              onChange={(e) => onChange({ ...dbConfig, password: e.target.value })}
              className="input-field pr-10"
              placeholder="数据库密码（加密存储）"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility(formKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword[formKey] ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {dbConfig.password === '******' ? (
            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              密码已遮盖，如需修改请重新输入完整密码
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">密码将使用 AES-256 加密存储</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">数据库名</label>
        <input
          type="text"
          value={dbConfig.database || ''}
          onChange={(e) => onChange({ ...dbConfig, database: e.target.value })}
          className="input-field"
          placeholder="infosearch"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          认证数据库（authSource）
          <span className="text-xs text-gray-500 ml-2">默认: admin</span>
        </label>
        <input
          type="text"
          value={dbConfig.authSource || 'admin'}
          onChange={(e) => onChange({ ...dbConfig, authSource: e.target.value })}
          className="input-field"
          placeholder="admin"
        />
        <p className="text-xs text-gray-500 mt-1">
          MongoDB 用户认证所在的数据库，通常为 admin
        </p>
      </div>

      {dbEditType === 'query' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">描述（可选）</label>
          <input
            type="text"
            value={dbConfig.description || ''}
            onChange={(e) => onChange({ ...dbConfig, description: e.target.value })}
            className="input-field"
            placeholder="数据库用途说明"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">连接池大小</label>
          <input
            type="number"
            value={dbConfig.connectionPool || 10}
            onChange={(e) => onChange({ ...dbConfig, connectionPool: parseInt(e.target.value) || 10 })}
            className="input-field"
            min="1"
            max="100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">超时时间（毫秒）</label>
          <input
            type="number"
            value={dbConfig.timeout || 30000}
            onChange={(e) => onChange({ ...dbConfig, timeout: parseInt(e.target.value) || 30000 })}
            className="input-field"
            min="1000"
            step="1000"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">数据库配置</h2>
        <p className="text-gray-600 text-sm mt-1">配置用户数据库和查询数据库连接信息（密码加密存储）</p>
      </div>

      {/* 用户数据库配置 */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Database className="h-5 w-5 mr-2 text-blue-600" />
              用户数据库
            </h3>
            {connectionStatus?.user && renderConnectionStatus(connectionStatus.user)}
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            <AlertCircle className="h-4 w-4 inline mr-1" />
            用户数据库存储所有网站数据（用户、订单、配置等），只能配置一个
          </p>
        </div>

        {renderDatabaseForm(userDatabase, onUpdateUserDatabase, 'user')}
        
        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            checked={userDatabase?.enabled !== false}
            onChange={(e) => onUpdateUserDatabase({ ...userDatabase, enabled: e.target.checked })}
            className="mr-2"
          />
          <label className="text-sm font-medium text-gray-700">启用此数据库配置</label>
        </div>

        <div className="flex gap-3 pt-4 border-t mt-4">
          <button 
            onClick={() => handleTestConnection(userDatabase)} 
            disabled={testing}
            className="btn-secondary flex items-center"
          >
            {testing ? (
              <>
                <Loader className="h-5 w-5 mr-2 animate-spin" />
                测试中...
              </>
            ) : (
              <>
                <Database className="h-5 w-5 mr-2" />
                测试连接
              </>
            )}
          </button>
        </div>

        {testResult && (
          <div className={`mt-4 p-3 rounded-lg ${testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <span className="font-medium">{testResult.message}</span>
            </div>
          </div>
        )}
      </div>

      {/* 查询数据库配置 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Database className="h-5 w-5 mr-2 text-purple-600" />
              查询数据库
            </h3>
            <p className="text-sm text-gray-600 mt-1">用于数据查询功能，可以配置多个</p>
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
            {renderDatabaseForm(editingItem, setEditingItem, 'query_edit')}
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                checked={editingItem?.enabled || false}
                onChange={(e) => setEditingItem({ ...editingItem, enabled: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">启用此数据库</span>
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t">
              <button onClick={handleSaveQueryDatabase} className="btn-primary flex items-center">
                <Save className="h-5 w-5 mr-2" />
                保存
              </button>
              <button 
                onClick={() => handleTestConnection(editingItem)} 
                disabled={testing}
                className="btn-secondary flex items-center"
              >
                {testing ? (
                  <>
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                    测试中...
                  </>
                ) : (
                  <>
                    <Database className="h-5 w-5 mr-2" />
                    测试连接
                  </>
                )}
              </button>
              <button onClick={() => { setEditingItem(null); setIsAdding(false); }} className="btn-secondary">
                取消
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {queryDatabases.map((db, index) => {
            const dbStatus = connectionStatus?.query?.find((q: any) => q.id === db.id);
            return (
              <div key={db.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{db.name}</h3>
                      {dbStatus && renderConnectionStatus(dbStatus)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        db.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {db.enabled ? '启用' : '禁用'}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {db.type.toUpperCase()}
                      </span>
                    </div>
                    {db.description && (
                      <p className="text-sm text-gray-600 mb-2">{db.description}</p>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>主机: {db.host}:{db.port}</div>
                      <div>数据库: {db.database}</div>
                      <div>用户: {db.username || '(无)'}</div>
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
                      title="编辑"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteQueryDatabase(db.id)} 
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="删除"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {queryDatabases.length === 0 && !editingItem && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">还没有配置查询数据库</p>
              <button onClick={handleAddQueryDatabase} className="btn-primary flex items-center mx-auto">
                <Plus className="h-5 w-5 mr-2" />
                添加第一个查询数据库
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 保存按钮 */}
      <div className="flex gap-3 mt-6 pt-6 border-t">
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="btn-primary flex items-center"
        >
          {saving ? (
            <>
              <Loader className="h-5 w-5 mr-2 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              保存所有配置
            </>
          )}
        </button>
        <button 
          onClick={loadConnectionStatus}
          className="btn-secondary"
        >
          刷新连接状态
        </button>
      </div>
    </div>
  );
};
