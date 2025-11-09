import React, { useState, useEffect } from 'react';
import { Upload, RefreshCw, AlertTriangle, CheckCircle, Clock, XCircle, ArrowUp, RotateCcw } from 'lucide-react';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import toast from 'react-hot-toast';
import axios from 'axios';
import Cookies from 'js-cookie';

interface UpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion?: {
    version: string;
    releaseDate: string;
    changelog: string;
    features: string[];
    bugfixes: string[];
    downloadUrl: string;
    size: number;
  };
}

interface UpgradeLog {
  _id: string;
  fromVersion: string;
  toVersion: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
  startTime: string;
  endTime?: string;
  backupId?: string;
  logs: Array<{
    timestamp: string;
    level: string;
    message: string;
  }>;
  error?: string;
  performedBy?: {
    username: string;
    email: string;
  };
}

export const UpgradeManagement: React.FC = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [upgradeHistory, setUpgradeHistory] = useState<UpgradeLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<UpgradeLog | null>(null);

  useEffect(() => {
    checkUpdate();
    loadUpgradeHistory();
  }, []);

  const checkUpdate = async () => {
    setChecking(true);
    try {
      const token = Cookies.get('token');
      const response = await axios.get('/api/system/check-update', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUpdateInfo(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '检查更新失败');
    } finally {
      setChecking(false);
    }
  };

  const loadUpgradeHistory = async () => {
    setLoading(true);
    try {
      const token = Cookies.get('token');
      const response = await axios.get('/api/system/upgrade-history', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUpgradeHistory(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '加载升级历史失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!updateInfo?.latestVersion) return;

    setUpgrading(true);
    try {
      const token = Cookies.get('token');
      const response = await axios.post(
        '/api/system/upgrade',
        { targetVersion: updateInfo.latestVersion.version },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setShowUpgradeModal(false);
        loadUpgradeHistory();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '启动升级失败');
    } finally {
      setUpgrading(false);
    }
  };

  const handleRollback = async (backupId: string) => {
    if (!confirm('确定要回滚到此备份吗？这将恢复系统到之前的状态。')) return;

    try {
      const token = Cookies.get('token');
      const response = await axios.post(
        '/api/system/rollback',
        { backupId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        loadUpgradeHistory();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '启动回滚失败');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'rolled_back':
        return <RotateCcw className="h-5 w-5 text-orange-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Upload className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">升级管理</h1>
              <p className="text-sm text-gray-500">检查更新和管理系统升级</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={checkUpdate}
              disabled={checking}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
              检查更新
            </button>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              升级历史
            </button>
          </div>
        </div>

        {/* 更新信息卡片 */}
        {updateInfo && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">更新检查</h2>

            {updateInfo.hasUpdate && updateInfo.latestVersion ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <ArrowUp className="h-6 w-6 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      发现新版本 v{updateInfo.latestVersion.version}
                    </h3>
                    <p className="text-sm text-blue-700 mb-3">
                      {updateInfo.latestVersion.changelog}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">当前版本</div>
                        <div className="font-medium">v{updateInfo.currentVersion}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">最新版本</div>
                        <div className="font-medium text-blue-600">
                          v{updateInfo.latestVersion.version}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">发布日期</div>
                        <div className="font-medium">
                          {new Date(updateInfo.latestVersion.releaseDate).toLocaleDateString('zh-CN')}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">文件大小</div>
                        <div className="font-medium">
                          {formatSize(updateInfo.latestVersion.size)}
                        </div>
                      </div>
                    </div>

                    {updateInfo.latestVersion.features.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">新功能：</div>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {updateInfo.latestVersion.features.map((feature, idx) => (
                            <li key={idx}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {updateInfo.latestVersion.bugfixes.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">修复问题：</div>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {updateInfo.latestVersion.bugfixes.map((fix, idx) => (
                            <li key={idx}>{fix}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      立即升级
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <div className="font-semibold text-green-900">系统已是最新版本</div>
                  <div className="text-sm text-green-700">
                    当前版本: v{updateInfo.currentVersion}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 警告提示 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-2">升级注意事项</h3>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>升级前会自动创建完整备份</li>
                <li>升级过程中系统将短暂不可用</li>
                <li>如果升级失败，系统会自动回滚</li>
                <li>建议在低峰期进行升级操作</li>
                <li>升级完成后需要重启服务器</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 升级历史 */}
        {upgradeHistory.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">最近升级记录</h2>
            <div className="space-y-3">
              {upgradeHistory.slice(0, 5).map((log) => (
                <div
                  key={log._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(log.status)}
                    <div>
                      <div className="font-medium">
                        v{log.fromVersion} → v{log.toVersion}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(log.startTime).toLocaleString('zh-CN')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.status === 'completed' && log.backupId && (
                      <button
                        onClick={() => handleRollback(log.backupId!)}
                        className="px-3 py-1 text-sm text-orange-600 hover:bg-orange-50 rounded"
                      >
                        回滚
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                    >
                      查看详情
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 升级确认对话框 */}
        {showUpgradeModal && updateInfo?.latestVersion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">确认升级</h3>
              
              <div className="mb-4 space-y-2">
                <p className="text-sm text-gray-600">
                  确定要升级到 <strong>v{updateInfo.latestVersion.version}</strong> 吗？
                </p>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    升级前会自动创建备份，如果升级失败会自动回滚。
                  </p>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={upgrading}
                >
                  取消
                </button>
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {upgrading && <RefreshCw className="h-4 w-4 animate-spin" />}
                  {upgrading ? '升级中...' : '确认升级'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 日志详情对话框 */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">升级日志详情</h3>
              
              <div className="space-y-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">版本</div>
                    <div className="font-medium">
                      v{selectedLog.fromVersion} → v{selectedLog.toVersion}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">状态</div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedLog.status)}
                      <span className="font-medium">
                        {selectedLog.status === 'completed' ? '完成' :
                         selectedLog.status === 'failed' ? '失败' :
                         selectedLog.status === 'running' ? '进行中' :
                         selectedLog.status === 'rolled_back' ? '已回滚' : '等待中'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">开始时间</div>
                    <div className="font-medium">
                      {new Date(selectedLog.startTime).toLocaleString('zh-CN')}
                    </div>
                  </div>
                  {selectedLog.endTime && (
                    <div>
                      <div className="text-sm text-gray-500">结束时间</div>
                      <div className="font-medium">
                        {new Date(selectedLog.endTime).toLocaleString('zh-CN')}
                      </div>
                    </div>
                  )}
                </div>

                {selectedLog.error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <div className="text-sm font-medium text-red-900 mb-1">错误信息</div>
                    <div className="text-sm text-red-700">{selectedLog.error}</div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">日志记录</div>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-xs max-h-96 overflow-y-auto">
                    {selectedLog.logs.map((log, idx) => (
                      <div key={idx} className="mb-1">
                        <span className="text-gray-500">
                          [{new Date(log.timestamp).toLocaleTimeString()}]
                        </span>
                        <span className={`ml-2 ${
                          log.level === 'error' ? 'text-red-400' :
                          log.level === 'warning' ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>
                          [{log.level.toUpperCase()}]
                        </span>
                        <span className="ml-2">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UpgradeManagement;
