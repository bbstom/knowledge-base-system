import React, { useState, useEffect } from 'react';
import { 
  Users, DollarSign, Search, TrendingUp, 
  Database, CreditCard, AlertCircle,
  Activity, Server
} from 'lucide-react';
import { AdminLayout } from '../../components/Layout/AdminLayout';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    // 用户统计
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    newUsersThisMonth: 0,
    vipUsers: 0,
    
    // 财务统计
    totalRevenue: 0,
    monthlyRevenue: 0,
    todayRevenue: 0,
    totalPoints: 0,
    totalCommission: 0,
    pendingWithdrawals: 0,
    totalWithdrawn: 0,
    
    // 搜索统计
    totalSearches: 0,
    todaySearches: 0,
    monthlySearches: 0,
    successRate: 0,
    
    // 推荐统计
    totalReferrals: 0,
    activeReferrals: 0,
    referralConversionRate: 0,
    
    // 数据库统计
    totalDatabases: 0,
    activeDatabases: 0,
    totalRecords: 0,
    
    // 系统状态
    systemStatus: 'healthy',
    databaseStatus: 'online',
    paymentGatewayStatus: 'online',
    emailServiceStatus: 'online',
    
    // 性能指标
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkTraffic: 0,
    
    // 待处理事项
    pendingReports: 0,
    systemAlerts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      // 模拟数据，实际应该调用管理员API
      setTimeout(() => {
        setStats({
          // 用户统计
          totalUsers: 12580,
          activeUsers: 3420,
          newUsersToday: 45,
          newUsersThisMonth: 1234,
          vipUsers: 856,
          
          // 财务统计
          totalRevenue: 1567805.50,
          monthlyRevenue: 234508.80,
          todayRevenue: 12345.60,
          totalPoints: 2345678,
          totalCommission: 456789.50,
          pendingWithdrawals: 15,
          totalWithdrawn: 234567.80,
          
          // 搜索统计
          totalSearches: 896504,
          todaySearches: 2345,
          monthlySearches: 45678,
          successRate: 94.5,
          
          // 推荐统计
          totalReferrals: 5678,
          activeReferrals: 2345,
          referralConversionRate: 68.5,
          
          // 数据库统计
          totalDatabases: 25,
          activeDatabases: 23,
          totalRecords: 15678900,
          
          // 系统状态
          systemStatus: 'healthy',
          databaseStatus: 'online',
          paymentGatewayStatus: 'online',
          emailServiceStatus: 'online',
          
          // 性能指标
          cpuUsage: 45,
          memoryUsage: 62,
          diskUsage: 78,
          networkTraffic: 234,
          
          // 待处理事项
          pendingReports: 3,
          systemAlerts: 0
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load admin stats:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
      case 'offline':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
        return '正常';
      case 'online':
        return '在线';
      case 'warning':
        return '警告';
      case 'error':
        return '错误';
      case 'offline':
        return '离线';
      default:
        return '未知';
    }
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

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            管理员仪表盘
          </h1>
          <p className="text-gray-600">
            系统概览和关键指标监控
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总用户数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalUsers.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  活跃: {stats.activeUsers.toLocaleString()} | VIP: {stats.vipUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总收入</p>
                <p className="text-2xl font-bold text-gray-900">
                  ¥{stats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  本月: ¥{stats.monthlyRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Search className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总搜索次数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalSearches.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  今日: {stats.todaySearches.toLocaleString()} | 成功率: {stats.successRate}%
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">待处理提现</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingWithdrawals}
                </p>
                <p className="text-xs text-yellow-600">
                  需要审核
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 用户统计 */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">用户统计</h3>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">总用户数</span>
                <span className="font-semibold text-gray-900">{stats.totalUsers.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">活跃用户</span>
                <span className="font-semibold text-green-600">{stats.activeUsers.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">VIP用户</span>
                <span className="font-semibold text-purple-600">{stats.vipUsers.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">今日新增</span>
                <span className="font-semibold text-blue-600">+{stats.newUsersToday}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">本月新增</span>
                <span className="font-semibold text-blue-600">+{stats.newUsersThisMonth.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">活跃率</span>
                  <span className="font-semibold text-gray-900">
                    {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 财务统计 */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">财务统计</h3>
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">总收入</span>
                <span className="font-semibold text-gray-900">¥{stats.totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">本月收入</span>
                <span className="font-semibold text-green-600">¥{stats.monthlyRevenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">今日收入</span>
                <span className="font-semibold text-green-600">¥{stats.todayRevenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">总积分</span>
                <span className="font-semibold text-blue-600">{stats.totalPoints.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">总佣金</span>
                <span className="font-semibold text-purple-600">¥{stats.totalCommission.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">已提现</span>
                <span className="font-semibold text-orange-600">¥{stats.totalWithdrawn.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 搜索统计 */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">搜索统计</h3>
              <Search className="h-5 w-5 text-purple-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">总搜索次数</span>
                <span className="font-semibold text-gray-900">{stats.totalSearches.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">本月搜索</span>
                <span className="font-semibold text-purple-600">{stats.monthlySearches.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">今日搜索</span>
                <span className="font-semibold text-purple-600">{stats.todaySearches.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">成功率</span>
                <span className="font-semibold text-green-600">{stats.successRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">平均每用户</span>
                <span className="font-semibold text-gray-900">
                  {(stats.totalSearches / stats.totalUsers).toFixed(1)}次
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">今日增长</span>
                  <span className="font-semibold text-green-600">+12.5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* More Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 推荐统计 */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">推荐统计</h3>
              <TrendingUp className="h-5 w-5 text-orange-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">总推荐数</span>
                <span className="font-semibold text-gray-900">{stats.totalReferrals.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">活跃推荐</span>
                <span className="font-semibold text-green-600">{stats.activeReferrals.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">转化率</span>
                <span className="font-semibold text-orange-600">{stats.referralConversionRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">平均推荐数</span>
                <span className="font-semibold text-gray-900">
                  {(stats.totalReferrals / stats.totalUsers).toFixed(1)}人
                </span>
              </div>
            </div>
          </div>

          {/* 数据库统计 */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">数据库统计</h3>
              <Database className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">总数据库数</span>
                <span className="font-semibold text-gray-900">{stats.totalDatabases}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">在线数据库</span>
                <span className="font-semibold text-green-600">{stats.activeDatabases}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">总记录数</span>
                <span className="font-semibold text-indigo-600">{stats.totalRecords.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">可用率</span>
                <span className="font-semibold text-green-600">
                  {((stats.activeDatabases / stats.totalDatabases) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* 待处理事项 */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">待处理事项</h3>
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">提现申请</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  {stats.pendingWithdrawals}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">用户举报</span>
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                  {stats.pendingReports}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">系统告警</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  stats.systemAlerts > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {stats.systemAlerts}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">系统服务状态</h3>
              <Server className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">系统健康度</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stats.systemStatus)}`}>
                  {getStatusText(stats.systemStatus)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">数据库服务</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stats.databaseStatus)}`}>
                  {getStatusText(stats.databaseStatus)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">支付网关</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stats.paymentGatewayStatus)}`}>
                  {getStatusText(stats.paymentGatewayStatus)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">邮件服务</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stats.emailServiceStatus)}`}>
                  {getStatusText(stats.emailServiceStatus)}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">今日数据概览</h3>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">新注册用户</span>
                <span className="font-medium text-blue-600">+{stats.newUsersToday}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">搜索次数</span>
                <span className="font-medium text-purple-600">{stats.todaySearches.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">今日收入</span>
                <span className="font-medium text-green-600">¥{stats.todayRevenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">活跃用户</span>
                <span className="font-medium text-orange-600">{stats.activeUsers.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button 
            onClick={() => window.location.href = '/admin/users'}
            className="card text-center hover:shadow-lg transition-shadow"
          >
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">用户管理</h3>
            <p className="text-sm text-gray-600">查看用户详情</p>
          </button>
          
          <button 
            onClick={() => window.location.href = '/admin/tickets'}
            className="card text-center hover:shadow-lg transition-shadow relative"
          >
            <Database className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">工单管理</h3>
            <p className="text-sm text-gray-600">处理用户工单</p>
            {/* 待处理工单数量角标 */}
            <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
              2
            </span>
          </button>
          
          <button 
            onClick={() => window.location.href = '/admin/site-config'}
            className="card text-center hover:shadow-lg transition-shadow"
          >
            <Server className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">网站配置</h3>
            <p className="text-sm text-gray-600">Logo/名称/联系方式</p>
          </button>

          <button 
            onClick={() => window.location.href = '/admin/recharge-config'}
            className="card text-center hover:shadow-lg transition-shadow"
          >
            <CreditCard className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">充值系统配置</h3>
            <p className="text-sm text-gray-600">积分/VIP/支付配置</p>
          </button>

          <button 
            onClick={() => window.location.href = '/admin/recharge-cards'}
            className="card text-center hover:shadow-lg transition-shadow"
          >
            <CreditCard className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">卡密管理</h3>
            <p className="text-sm text-gray-600">生成和管理充值卡密</p>
          </button>
          
          <button 
            onClick={() => window.location.href = '/admin/withdraw'}
            className="card text-center hover:shadow-lg transition-shadow relative"
          >
            <CreditCard className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">提现管理</h3>
            <p className="text-sm text-gray-600">处理提现申请</p>
            {stats.pendingWithdrawals > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                {stats.pendingWithdrawals}
              </span>
            )}
          </button>
        </div>

        {/* More Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button 
            onClick={() => window.location.href = '/admin/content'}
            className="card text-center hover:shadow-lg transition-shadow"
          >
            <Database className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">内容管理</h3>
            <p className="text-sm text-gray-600">管理数据库/FAQ/话题</p>
          </button>
          
          <button 
            onClick={() => window.location.href = '/admin/settings'}
            className="card text-center hover:shadow-lg transition-shadow"
          >
            <Server className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">系统设置</h3>
            <p className="text-sm text-gray-600">积分/佣金/邮件配置</p>
          </button>
          
          <button 
            onClick={() => window.location.href = '/admin/notifications'}
            className="card text-center hover:shadow-lg transition-shadow"
          >
            <Activity className="h-8 w-8 text-pink-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">通知管理</h3>
            <p className="text-sm text-gray-600">推送优惠通知</p>
          </button>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              最近活动
            </h3>
            <div className="space-y-3">
              {[
                { type: 'user', message: '新用户注册: user123@example.com', time: '5分钟前' },
                { type: 'search', message: '用户完成搜索: 手机号查询', time: '10分钟前' },
                { type: 'payment', message: '用户充值: ¥100', time: '15分钟前' },
                { type: 'withdraw', message: '提现申请: ¥50', time: '30分钟前' },
                { type: 'system', message: '系统备份完成', time: '1小时前' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      activity.type === 'user' ? 'bg-blue-500' :
                      activity.type === 'search' ? 'bg-purple-500' :
                      activity.type === 'payment' ? 'bg-green-500' :
                      activity.type === 'withdraw' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`} />
                    <span className="text-sm text-gray-900">{activity.message}</span>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              系统性能监控
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">CPU 使用率</span>
                  <span className={`font-medium ${stats.cpuUsage > 80 ? 'text-red-600' : stats.cpuUsage > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {stats.cpuUsage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${stats.cpuUsage > 80 ? 'bg-red-600' : stats.cpuUsage > 60 ? 'bg-yellow-600' : 'bg-blue-600'}`}
                    style={{ width: `${stats.cpuUsage}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">内存使用率</span>
                  <span className={`font-medium ${stats.memoryUsage > 80 ? 'text-red-600' : stats.memoryUsage > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {stats.memoryUsage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${stats.memoryUsage > 80 ? 'bg-red-600' : stats.memoryUsage > 60 ? 'bg-yellow-600' : 'bg-green-600'}`}
                    style={{ width: `${stats.memoryUsage}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">磁盘使用率</span>
                  <span className={`font-medium ${stats.diskUsage > 80 ? 'text-red-600' : stats.diskUsage > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {stats.diskUsage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${stats.diskUsage > 80 ? 'bg-red-600' : stats.diskUsage > 60 ? 'bg-yellow-600' : 'bg-yellow-600'}`}
                    style={{ width: `${stats.diskUsage}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">网络流量</span>
                  <span className="font-medium text-gray-900">{stats.networkTraffic} MB/s</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '35%' }}></div>
                </div>
              </div>

              <div className="pt-3 border-t">
                <div className="text-xs text-gray-500">
                  最后更新: {new Date().toLocaleTimeString('zh-CN')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};