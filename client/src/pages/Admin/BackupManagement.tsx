import React, { useState, useEffect } from 'react';
import { Database, Download, Trash2, Plus, RefreshCw, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import toast from 'react-hot-toast';
import axios from 'axios';
import Cookies from 'js-cookie';

interface Backup {
  backupId: string;
  version: string;
  type: 'auto' | 'manual';
  status: 'pending' | 'running' | 'completed' | 'failed';
  size: number;
  filePath: string;
  description: string;
  createdAt: string;
  createdBy?: {
    username: string;
    email: string;
  };
}

interface SystemInfo {
  version: string;
  nodeVersion: string;
  platform: string;
  uptime: number;
  memory: {
    total: number;
    free: number;
    used: number;
  };
}

export const BackupManagement: React.FC = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

  useEffect(() => {
    loadBackups();
    loadSystemInfo();
  }, []);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const token = Cookies.get('token');
      const response = await axios.get('/api/system/backups', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setBackups(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '加载备份列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadSystemInfo = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get('/api/system/info', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSystemInfo(response.data.data);
      }
    } catch (error) {
      console.error('加载系统信息失败:', error);
    }
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      const token = Cookies.get('token');
      const response = await axios.post(
        '/api/system/backup',
        { description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('备份创建成功');
        setShowCreateModal(false);
        setDescription('');
        loadBackups();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '创建备份失败');
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (backupId: string, fileName: string) => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get(
        `/api/system/backup/${backupId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('备份下载成功');
    } catch (error: any) {
      toast.error(error.response?.data?.message || '下载备份失败');
    }
  };

  const handleDelete = async (backupId: string) => {
    if (!confirm('确定要删除这个备份吗？')) return;

    try {
      const token = Cookies.get('token');
      const response = await axios.delete(`/api/system/backup/${backupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('备份删除成功');
        loadBackups();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '删除备份失败');
    }
  };

  const handleRestore = async (backupId: string, version: string) => {
    if (!confirm(`确定要恢复到此备份吗？\n\n这将回滚系统到 v${version}，当前数据可能会丢失。\n\n建议先创建当前状态的备份。`)) return;

    try {
      const token = Cookies.get('token');
      const response = await axios.post(
        '/api/system/rollback',
        { backupId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setTimeout(() => {
          toast.success('系统将在几秒后重启以完成回滚');
        }, 1000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '启动回滚失败');
    }
  };

  const handleCleanup = async () => {
    if (!confirm('确定要清理7天前的自动备份吗？')) return;

    try {
      const token = Cookies.get('token');
      const response = await axios.post(
        '/api/system/backup/cleanup',
        { keepDays: 7 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        loadBackups();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '清理备份失败');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const totalBackups = backups.length;
  const completedBackups = backups.filter(b => b.status === 'completed').length;
  const totalSize = backups
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.size, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">备份管理</h1>
              <p className="text-sm text-gray-500">管理系统备份和恢复</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadBackups}
              disabled={loading}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </button>
            <button
              onClick={handleCleanup}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              清理旧备份
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              创建备份
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500 mb-1">总备份数</div>
            <div className="text-2xl font-bold text-gray-900">{totalBackups}</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500 mb-1">完成备份</div>
            <div className="text-2xl font-bold text-green-600">{completedBackups}</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500 mb-1">总大小</div>
            <div className="text-2xl font-bold text-gray-900">{formatSize(totalSize)}</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500 mb-1">当前版本</div>
            <div className="text-2xl font-bold text-blue-600">v{systemInfo?.version || '-'}</div>
          </div>
        </div>

        {/* 备份列表 */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">备份ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">版本</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">大小</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">描述</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {backups.map((backup) => (
                  <tr key={backup.backupId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">
                      {backup.backupId.substring(0, 20)}...
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        v{backup.version}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        backup.type === 'auto' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {backup.type === 'auto' ? '自动' : '手动'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(backup.status)}
                        <span className="text-sm text-gray-900">
                          {backup.status === 'completed' ? '完成' : 
                           backup.status === 'failed' ? '失败' :
                           backup.status === 'running' ? '进行中' : '等待中'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatSize(backup.size)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(backup.createdAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {backup.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {backup.status === 'completed' && (
                          <>
                            <button
                              onClick={() => handleDownload(backup.backupId, backup.filePath)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                              title="下载备份"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRestore(backup.backupId, backup.version)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded"
                              title="恢复到此备份"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(backup.backupId)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="删除备份"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 创建备份对话框 */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">创建备份</h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>备份内容：</strong>
                </p>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>用户数据库（完整）</li>
                  <li>系统配置文件</li>
                  <li>上传的文件</li>
                  <li>环境变量</li>
                </ul>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  备份描述（可选）
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="输入备份描述..."
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setDescription('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={creating}
                >
                  取消
                </button>
                <button
                  onClick={handleCreateBackup}
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {creating && <Loader className="h-4 w-4 animate-spin" />}
                  {creating ? '创建中...' : '创建'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default BackupManagement;
