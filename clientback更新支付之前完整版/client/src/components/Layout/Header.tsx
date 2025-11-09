import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, Globe, Settings } from 'lucide-react';
import { isAuthenticated, logout, getUser } from '../../utils/auth';
import { t, setLanguage, getLanguage } from '../../utils/i18n';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const navigate = useNavigate();
  const user = getUser();
  const [currentLang, setCurrentLang] = useState(getLanguage());
  const [siteName, setSiteName] = useState('InfoSearch');
  const [logoUrl, setLogoUrl] = useState('');

  const handleLogout = () => {
    logout();
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
            {isAuthenticated() && isAdmin && (
              <Link
                to="/admin"
                className="text-orange-500 hover:text-orange-700 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <Settings className="h-4 w-4 mr-1" />
                管理后台
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
              <span className="ml-1 text-sm">{currentLang.toUpperCase()}</span>
            </button>

            {isAuthenticated() ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700">{user?.username}</span>
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