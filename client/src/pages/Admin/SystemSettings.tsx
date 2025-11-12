import React, { useState, useEffect } from 'react';
import { Tag, Coins, FileText, Globe } from 'lucide-react';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { SearchTypeConfig } from './SearchTypeConfig';
import { PointsConfig } from './PointsConfig';
import { PointsDescriptionConfig } from './PointsDescriptionConfig';
import { TimezoneConfig } from './TimezoneConfig';
import { getToken } from '../../utils/auth';

type SettingTab = 'searchTypes' | 'points' | 'pointsDescription' | 'timezone';

export const SystemSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<SettingTab>('searchTypes');
    const [searchTypes, setSearchTypes] = useState<any[]>([]);
    const [pointsConfig, setPointsConfig] = useState<any>({});

    useEffect(() => {
        loadSettings();
    }, []);

    const saveSettings = async (type: string, config: any) => {
        try {
            const token = getToken();
            if (!token) {
                console.error('未找到认证 token');
                return false;
            }
            
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
            const token = getToken();
            if (!token) {
                console.error('未找到认证 token');
                return;
            }
            
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
                    minWithdrawAmountBalance: 1,
                    minWithdrawAmount: 10,
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
        <AdminLayout>
            <div>
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
                        onClick={() => setActiveTab('points')}
                        className={`flex items-center px-4 py-2 border-b-2 transition-colors ${activeTab === 'points'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Coins className="h-5 w-5 mr-2" />
                        积分配置
                    </button>
                    <button
                        onClick={() => setActiveTab('pointsDescription')}
                        className={`flex items-center px-4 py-2 border-b-2 transition-colors ${activeTab === 'pointsDescription'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <FileText className="h-5 w-5 mr-2" />
                        积分说明
                    </button>
                    <button
                        onClick={() => setActiveTab('timezone')}
                        className={`flex items-center px-4 py-2 border-b-2 transition-colors ${activeTab === 'timezone'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Globe className="h-5 w-5 mr-2" />
                        时区配置
                    </button>
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'searchTypes' && (
                        <SearchTypeConfig
                            searchTypes={searchTypes}
                            onUpdateSearchTypes={setSearchTypes}
                        />
                    )}
                    {activeTab === 'points' && (
                        <PointsConfig
                            pointsConfig={pointsConfig}
                            onUpdatePointsConfig={setPointsConfig}
                            onSave={async (points) => {
                                const success = await saveSettings('points', points);
                                if (success) {
                                    await loadSettings(); // 重新加载配置
                                }
                                return success;
                            }}
                        />
                    )}
                    {activeTab === 'pointsDescription' && (
                        <PointsDescriptionConfig />
                    )}
                    {activeTab === 'timezone' && (
                        <TimezoneConfig
                            onSave={async (timezone) => {
                                try {
                                    const token = getToken();
                                    if (!token) {
                                        console.error('未找到认证 token');
                                        return false;
                                    }
                                    const response = await fetch('/api/system-config/timezone', {
                                        method: 'PUT',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${token}`
                                        },
                                        body: JSON.stringify(timezone)
                                    });

                                    const data = await response.json();

                                    if (data.success) {
                                        console.log('时区配置已保存');
                                        return true;
                                    } else {
                                        console.error('保存失败:', data.message);
                                        return false;
                                    }
                                } catch (error) {
                                    console.error('保存配置失败:', error);
                                    return false;
                                }
                            }}
                        />
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};
