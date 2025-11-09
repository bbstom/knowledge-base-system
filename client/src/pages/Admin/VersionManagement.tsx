import React, { useState, useEffect } from 'react';
import { Rocket, RefreshCw, CheckCircle, Info, Cpu, HardDrive, Clock } from 'lucide-react';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import toast from 'react-hot-toast';
import axios from 'axios';
import Cookies from 'js-cookie';

interface VersionInfo {
  currentVersion: string;
  version: string;
  releaseDate: string;
  changelog: string;
  features: string[];
  bugfixes: string[];
  isCurrent: boolean;
}

interface SystemInfo {
  version: string;
  nodeVersion: string;
  platform: string;
  arch: string;
  uptime: number;
  memory: {
    total: number;
    free: number;
    used: number;
  };
  cpu: string;
  cpuCount: number;
}

export const VersionManagement: React.FC = () => {
  const [currentVersion, setCurrentVersion] = useState<VersionInfo | null>(null);
  const [versionHistory, setVersionHistory] = useState<VersionInfo[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVersionInfo();
  }, []);

  const loadVersionInfo = async () => {
    setLoading(true);
    try {
      const token = Cookies.get('token');

      // 获取当前版本
      const versionResponse = await axios.get('/api/system/version', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (versionResponse.data.success) {
        setCurrentVersion(versionResponse.data.data);
      }

      // 获取版本历史
      const historyResponse = await axios.get('/api/system/version/history', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (historyResponse.data.success) {
        setVersionHistory(historyResponse.data.data);
      }

      // 获取系统信息
      const infoResponse = await axios.get('/api/system/info', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (infoResponse.data.success) {
        setSystemInfo(infoResponse.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '加载版本信息失败');
    } finally {
      setLoading(false);
    }
  };

  const formatMemory = (bytes: number) => {
    return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}天 ${hours}小时 ${minutes}分钟`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Rocket className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">版本管理</h1>
              <p className="text-sm text-gray-500">查看系统版本和信息</p>
            </div>
          </div>
          <button
            onClick={loadVersionInfo}
            disabled={loading}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </button>
        </div>

        {/* 当前版本信息 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Rocket className="h-5 w-5 text-blue-600" />
            当前版本
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">版本号</div>
              <div className="text-2xl font-bold text-blue-600">
                v{currentVersion?.currentVersion || '-'}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Node.js 版本</div>
              <div className="text-2xl font-bold text-gray-900">
                {systemInfo?.nodeVersion || '-'}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">运行时间</div>
              <div className="text-lg font-bold text-gray-900">
                {systemInfo ? formatUptime(systemInfo.uptime) : '-'}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">平台</div>
              <div className="text-2xl font-bold text-gray-900">
                {systemInfo?.platform || '-'}
              </div>
            </div>
          </div>

          {currentVersion && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">发布日期</div>
                  <div className="text-gray-900">
                    {new Date(currentVersion.releaseDate).toLocaleDateString('zh-CN')}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">状态</div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-green-600 font-medium">运行中</span>
                  </div>
                </div>
              </div>

              {currentVersion.changelog && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">更新日志</div>
                  <div className="text-gray-900">{currentVersion.changelog}</div>
                </div>
              )}

              {currentVersion.features && currentVersion.features.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-2">功能特性</div>
                  <ul className="list-disc list-inside space-y-1 text-gray-900">
                    {currentVersion.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 系统信息 */}
        {systemInfo && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              系统信息
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Cpu className="h-5 w-5 text-gray-600 mt-1" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-500">CPU</div>
                  <div className="text-gray-900">{systemInfo.cpu}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {systemInfo.cpuCount} 核心
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <HardDrive className="h-5 w-5 text-gray-600 mt-1" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-500">内存</div>
                  <div className="text-gray-900">
                    总内存: {formatMemory(systemInfo.memory.total)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    已用: {formatMemory(systemInfo.memory.used)} / 
                    可用: {formatMemory(systemInfo.memory.free)}
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(systemInfo.memory.used / systemInfo.memory.total) * 100}%`
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      使用率: {((systemInfo.memory.used / systemInfo.memory.total) * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Info className="h-5 w-5 text-gray-600 mt-1" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-500">系统架构</div>
                  <div className="text-gray-900">{systemInfo.arch}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Clock className="h-5 w-5 text-gray-600 mt-1" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-500">操作系统</div>
                  <div className="text-gray-900">{systemInfo.platform}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 版本历史 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">版本历史</h2>

          {versionHistory.length > 0 ? (
            <div className="space-y-6">
              {versionHistory.map((version, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      version.isCurrent ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                    {index < versionHistory.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 mt-2" />
                    )}
                  </div>

                  <div className="flex-1 pb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded">
                        v{version.version}
                      </span>
                      {version.isCurrent && (
                        <span className="px-2 py-1 text-sm font-medium bg-green-100 text-green-800 rounded">
                          当前版本
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {new Date(version.releaseDate).toLocaleDateString('zh-CN')}
                      </span>
                    </div>

                    {version.changelog && (
                      <div className="text-gray-900 mb-2">{version.changelog}</div>
                    )}

                    {version.features && version.features.length > 0 && (
                      <div className="mb-2">
                        <div className="text-sm font-medium text-gray-700 mb-1">新功能：</div>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {version.features.map((feature, idx) => (
                            <li key={idx}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {version.bugfixes && version.bugfixes.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">修复问题：</div>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {version.bugfixes.map((fix, idx) => (
                            <li key={idx}>{fix}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              暂无版本历史记录
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default VersionManagement;
