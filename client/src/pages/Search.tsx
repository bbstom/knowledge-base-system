import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Database } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { searchApi } from '../utils/api';
import { isAuthenticated } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import toast from 'react-hot-toast';

export const Search: React.FC = () => {
  const navigate = useNavigate();
  const { updatePoints } = useUser();
  const [searchType, setSearchType] = useState('phone');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [advertisements, setAdvertisements] = useState<any[]>([]);

  const searchTypes = [
    { value: 'idcard', label: '身份证', placeholder: '请输入8-25位身份证号', pattern: /^\d{7,24}[a-zA-Z0-9]?$/ },
    { value: 'phone', label: '手机号', placeholder: '请输入11位手机号', pattern: /^1[3-9]\d{9}$/ },
    { value: 'name', label: '姓名', placeholder: '请输入姓名', pattern: /^.{2,50}$/ },
    { value: 'qq', label: 'QQ号', placeholder: '请输入QQ号', pattern: /^\d{5,12}$/ },
    { value: 'weibo', label: '微博号', placeholder: '请输入微博号', pattern: /^.{2,50}$/ },
    { value: 'wechat', label: '微信号', placeholder: '请输入微信号', pattern: /^[a-zA-Z0-9_-]{6,20}$/ },
    { value: 'email', label: '邮箱', placeholder: '请输入邮箱地址', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  ];

  const validateInput = (type: string, value: string): { valid: boolean; message?: string } => {
    const searchType = searchTypes.find(t => t.value === type);
    if (!searchType) return { valid: false, message: '无效的搜索类型' };

    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return { valid: false, message: '请输入搜索内容' };
    }

    if (!searchType.pattern.test(trimmedValue)) {
      switch (type) {
        case 'phone':
          return { valid: false, message: '请输入正确的11位手机号' };
        case 'idcard':
          return { valid: false, message: '身份证号应为8-25位，最多包含一位字母' };
        case 'email':
          return { valid: false, message: '请输入正确的邮箱地址' };
        case 'qq':
          return { valid: false, message: 'QQ号应为5-12位数字' };
        case 'wechat':
          return { valid: false, message: '微信号应为6-20位字母、数字、下划线或横线' };
        case 'name':
          return { valid: false, message: '姓名长度应为2-50个字符' };
        default:
          return { valid: false, message: '输入格式不正确' };
      }
    }

    return { valid: true };
  };

  useEffect(() => {
    loadAdvertisements();
  }, []);

  const loadAdvertisements = async () => {
    try {
      const response = await fetch('/api/advertisements/public?position=search');
      const data = await response.json();
      if (data?.success) {
        setAdvertisements(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load advertisements:', error);
    }
  };

  const handleSearch = async () => {
    if (!isAuthenticated()) {
      toast.error('请先登录');
      navigate('/login');
      return;
    }

    // 验证输入
    const validation = validateInput(searchType, query);
    if (!validation.valid) {
      toast.error(validation.message || '输入格式不正确');
      return;
    }

    setLoading(true);
    setSearchProgress(0);
    setResult(null);
    
    try {
      // 先获取数据库列表以计算总数
      const dbResponse = await searchApi.getDatabases() as any;
      const totalDatabases = dbResponse?.success ? (dbResponse.data?.length || 15) : 15;
      
      // 由于是并行搜索，实际时间远小于串行时间
      // 使用更保守的估算：总时间约为数据库数量的平方根 * 500ms
      const estimatedTime = Math.sqrt(totalDatabases) * 500;
      const updateInterval = 400; // 每400ms更新一次
      const progressStep = 90 / (estimatedTime / updateInterval); // 计算每次增加的进度
      
      // 平滑增长进度条
      const progressInterval = setInterval(() => {
        setSearchProgress(prev => {
          if (prev >= 90) return 90;
          return Math.min(90, prev + progressStep);
        });
      }, updateInterval);
      
      const response = await searchApi.search({
        type: searchType,
        query: query.trim(),
        databaseId: 'auto'
      }) as any;

      clearInterval(progressInterval);
      setSearchProgress(100);

      if (response?.success) {
        setResult(response.data);
        
        // 更新用户积分
        if (response.data.remainingPoints !== undefined) {
          updatePoints(response.data.remainingPoints);
        }
        
        if (response.data.total > 0) {
          toast.success(`找到 ${response.data.total} 条结果`);
        } else {
          toast.error('未找到相关信息');
        }
      } else {
        toast.error(response?.message || '搜索失败');
      }
    } catch (error: any) {
      setSearchProgress(0);
      toast.error(error.response?.data?.message || '搜索失败');
    } finally {
      setTimeout(() => {
        setLoading(false);
        setSearchProgress(0);
      }, 500);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            信息搜索
          </h1>
          <p className="text-gray-600">
            选择搜索类型，输入查询内容开始搜索
          </p>
        </div>

        <div className="card mb-8">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              信息搜索
            </label>
            <div className="flex">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="input-field rounded-r-none border-r-0 w-32"
              >
                {searchTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchTypes.find(t => t.value === searchType)?.placeholder || '请输入搜索内容'}
                className="input-field rounded-none flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="btn-primary rounded-l-none flex items-center min-w-[120px] justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    搜索中...
                  </>
                ) : (
                  <>
                    <SearchIcon className="h-5 w-5 mr-2" />
                    搜索
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Progress */}
        {loading && (
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">正在搜索数据库...</span>
              <span className="text-sm font-medium text-blue-600">{Math.round(searchProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${searchProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              正在并行搜索多个数据库，请稍候...
            </p>
          </div>
        )}

        {/* Advertisements */}
        {advertisements.length > 0 && (
          <div className="mb-8 space-y-4">
            {advertisements.map((ad: any) => (
              <div
                key={ad._id || ad.id}
                className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500"
              >
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: ad.content }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Search Result */}
        {result && (
          <div className="space-y-4">
            {/* Result Summary */}
            <div className={`card border-l-4 ${result.cost > 0 ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    找到 {result.total} 条结果
                  </h3>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-sm text-gray-600">
                      {result.cost > 0 ? (
                        <span>消耗积分: <span className="font-semibold text-red-600">{result.cost}</span></span>
                      ) : (
                        <span className="text-green-600 font-semibold">✓ 免费搜索</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      剩余积分: <span className="font-semibold">{result.remainingPoints}</span>
                    </p>
                  </div>
                  {result.chargeReason && (
                    <p className="text-xs text-gray-500 mt-1">
                      {result.chargeReason}
                      {result.isRepeatSearch && ' (历史搜索记录)'}
                    </p>
                  )}
                  {result.searchTime && result.databasesSearched && (
                    <p className="text-xs text-gray-500 mt-1">
                      搜索了 {result.databasesSearched} 个数据库，耗时 {result.searchTime}ms
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Results List */}
            {result.results && result.results.length > 0 ? (
              result.results.map((item: any, index: number) => (
                <div key={item.id || index} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <Database className="h-5 w-5 mr-2 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {item.database?.name || '未知数据库'}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {item.database?.description}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      匹配
                    </span>
                  </div>

                  {/* Data Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(item.data || {}).map(([key, value]: [string, any]) => (
                          <tr key={key} className={key === item.matchedField ? 'bg-yellow-50' : ''}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-700 w-1/4">
                              {key}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {value || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            ) : (
              <div className="card text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Database className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  未找到相关信息
                </h3>
                <p className="text-gray-600">
                  请尝试使用其他关键词或搜索类型
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};