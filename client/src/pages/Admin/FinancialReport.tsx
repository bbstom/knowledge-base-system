import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import {
  DollarSign, Download, Filter, RefreshCw, ArrowUpCircle, ArrowDownCircle, Calendar
} from 'lucide-react';

interface FinancialData {
  date: string;
  income: {
    points: number;
    balance: number;
  };
  expense: {
    points: number;
    balance: number;
  };
  net: {
    points: number;
    balance: number;
  };
  details: {
    recharge: number;        // 充值（余额）
    commission: number;      // 佣金支出（余额）
    withdraw: number;        // 提现支出（余额）
    consume: number;         // 消费（积分）
    refund: number;          // 退款（余额）
    register: number;        // 注册赠送（积分）
    referralBonus: number;   // 推荐奖励（积分）
  };
}

export const FinancialReport: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('7'); // 7天、30天、90天、custom
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [summary, setSummary] = useState({
    totalIncome: { points: 0, balance: 0 },
    totalExpense: { points: 0, balance: 0 },
    netProfit: { points: 0, balance: 0 },
    avgDailyIncome: { points: 0, balance: 0 },
    avgDailyExpense: { points: 0, balance: 0 }
  });
  const [period, setPeriod] = useState({ days: 0, startDate: '', endDate: '' });

  useEffect(() => {
    if (dateRange !== 'custom') {
      loadFinancialData();
    }
  }, [dateRange]);

  const loadFinancialData = async (useCustomDates = false) => {
    setLoading(true);
    setError(null);
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('未找到登录凭证，请重新登录');
      }

      // 构建API URL
      let apiUrl = '/api/admin/financial-report';
      if (useCustomDates && customStartDate && customEndDate) {
        apiUrl += `?startDate=${customStartDate}&endDate=${customEndDate}`;
      } else if (dateRange === 'custom' && customStartDate && customEndDate) {
        apiUrl += `?startDate=${customStartDate}&endDate=${customEndDate}`;
      } else if (dateRange !== 'custom') {
        apiUrl += `?days=${dateRange}`;
      } else {
        apiUrl += `?days=7`;
      }

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('登录已过期，请重新登录');
        } else if (response.status === 403) {
          throw new Error('权限不足，需要管理员权限');
        }
        throw new Error(`获取数据失败 (${response.status})`);
      }

      const data = await response.json();
      if (data.success) {
        setFinancialData(data.data.dailyData);
        setSummary(data.data.summary);
        setPeriod(data.data.period);
        setError(null);
      } else {
        throw new Error(data.message || '获取财务数据失败');
      }
    } catch (error: any) {
      console.error('Failed to load financial data:', error);
      setError(error.message || '加载财务数据时发生错误');
      setFinancialData([]);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['日期', '积分入账', '余额入账', '积分出账', '余额出账', '积分净收入', '余额净收入', '充值', '佣金', '提现', '消费', '退款', '注册赠送', '推荐奖励'];
    const rows = financialData.map(d => [
      d.date,
      d.income.points,
      d.income.balance,
      d.expense.points,
      d.expense.balance,
      d.net.points,
      d.net.balance,
      d.details.recharge,
      d.details.commission,
      d.details.withdraw,
      d.details.consume,
      d.details.refund,
      d.details.register,
      d.details.referralBonus
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `财务报告_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-slate-300">加载中...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-center max-w-md">
            <div className="mb-4">
              <DollarSign className="h-16 w-16 text-red-500 mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              加载失败
            </h2>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            <button
              onClick={() => loadFinancialData()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              重新加载
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                财务报告
              </h1>
              <p className="text-gray-600">
                查看系统收入、支出和财务趋势
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => loadFinancialData()}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4" />
                刷新
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                导出CSV
              </button>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">时间范围:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { value: '7', label: '最近7天' },
                { value: '30', label: '最近30天' },
                { value: '90', label: '最近90天' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    setDateRange(option.value);
                    setShowCustomDatePicker(false);
                  }}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    dateRange === option.value && !showCustomDatePicker
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
              <button
                onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  showCustomDatePicker
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                自定义日期
              </button>
            </div>
          </div>

          {/* Custom Date Picker */}
          {showCustomDatePicker && (
            <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">开始日期:</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">结束日期:</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => {
                  if (customStartDate && customEndDate) {
                    setDateRange('custom');
                    loadFinancialData(true);
                  }
                }}
                disabled={!customStartDate || !customEndDate}
                className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                查询
              </button>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">积分入账</span>
              <ArrowUpCircle className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {summary.totalIncome.points.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              日均: {summary.avgDailyIncome.points.toLocaleString()}
            </p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">余额入账</span>
              <ArrowUpCircle className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              ${summary.totalIncome.balance.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              日均: ${summary.avgDailyIncome.balance.toLocaleString()}
            </p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">积分出账</span>
              <ArrowDownCircle className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {summary.totalExpense.points.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              日均: {summary.avgDailyExpense.points.toLocaleString()}
            </p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">余额出账</span>
              <ArrowDownCircle className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600">
              ${summary.totalExpense.balance.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              日均: ${summary.avgDailyExpense.balance.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Net Profit Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">积分净收入</span>
              <DollarSign className="h-5 w-5 text-purple-500" />
            </div>
            <p className={`text-3xl font-bold ${
              summary.netProfit.points >= 0 ? 'text-purple-600' : 'text-red-600'
            }`}>
              {summary.netProfit.points.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {summary.netProfit.points >= 0 ? '盈余' : '亏损'}
            </p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">余额净收入</span>
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <p className={`text-3xl font-bold ${
              summary.netProfit.balance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ${summary.netProfit.balance.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {summary.netProfit.balance >= 0 ? '盈利' : '亏损'}
            </p>
          </div>
        </div>

        {/* Daily Financial Table */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              每日财务明细
            </h3>
            {period.startDate && period.endDate && (
              <div className="text-sm text-gray-600">
                {period.startDate} 至 {period.endDate} ({period.days}天)
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    日期
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    充值($)
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    消费(积分)
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    注册赠送(积分)
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    推荐奖励(积分)
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    佣金($)
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    提现($)
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    退款($)
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 bg-purple-50">
                    积分净收入
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 bg-green-50">
                    余额净收入
                  </th>
                </tr>
              </thead>
              <tbody>
                {financialData.map((day, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {day.date}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-green-600">
                      ${day.details.recharge.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-purple-600">
                      {day.details.consume.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-purple-600">
                      {day.details.register.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-purple-600">
                      {day.details.referralBonus.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-red-600">
                      ${day.details.commission.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-red-600">
                      ${day.details.withdraw.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-red-600">
                      ${day.details.refund.toLocaleString()}
                    </td>
                    <td className={`py-3 px-4 text-sm text-right font-bold bg-purple-50 ${
                      day.net.points >= 0 ? 'text-purple-600' : 'text-red-600'
                    }`}>
                      {day.net.points.toLocaleString()}
                    </td>
                    <td className={`py-3 px-4 text-sm text-right font-bold bg-green-50 ${
                      day.net.balance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${day.net.balance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-semibold">
                  <td className="py-3 px-4 text-sm text-gray-900">
                    合计
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-green-600">
                    ${financialData.reduce((sum, d) => sum + d.details.recharge, 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-purple-600">
                    {financialData.reduce((sum, d) => sum + d.details.consume, 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-purple-600">
                    {financialData.reduce((sum, d) => sum + d.details.register, 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-purple-600">
                    {financialData.reduce((sum, d) => sum + d.details.referralBonus, 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-red-600">
                    ${financialData.reduce((sum, d) => sum + d.details.commission, 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-red-600">
                    ${financialData.reduce((sum, d) => sum + d.details.withdraw, 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-red-600">
                    ${financialData.reduce((sum, d) => sum + d.details.refund, 0).toLocaleString()}
                  </td>
                  <td className={`py-3 px-4 text-sm text-right font-bold bg-purple-50 ${
                    summary.netProfit.points >= 0 ? 'text-purple-600' : 'text-red-600'
                  }`}>
                    {summary.netProfit.points.toLocaleString()}
                  </td>
                  <td className={`py-3 px-4 text-sm text-right font-bold bg-green-50 ${
                    summary.netProfit.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${summary.netProfit.balance.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
