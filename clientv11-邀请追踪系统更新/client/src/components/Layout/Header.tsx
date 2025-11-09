import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, Globe } from 'lucide-react';
import { isAuthenticated, logout } from '../../utils/auth';
import { t, setLanguage, getLanguage } from '../../utils/i18n';
import { useUser } from '../../hooks/useUser';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const navigate = useNavigate();
  const { user, logout: logoutUser } = useUser();
  const [currentLang, setCurrentLang] = useState(getLanguage());
  const [siteName, setSiteName] = useState('InfoSearch');
  const [logoUrl, setLogoUrl] = useState('');

  const handleLogout = () => {
    logout();
    logoutUser();
    navigate('/');
  };

  const toggleLanguage = () => {
    const newLang = currentLang === 'zh' ? 'en' : 'zh';
    setLanguage(newLang);
    setCurrentLang(newLang);
  };

  // 监听语言变更事件
  useEffect(() => {
    const handleLanguageChange = () => {
      setCurrentLang(getLanguage());
    };
    
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  // 加载网站配置
  useEffect(() => {
    const loadSiteConfig = () => {
      const savedConfig = localStorage.getItem('siteConfig');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setSiteName(config.siteName || 'InfoSearch');
        setLogoUrl(config.logoUrl || '');
      }
    };

    loadSiteConfig();

    // 监听配置更新
    const handleConfigUpdate = (e: any) => {
      setSiteName(e.detail.siteName || 'InfoSearch');
      setLogoUrl(e.detail.logoUrl || '');
    };
    window.addEventListener('siteConfigUpdated', handleConfigUpdate);
    return () => window.removeEventListener('siteConfigUpdated', handleConfigUpdate);
  }, []);

  // 检查是否是管理员（通过role字段）
  const isAdmin = user?.role === 'admin';

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={onMenuToggle}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/" className="flex items-center ml-2 md:ml-0">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-8 w-auto" />
              ) : (
                <div className="text-xl font-bold text-blue-600">
                  {siteName}
                </div>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/search"
              className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              {t('nav.search')}
            </Link>
            <Link
              to="/databases"
              className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              {t('nav.databases')}
            </Link>
            <Link
              to="/faq"
              className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              {t('nav.faq')}
            </Link>
            <Link
              to="/hot-topics"
              className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              {t('nav.hotTopics')}
            </Link>
            {isAuthenticated() && (
              <Link
                to="/dashboard"
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                {t('nav.dashboard')}
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 text-gray-400 hover:text-gray-500 rounded-md"
              title="Switch Language"
            >
              <Globe className="h-5 w-5" />
            </button>

            {isAuthenticated() ? (
              <div className="flex items-center space-x-3">
                {/* VIP图标 - 所有用户可见，点击跳转到VIP充值页面 */}
                {user && (
                  <Link 
                    to="/dashboard/recharge-center"
                    className="flex items-center"
                    title={user.isVip ? "VIP会员 - 点击充值" : "开通VIP - 点击充值"}
                  >
                    {user.isVip ? (
                      <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-md hover:shadow-lg transition-shadow">
                        VIP
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs font-bold rounded-full hover:bg-gray-300 transition-colors">
                        VIP
                      </span>
                    )}
                  </Link>
                )}
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-700">{user?.username || '加载中...'}</span>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 transition-colors"
                        title="管理后台"
                      >
                        管理
                      </Link>
                    )}
                  </div>
                  
                  {/* 积分和余额显示 */}
                  {user && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Link 
                        to="/dashboard/points" 
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
                        title="查看积分详情"
                      >
                        <span className="font-medium">积分:</span>
                        <span className="font-bold">{user.points?.toFixed(2) || '0.00'}</span>
                      </Link>
                      <Link 
                        to="/dashboard/recharge" 
                        className="flex items-center space-x-1 text-green-600 hover:text-green-700 transition-colors"
                        title="查看余额详情"
                      >
                        <span className="font-medium">余额:</span>
                        <span className="font-bold">¥{user.balance?.toFixed(2) || '0.00'}</span>
                      </Link>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-500 rounded-md"
                  title={t('common.logout')}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('common.login')}
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  {t('common.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};