import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Search, Star } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { searchApi } from '../utils/api';
import { t } from '../utils/i18n';

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

export const Databases: React.FC = () => {
  const navigate = useNavigate();
  const [databases, setDatabases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // 每页显示6个
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
    loadDatabases();
  }, []);

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
        console.log('✅ 加载搜索类型映射:', labels);
        setSearchTypeLabels(labels);
      }
    } catch (error) {
      console.error('加载搜索类型失败:', error);
      // 使用默认值
    }
  };

  const loadDatabases = async () => {
    try {
      console.log('开始加载数据清单...');
      const response = await searchApi.getDatabases() as any;
      console.log('API响应:', response);
      
      if (response?.success) {
        // 确保数据是数组格式
        const dbList = Array.isArray(response.data) ? response.data : [];
        console.log('数据清单:', dbList);
        console.log('📊 数据库状态:', dbList.map((db: any) => ({ name: db.name, status: db.status })));
        setDatabases(dbList);
      } else {
        console.error('API返回失败:', response);
        setDatabases([]);
      }
    } catch (error) {
      console.error('加载数据清单失败:', error);
      setDatabases([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDatabases = databases.filter((db) =>
    db.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    db.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 分页逻辑
  const totalPages = Math.ceil(filteredDatabases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDatabases = filteredDatabases.slice(startIndex, endIndex);

  // 当搜索词改变时重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">{t('common.loading')}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            数据清单
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            我们提供多个高质量的数据源，覆盖各种信息类型，满足不同的查询需求
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="max-w-md mx-auto">
            <div className="relative">
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
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {databases.length}+
            </div>
            <div className="text-gray-600">可用数据源</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {databases.reduce((sum: number, db) => sum + (db.recordCount || 0), 0).toLocaleString()}+
            </div>
            <div className="text-gray-600">总记录数</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
            <div className="text-gray-600">查询成功率</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentDatabases.map((db) => (
            <div key={db._id || db.id} className="card hover:shadow-lg transition-shadow flex flex-col">
              {/* 头部 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center flex-1">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Database className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors"
                      onClick={() => navigate(`/databases/${db._id || db.id}`)}
                    >
                      {db.name}
                    </h3>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">
                        {db.rating || '4.8'}
                      </span>
                    </div>
                  </div>
                </div>
                {(() => {
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
                  const status = db.status || 'normal';
                  return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColors[status]}`}>
                      {statusLabels[status]}
                    </span>
                  );
                })()}
              </div>

              {/* 描述 - 限制2行显示 */}
              <div 
                className="text-gray-600 text-sm mb-4 line-clamp-2" 
                title={db.description || ''}
              >
                {db.description || ''}
              </div>

              {/* 详细信息 */}
              <div className="space-y-2 mb-4 flex-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">数据来源:</span>
                  <span className="font-medium">
                    {db.source || '官方数据'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">记录数量:</span>
                  <span className="font-medium">
                    {db.recordCount?.toLocaleString() || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">更新时间:</span>
                  <span className="font-medium">
                    {db.lastUpdated ? new Date(db.lastUpdated).toLocaleDateString() : '2024-01-01'}
                  </span>
                </div>
                {db.leakDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">泄露时间:</span>
                    <span className="font-medium text-red-600">
                      {new Date(db.leakDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="text-sm">
                  <span className="text-gray-600 block mb-2">支持搜索:</span>
                  <div className="flex flex-wrap gap-1">
                    {db.supportedTypes && db.supportedTypes.length > 0 ? (
                      db.supportedTypes.map((type: string) => {
                        const label = searchTypeLabels[type] || type;
                        console.log(`类型映射: ${type} -> ${label}`, searchTypeLabels);
                        return (
                          <span
                            key={type}
                            className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                          >
                            {label}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-gray-400 text-xs">全部类型</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 底部操作区 - 固定在底部 */}
              <div className="pt-4 border-t border-gray-200 mt-auto">
                <button 
                  onClick={() => navigate('/search')}
                  className="btn-primary w-full text-sm"
                  disabled={!db.isActive}
                >
                  立即查询
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredDatabases.length === 0 && !loading && (
          <div className="text-center py-12">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {databases.length === 0 ? '暂无数据清单' : '未找到匹配的数据清单'}
            </h3>
            <p className="text-gray-600">
              {databases.length === 0 
                ? '管理员还未添加任何数据清单，请稍后再试' 
                : '请尝试使用不同的关键词搜索'}
            </p>
          </div>
        )}

        {/* 分页控件 */}
        {filteredDatabases.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              上一页
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // 只显示当前页附近的页码
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return <span key={page} className="px-2 text-gray-400">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};