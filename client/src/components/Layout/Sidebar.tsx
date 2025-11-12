import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Home, Database, User, BarChart3, Users, CreditCard, MessageSquare, Wallet, ShoppingBag, Receipt, Gift } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigation = [
    { name: '概览', href: '/dashboard', icon: Home },
    { name: '商城', href: '/shop', icon: ShoppingBag },
    { name: '订单中心', href: '/dashboard/orders', icon: Receipt },
    { name: '搜索历史', href: '/dashboard/history', icon: Database },
    { name: '充值中心', href: '/dashboard/recharge-center', icon: Wallet },
    { name: '推荐奖励', href: '/dashboard/referral', icon: Users },
    { name: '佣金管理', href: '/dashboard/commission', icon: CreditCard },
    { name: '积分中心', href: '/dashboard/points', icon: BarChart3 },
    { name: '在线工单', href: '/dashboard/tickets', icon: MessageSquare },
    { name: '抽奖中心', href: '/dashboard/lottery', icon: Gift },
    { name: '个人资料', href: '/dashboard/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:ml-4 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            用户中心
          </h2>
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
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