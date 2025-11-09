import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Database,
    Settings,
    CreditCard,
    MessageSquare,
    Bell,
    Mail,
    FileText,
    DollarSign,
    Menu,
    X,
    LogOut,
    Shield
} from 'lucide-react';
import { Container } from '../Container';
import { MenuItemWithSubmenu } from '../Admin/MenuItemWithSubmenu';
import { logout } from '../../utils/auth';
import toast from 'react-hot-toast';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

    const handleLogout = () => {
        logout();
        toast.success('已退出登录');
        navigate('/login');
    };

    const menuItems = [
        {
            title: '仪表盘',
            icon: LayoutDashboard,
            path: '/admin',
            exact: true
        },
        {
            title: '用户管理',
            icon: Users,
            path: '/admin/users'
        },
        {
            title: '内容管理',
            icon: Database,
            path: '/admin/content'
        },
        {
            title: '财务报告',
            icon: DollarSign,
            path: '/admin/financial-report'
        },
        {
            title: '提现管理',
            icon: DollarSign,
            path: '/admin/withdraw'
        },
        {
            title: '工单管理',
            icon: MessageSquare,
            path: '/admin/tickets'
        },
        {
            title: '通知管理',
            icon: Bell,
            path: '/admin/notifications'
        },
        {
            title: '充值卡管理',
            icon: CreditCard,
            path: '/admin/recharge-cards'
        },
        {
            title: '网站配置',
            icon: FileText,
            path: '/admin/site-config'
        },
        {
            title: '充值配置',
            icon: Settings,
            path: '/admin/recharge-config'
        },
        {
            title: '卡密配置',
            icon: Settings,
            path: '/admin/recharge-card-config'
        },
        {
            title: '系统设置',
            icon: Settings,
            path: '/admin/settings'
        },
        {
            title: '邮件管理',
            icon: Mail,
            submenu: [
                {
                    title: 'SMTP配置',
                    path: '/admin/email-config'
                },
                {
                    title: '邮件模板',
                    path: '/admin/email-templates'
                }
            ]
        },
        {
            title: '系统管理',
            icon: Settings,
            submenu: [
                {
                    title: '版本管理',
                    path: '/admin/version'
                },
                {
                    title: '备份管理',
                    path: '/admin/backup'
                },
                {
                    title: '升级管理',
                    path: '/admin/upgrade'
                }
            ]
        }
    ];

    const isActive = (path: string, exact = false) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 顶部导航栏 - 深色主题 */}
            <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
                <Container size="xl" className="py-3">
                    <div className="flex items-center justify-between">
                        {/* Logo和标题 */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>

                            <Link to="/admin" className="flex items-center gap-2">
                                <Shield className="h-7 w-7 text-blue-400" />
                                <div>
                                    <h1 className="text-lg font-bold text-white">管理后台</h1>
                                    <p className="text-xs text-slate-400">Admin Dashboard</p>
                                </div>
                            </Link>
                        </div>

                        {/* 右侧操作 */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-400 hidden sm:inline">管理员</span>
                            
                            <Link
                                to="/dashboard"
                                className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                用户中心
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">退出</span>
                            </button>
                        </div>
                    </div>
                </Container>
            </nav>

            <Container size="xl" noPadding>
                <div className="flex">
                    {/* 侧边栏 */}
                    <aside
                        className={`
              fixed lg:sticky top-[57px] left-0 h-[calc(100vh-57px)] w-64 
              bg-white border-r border-gray-200 overflow-y-auto
              transition-transform duration-300 z-40
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}
                    >
                        <nav className="p-4 space-y-1">
                            {menuItems.map((item) => {
                                // 如果有子菜单，使用MenuItemWithSubmenu组件
                                if (item.submenu) {
                                    return (
                                        <MenuItemWithSubmenu
                                            key={item.title}
                                            item={item}
                                            isExpanded={expandedMenus.includes(item.title)}
                                            onToggle={() => {
                                                setExpandedMenus(prev =>
                                                    prev.includes(item.title)
                                                        ? prev.filter(t => t !== item.title)
                                                        : [...prev, item.title]
                                                );
                                            }}
                                            currentPath={location.pathname}
                                            onNavigate={() => setSidebarOpen(false)}
                                        />
                                    );
                                }

                                // 普通菜单项
                                const Icon = item.icon;
                                const active = item.path ? isActive(item.path, item.exact) : false;

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path!}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                      transition-colors
                      ${active
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                                            }
                    `}
                                    >
                                        <Icon className="h-5 w-5 flex-shrink-0" />
                                        <span>{item.title}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* 遮罩层 - 移动端 */}
                    {sidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}

                    {/* 主内容区 */}
                    <main className="flex-1 min-w-0">
                        <div className="p-4 sm:p-6 lg:p-8">
                            {children}
                        </div>
                    </main>
                </div>
            </Container>
        </div>
    );
};
