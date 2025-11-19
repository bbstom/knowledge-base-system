import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Home, Search, Database, HelpCircle, TrendingUp, LayoutDashboard } from 'lucide-react';
import { isAuthenticated } from '../../utils/auth';
import { t } from '../../utils/i18n';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigation = [
    { name: t('nav.home'), href: '/', icon: Home },
    { name: t('nav.search'), href: '/search', icon: Search },
    { name: t('nav.databases'), href: '/databases', icon: Database },
    { name: t('nav.faq'), href: '/faq', icon: HelpCircle },
    { name: t('nav.hotTopics'), href: '/hot-topics', icon: TrendingUp },
  ];

  // 如果已登录，添加用户中心
  if (isAuthenticated()) {
    navigation.push({ name: t('nav.dashboard'), href: '/dashboard', icon: LayoutDashboard });
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[100] md:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Menu */}
      <div className={`fixed inset-y-0 left-0 z-[110] w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            菜单
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-4 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-500"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};
