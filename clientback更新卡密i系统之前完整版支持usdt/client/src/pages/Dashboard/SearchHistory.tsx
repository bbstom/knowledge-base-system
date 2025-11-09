import React, { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle, XCircle, AlertCircle, Filter, Download } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { userApi } from '../../utils/api';
import { t } from '../../utils/i18n';

export const SearchHistory: React.FC = () => {
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, success, failed, timeout, unpaid
  const [dateRange, setDateRange] = useState('all'); // all, today, week, month
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadSearchHistory();
  }, [currentPage, filter, dateRange]);

  const loadSearchHistory = async () => {
    try {
      const response = await userApi.getSearchHistory(currentPage, 20) as any;
      if (response?.success) {
        setSearchHistory(response.data.history || []);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'timeout':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'unpaid':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return '成功';
      case 'failed':
        return '失败';
      case 'timeout':
        return '超时';
      case 'unpaid':
        return '未支付';
      default:
        return '未知';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'timeout':
        return 'bg-yellow-100 text-yellow-800';
      case 'unpaid':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSearchTypeText = (type: string) => {
    const types: Record<string, string> = {
      idcard: '身份证',
      phone: '手机号',
      name: '姓名',
      qq: 'QQ号',
      weibo: '微博号',
      wechat: '微信号',
      email: '邮箱'
    };
    return types[type] || type;
  };

  const filteredHistory = searchHistory.filter((record: any) => {
    if (filter !== 'all' && record.status !== filter) return false;
    
    if (dateRange !== 'all') {
      const recordDate = new Date(record.createdAt);
      const now = new Date();
      
      switch (dateRange) {
        case 'today':
          return recordDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return recordDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return recordDate >= monthAgo;
      }
    }
    
    return true;
  });

  const exportHistory = () => {
    // 导出搜索历史功能
    const csvContent = [
      ['时间', '搜索类型', '查询内容', '数据库', '状态', '费用'],
      ...filteredHistory.map((record: any) => [
        new Date(record.createdAt).toLocaleString(),
        getSearchTypeText(record.type),
        record.query,
        record.database,
        getStatusText(record.status),
        `¥${record.cost.toFixed(2)}`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `search_history_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <Layout showSidebar>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">{t('common.loading')}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              搜索历史
            </h1>
            <p className="text-gray-600">
              查看所有搜索记录和费用详情
            </p>
          </div>
          <button
            onClick={exportHistory}
            className="btn-secondary flex items-center"
          >
            <Download className="h-5 w-5 mr-2" />
            导出记录
          </button>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">筛选:</span>
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field w-auto"
            >
              <option value="all">全部状态</option>
              <option value="success">成功</option>
              <option value="failed">失败</option>
              <option value="timeout">超时</option>
              <option value="unpaid">未支付</option>
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="input-field w-auto"
            >
              <option value="all">全部时间</option>
              <option value="today">今天</option>
              <option value="week">最近7天</option>
              <option value="month">最近30天</option>
            </select>
          </div>
        </div>

        {/* Search History Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">时间</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">搜索类型</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">查询内容</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">数据库</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">结果</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">积分</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">耗时</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((record: any, index) => (
                    <tr key={record._id || index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(record.createdAt || Date.now()).toLocaleString('zh-CN')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {getSearchTypeText(record.searchType)}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm">
                        {record.searchQuery || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {record.databasesSearched || 0} 个数据库
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {record.resultsCount > 0 ? getStatusIcon('success') : getStatusIcon('failed')}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.resultsCount > 0 ? getStatusColor('success') : getStatusColor('failed')
                          }`}>
                            {record.resultsCount > 0 ? `找到${record.resultsCount}条` : '无结果'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${
                          record.pointsCharged > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {record.pointsCharged > 0 ? `-${record.pointsCharged}` : '免费'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-sm">
                        {record.searchTime ? `${record.searchTime}ms` : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">暂无搜索记录</p>
                      <p className="text-sm text-gray-400">开始你的第一次搜索吧</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                第 {currentPage} 页，共 {totalPages} 页
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary text-sm disabled:opacity-50"
                >
                  上一页
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary text-sm disabled:opacity-50"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {filteredHistory.length}
            </div>
            <div className="text-sm text-gray-600">总搜索次数</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {filteredHistory.filter((r: any) => r.resultsCount > 0).length}
            </div>
            <div className="text-sm text-gray-600">有结果次数</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {filteredHistory.filter((r: any) => r.resultsCount === 0).length}
            </div>
            <div className="text-sm text-gray-600">无结果次数</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {filteredHistory.reduce((sum: number, r: any) => sum + (r.pointsCharged || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">消耗积分</div>
          </div>
        </div>
      </div>
    </Layout>
  );
};