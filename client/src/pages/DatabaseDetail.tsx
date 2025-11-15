import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Database, ArrowLeft, Users, CheckCircle } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { searchApi } from '../utils/api';
import toast from 'react-hot-toast';

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

export const DatabaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [database, setDatabase] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTypeLabels, setSearchTypeLabels] = useState<Record<string, string>>({
    'idcard': '身份证',
    'phone': '手机号',
    'name': '姓名',
    'qq': 'QQ号',
    'weibo': '微博号',
    'wechat': '微信号',
    'email': '邮箱',
    'address': '地址',
    'company': '公司',
  });

  useEffect(() => {
    loadSearchTypes();
    loadDatabase();
  }, [id]);

  const loadSearchTypes = async () => {
    try {
      const response = await fetch('/api/system-config/search-types/public', {
        credentials: 'include'
      });
      
      const data = await response.json();
      if (data.success && data.data) {
        // 构建ID到名称的映射（不区分大小写）
        const labels: Record<string, string> = {};
        data.data.forEach((type: any) => {
          // 同时存储原始ID和小写ID
          labels[type.id] = type.label;
          labels[type.id.toLowerCase()] = type.label;
        });
        setSearchTypeLabels(labels);
      }
    } catch (error) {
      console.error('加载搜索类型失败:', error);
      // 使用默认值
    }
  };

  const loadDatabase = async () => {
    try {
      setLoading(true);
      // 这里需要实现获取单个数据库的API
      // 暂时从列表中获取
      const response = await searchApi.getDatabases() as any;
      if (response?.success) {
        const dbList = Array.isArray(response.data) ? response.data : [];
        const found = dbList.find((db: any) => (db._id || db.id) === id);
        if (found) {
          setDatabase(found);
        } else {
          toast.error('数据清单不存在');
          navigate('/databases');
        }
      }
    } catch (error) {
      console.error('加载数据清单失败:', error);
      toast.error('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!database) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              数据清单不存在
            </h3>
            <button
              onClick={() => navigate('/databases')}
              className="btn-primary mt-4"
            >
              返回列表
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回按钮 */}
        <button
          onClick={() => navigate('/databases')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          返回数据清单
        </button>

        {/* 头部 */}
        <div className="card mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Database className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {database.name}
                </h1>
                <div className="flex items-center mt-2 space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    database.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {database.isActive ? '可用' : '维护中'}
                  </span>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    {database.userCount || '1000'}+ 用户使用
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 描述 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">数据清单描述</h2>
            <div 
              className="text-gray-600 leading-relaxed" 
              dangerouslySetInnerHTML={{ __html: formatTextWithLineBreaks(database.description || '') }}
            />
          </div>

          {/* 详细信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">基本信息</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">数据来源:</span>
                  <span className="font-medium">{database.source || '官方数据'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">记录数量:</span>
                  <span className="font-medium">{database.recordCount?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">更新时间:</span>
                  <span className="font-medium">
                    {database.lastUpdated ? new Date(database.lastUpdated).toLocaleDateString() : '2024-01-01'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">支持的搜索类型</h3>
              <div className="flex flex-wrap gap-2">
                {database.supportedTypes && database.supportedTypes.length > 0 ? (
                  database.supportedTypes.map((type: string) => (
                    <span
                      key={type}
                      className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium flex items-center"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {searchTypeLabels[type] || type}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">全部类型</span>
                )}
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/search')}
              className="btn-primary flex-1"
              disabled={!database.isActive}
            >
              立即查询
            </button>
            <button
              onClick={() => navigate('/databases')}
              className="btn-secondary flex-1"
            >
              返回列表
            </button>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">使用说明</h2>
          <div className="space-y-4 text-gray-600">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mr-3">
                1
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">选择搜索类型</h3>
                <p className="text-sm">根据您的需求选择合适的搜索类型，本数据清单支持上述所有类型。</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mr-3">
                2
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">输入查询信息</h3>
                <p className="text-sm">在搜索框中输入您要查询的信息，确保信息准确无误。</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mr-3">
                3
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">查看结果</h3>
                <p className="text-sm">系统将从数据清单中查询相关信息并展示结果。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
