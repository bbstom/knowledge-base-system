import React, { useState, useEffect } from 'react';
import { Database, Mail, Tag, Coins } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { DatabaseConfig } from './DatabaseConfig';
import { SearchTypeConfig } from './SearchTypeConfig';
import { EmailConfig } from './EmailConfig';
import { PointsConfig } from './PointsConfig';

type SettingTab = 'searchTypes' | 'database' | 'email' | 'points';

export const SystemSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<SettingTab>('searchTypes');
    const [searchTypes, setSearchTypes] = useState<any[]>([]);
    const [userDatabase, setUserDatabase] = useState<any>({});
    const [queryDatabases, setQueryDatabases] = useState<any[]>([]);
    const [emailConfig, setEmailConfig] = useState<any>({});
    const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
    const [pointsConfig, setPointsConfig] = useState<any>({});

    useEffect(() => {
        loadSettings();
    }, []);

    const saveSettings = async (type: string, config: any) => {
        try {
            const token = document.cookie.split('token=')[1]?.split(';')[0];
            
            const response = await fetch(`/api/system-config/${type}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ [type]: config })
            });

            const data = await response.json();

            if (data.success) {
                console.log('配置已保存到数据库');
                return true;
            } else {
                console.error('保存失败:', data.message);
                return false;
            }
        } catch (error) {
            console.error('保存配置失败:', error);
            return false;
        }
    };

    const loadSettings = async () => {
        try {
            const token = document.cookie.split('token=')[1]?.split(';')[0];
            
            const response = await fetch('/api/system-config', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success && data.data) {
                const config = data.data;
                
                // 设置搜索类型
                setSearchTypes(config.searchTypes || [
                    { id: 'idcard', label: '身份证', enabled: true, order: 1 },
                    { id: 'phone', label: '手机号', enabled: true, order: 2 },
                    { id: 'name', label: '姓名', enabled: true, order: 3 },
                    { id: 'qq', label: 'QQ号', enabled: true, order: 4 },
                    { id: 'weibo', label: '微博号', enabled: true, order: 5 },
                    { id: 'wechat', label: '微信号', enabled: true, order: 6 },
                    { id: 'email', label: '邮箱', enabled: true, order: 7 }
                ]);

                // 设置数据库配置
                setUserDatabase(config.databases?.user || {
                    name: '用户数据库',
                    type: 'mysql',
                    host: 'localhost',
                    port: 3306,
                    username: 'root',
                    password: '******',
                    database: 'infosearch_users',
                    connectionPool: 10,
                    timeout: 30000
                });

                setQueryDatabases(config.databases?.query || []);

                // 设置邮件配置
                setEmailConfig(config.email || {
                    smtpHost: 'smtp.gmail.com',
                    smtpPort: 587,
                    smtpSecure: true,
                    smtpUser: 'noreply@infosearch.com',
                    smtpPassword: '******',
                    fromName: 'InfoSearch',
                    fromEmail: 'noreply@infosearch.com'
                });

                setEmailTemplates(config.email?.templates || []);

                // 设置积分配置
                setPointsConfig(config.points || {
                    searchCost: 10,
                    enableSearchCost: true,
                    exchangeRate: 10,
                    dailyCheckIn: 10,
                    consecutiveBonus: { day7: 50, day30: 200 },
                    enableDailyCheckIn: true,
                    referralReward: 100,
                    referredUserReward: 50,
                    enableReferralReward: true,
                    registerReward: 100,
                    enableRegisterReward: true,
                    commissionRate: 15,
                    commissionSettlement: 'instant',
                    minWithdrawAmount: 50,
                    withdrawFee: 5,
                    usdtRate: 0.14,
                    withdrawApproval: 'manual',
                    autoApprovalLimit: 100,
                    commissionLevels: 1,
                    secondLevelCommissionRate: 5,
                    thirdLevelCommissionRate: 2,
                    enableCommission: true,
                    pointsExpireDays: 0,
                    maxPoints: 0
                });
            }
        } catch (error) {
            console.error('加载系统配置失败:', error);
        }
    };

    return (
        <Layout>
            <div className="p-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">系统设置</h1>
                    <p className="text-gray-600">配置系统参数和功能选项</p>
                </div>

                {/* Tabs */}
                <div className="flex space-x-4 mb-6 border-b">
                    <button
                        onClick={() => setActiveTab('searchTypes')}
                        className={`flex items-center px-4 py-2 border-b-2 transition-colors ${activeTab === 'searchTypes'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Tag className="h-5 w-5 mr-2" />
                        搜索类型
                    </button>
                    <button
                        onClick={() => setActiveTab('database')}
                        className={`flex items-center px-4 py-2 border-b-2 transition-colors ${activeTab === 'database'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Database className="h-5 w-5 mr-2" />
                        数据库配置
                    </button>
                    <button
                        onClick={() => setActiveTab('email')}
                        className={`flex items-center px-4 py-2 border-b-2 transition-colors ${activeTab === 'email'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Mail className="h-5 w-5 mr-2" />
                        邮件配置
                    </button>
                    <button
                        onClick={() => setActiveTab('points')}
                        className={`flex items-center px-4 py-2 border-b-2 transition-colors ${activeTab === 'points'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Coins className="h-5 w-5 mr-2" />
                        积分配置
                    </button>
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'searchTypes' && (
                        <SearchTypeConfig
                            searchTypes={searchTypes}
                            onUpdateSearchTypes={setSearchTypes}
                            onSave={(types) => saveSettings('search-types', { searchTypes: types })}
                        />
                    )}
                    {activeTab === 'database' && (
                        <DatabaseConfig
                            userDatabase={userDatabase}
                            queryDatabases={queryDatabases}
                            onUpdateUserDatabase={setUserDatabase}
                            onUpdateQueryDatabases={setQueryDatabases}
                            onSave={(databases) => saveSettings('databases', { databases })}
                        />
                    )}
                    {activeTab === 'email' && (
                        <EmailConfig
                            emailConfig={emailConfig}
                            emailTemplates={emailTemplates}
                            onUpdateEmailConfig={setEmailConfig}
                            onUpdateEmailTemplates={setEmailTemplates}
                            onSave={(email) => saveSettings('email', { email })}
                        />
                    )}
                    {activeTab === 'points' && (
                        <PointsConfig
                            pointsConfig={pointsConfig}
                            onUpdatePointsConfig={setPointsConfig}
                            onSave={(points) => saveSettings('points', { points })}
                        />
                    )}
                </div>
            </div>
        </Layout>
    );
};
