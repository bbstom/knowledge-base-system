import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { Save, Coins, Crown, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

interface RechargePackage {
    id: string;
    points: number;
    amount: number;
    originalAmount?: number;
    enabled: boolean;
}

interface VipPackage {
    id: string;
    name: string;
    days: number;
    amount: number;
    originalAmount?: number;
    features: string[];
    enabled: boolean;
}

interface RechargeConfig {
    bepusdt: {
        url: string;
        apiKey: string;
        merchantId: string;
        supportedCurrencies: string[];
    };
    pointsPackages: RechargePackage[];
    vipPackages: VipPackage[];
}

export const RechargeConfig: React.FC = () => {
    const [config, setConfig] = useState<RechargeConfig>({
        bepusdt: {
            url: '',
            apiKey: '',
            merchantId: '',
            supportedCurrencies: ['USDT', 'TRX']
        },
        pointsPackages: [
            { id: '1', points: 100, amount: 1.5, originalAmount: 2, enabled: true },
            { id: '2', points: 500, amount: 7, originalAmount: 9, enabled: true },
            { id: '3', points: 1000, amount: 14, originalAmount: 17, enabled: true },
            { id: '4', points: 2000, amount: 28, originalAmount: 35, enabled: true },
            { id: '5', points: 5000, amount: 70, originalAmount: 90, enabled: true },
            { id: '6', points: 10000, amount: 140, originalAmount: 180, enabled: true }
        ],
        vipPackages: [
            { 
                id: '1', 
                name: '月度VIP', 
                days: 30, 
                amount: 4.5,
                originalAmount: 6,
                features: ['无限搜索次数', '专属客服', '优先数据更新', '去除广告'],
                enabled: true 
            },
            { 
                id: '2', 
                name: '季度VIP', 
                days: 90, 
                amount: 12,
                originalAmount: 17,
                features: ['无限搜索次数', '专属客服', '优先数据更新', '去除广告', '赠送500积分'],
                enabled: true 
            },
            { 
                id: '3', 
                name: '年度VIP', 
                days: 365, 
                amount: 42,
                originalAmount: 68,
                features: ['无限搜索次数', '专属客服', '优先数据更新', '去除广告', '赠送2000积分', 'VIP专属标识'],
                enabled: true 
            }
        ]
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            // 从API加载配置
            const response = await fetch('/api/site-config/admin', {
                headers: {
                    'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
                }
            });

            const data = await response.json();

            if (data.success && data.data) {
                const siteConfig = data.data;
                
                // 转换为RechargeConfig格式
                const rechargeConfig = {
                    bepusdt: {
                        url: siteConfig.recharge?.bepusdtUrl || '',
                        apiKey: siteConfig.recharge?.bepusdtApiKey || '',
                        merchantId: siteConfig.recharge?.bepusdtMerchantId || '',
                        supportedCurrencies: siteConfig.recharge?.supportedCurrencies || ['USDT', 'TRX']
                    },
                    pointsPackages: siteConfig.recharge?.packages || config.pointsPackages,
                    vipPackages: siteConfig.vip?.packages || config.vipPackages
                };

                setConfig(rechargeConfig);
                // 同时保存到localStorage作为缓存
                localStorage.setItem('rechargeConfig', JSON.stringify(rechargeConfig));
            } else {
                // 如果API失败，尝试从localStorage加载
                const savedConfig = localStorage.getItem('rechargeConfig');
                if (savedConfig) {
                    setConfig(JSON.parse(savedConfig));
                }
            }
        } catch (error) {
            console.error('Failed to load config:', error);
            // 如果API失败，尝试从localStorage加载
            try {
                const savedConfig = localStorage.getItem('rechargeConfig');
                if (savedConfig) {
                    setConfig(JSON.parse(savedConfig));
                }
            } catch (e) {
                console.error('Failed to load from localStorage:', e);
            }
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // 从API加载当前完整配置
            const response = await fetch('/api/site-config/admin', {
                headers: {
                    'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
                }
            });

            const data = await response.json();
            
            if (!data.success) {
                throw new Error('无法加载当前配置');
            }

            const siteConfig = data.data;

            // 更新充值和VIP配置
            siteConfig.recharge = {
                bepusdtUrl: config.bepusdt.url,
                bepusdtApiKey: config.bepusdt.apiKey,
                bepusdtMerchantId: config.bepusdt.merchantId,
                supportedCurrencies: config.bepusdt.supportedCurrencies,
                packages: config.pointsPackages
            };
            siteConfig.vip = {
                packages: config.vipPackages
            };

            // 保存到数据库
            const saveResponse = await fetch('/api/site-config', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
                },
                body: JSON.stringify(siteConfig)
            });

            const saveData = await saveResponse.json();

            if (saveData.success) {
                // 同时保存到localStorage作为缓存
                localStorage.setItem('rechargeConfig', JSON.stringify(config));
                localStorage.setItem('siteConfig', JSON.stringify(siteConfig));

                window.dispatchEvent(new CustomEvent('rechargeConfigUpdated', { detail: config }));
                toast.success('配置已保存到数据库');
            } else {
                throw new Error(saveData.message || '保存失败');
            }
        } catch (error: any) {
            console.error('保存配置失败:', error);
            toast.error(error.message || '保存失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div>
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">充值系统配置</h1>
                        <p className="text-gray-600 mt-1">管理充值套餐、VIP会员和支付配置</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="btn-primary flex items-center"
                    >
                        <Save className="h-5 w-5 mr-2" />
                        {loading ? '保存中...' : '保存配置'}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 主要配置区域 */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* BEpusdt支付配置 */}
                        <div className="card">
                            <div className="flex items-center mb-4">
                                <Settings className="h-6 w-6 text-blue-600 mr-2" />
                                <h2 className="text-lg font-semibold text-gray-900">BEpusdt支付配置</h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        服务地址 *
                                    </label>
                                    <input
                                        type="text"
                                        value={config.bepusdt.url}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            bepusdt: { ...config.bepusdt, url: e.target.value }
                                        })}
                                        className="input-field"
                                        placeholder="https://your-bepusdt-domain.com"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        BEpusdt支付网关的API地址
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        API密钥 *
                                    </label>
                                    <input
                                        type="password"
                                        value={config.bepusdt.apiKey}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            bepusdt: { ...config.bepusdt, apiKey: e.target.value }
                                        })}
                                        className="input-field"
                                        placeholder="your-api-key"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        从BEpusdt后台获取的API密钥
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        商户ID *
                                    </label>
                                    <input
                                        type="text"
                                        value={config.bepusdt.merchantId}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            bepusdt: { ...config.bepusdt, merchantId: e.target.value }
                                        })}
                                        className="input-field"
                                        placeholder="your-merchant-id"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        支持的币种
                                    </label>
                                    <div className="space-y-2">
                                        {['USDT', 'TRX'].map((currency) => (
                                            <label key={currency} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={config.bepusdt.supportedCurrencies.includes(currency)}
                                                    onChange={(e) => {
                                                        const currencies = e.target.checked
                                                            ? [...config.bepusdt.supportedCurrencies, currency]
                                                            : config.bepusdt.supportedCurrencies.filter(c => c !== currency);
                                                        setConfig({
                                                            ...config,
                                                            bepusdt: { ...config.bepusdt, supportedCurrencies: currencies }
                                                        });
                                                    }}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">{currency} (TRC20)</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 积分充值套餐 */}
                        <div className="card">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <Coins className="h-6 w-6 text-blue-600 mr-2" />
                                    <h2 className="text-lg font-semibold text-gray-900">积分充值套餐</h2>
                                </div>
                                <button
                                    onClick={() => {
                                        const newPackage: RechargePackage = {
                                            id: Date.now().toString(),
                                            points: 0,
                                            amount: 0,
                                            originalAmount: 0,
                                            enabled: true
                                        };
                                        setConfig({
                                            ...config,
                                            pointsPackages: [...config.pointsPackages, newPackage]
                                        });
                                    }}
                                    className="btn-secondary text-sm"
                                >
                                    + 添加套餐
                                </button>
                            </div>

                            <div className="space-y-3">
                                {config.pointsPackages.map((pkg, index) => (
                                    <div key={pkg.id} className="border rounded-lg p-4 bg-blue-50">
                                        <div className="grid grid-cols-12 gap-3 items-center">
                                            <div className="col-span-3">
                                                <label className="block text-xs text-gray-600 mb-1">积分数量</label>
                                                <input
                                                    type="number"
                                                    value={pkg.points}
                                                    onChange={(e) => {
                                                        const packages = [...config.pointsPackages];
                                                        packages[index].points = parseInt(e.target.value) || 0;
                                                        setConfig({ ...config, pointsPackages: packages });
                                                    }}
                                                    className="input-field text-sm"
                                                    placeholder="100"
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <label className="block text-xs text-gray-600 mb-1">原价（USD）</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={pkg.originalAmount || ''}
                                                    onChange={(e) => {
                                                        const packages = [...config.pointsPackages];
                                                        packages[index].originalAmount = parseFloat(e.target.value) || undefined;
                                                        setConfig({ ...config, pointsPackages: packages });
                                                    }}
                                                    className="input-field text-sm"
                                                    placeholder="2.00"
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <label className="block text-xs text-gray-600 mb-1">现价（USD）*</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={pkg.amount}
                                                    onChange={(e) => {
                                                        const packages = [...config.pointsPackages];
                                                        packages[index].amount = parseFloat(e.target.value) || 0;
                                                        setConfig({ ...config, pointsPackages: packages });
                                                    }}
                                                    className="input-field text-sm"
                                                    placeholder="1.50"
                                                />
                                            </div>
                                            <div className="col-span-2 flex items-center justify-center">
                                                <label className="flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={pkg.enabled}
                                                        onChange={(e) => {
                                                            const packages = [...config.pointsPackages];
                                                            packages[index].enabled = e.target.checked;
                                                            setConfig({ ...config, pointsPackages: packages });
                                                        }}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="ml-2 text-xs text-gray-600">启用</span>
                                                </label>
                                            </div>
                                            <div className="col-span-1 flex justify-end">
                                                <button
                                                    onClick={() => {
                                                        const packages = config.pointsPackages.filter((_, i) => i !== index);
                                                        setConfig({ ...config, pointsPackages: packages });
                                                    }}
                                                    className="text-red-600 hover:text-red-700 text-sm"
                                                >
                                                    删除
                                                </button>
                                            </div>
                                        </div>
                                        {pkg.originalAmount && pkg.originalAmount > pkg.amount && (
                                            <div className="mt-2 text-xs text-green-600">
                                                💰 优惠 ${(pkg.originalAmount - pkg.amount).toFixed(2)} 
                                                （{(((pkg.originalAmount - pkg.amount) / pkg.originalAmount) * 100).toFixed(0)}% OFF）
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {config.pointsPackages.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <p className="text-sm">暂无积分套餐</p>
                                        <p className="text-xs mt-1">点击"添加套餐"创建新的充值选项</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* VIP会员套餐 */}
                        <div className="card">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <Crown className="h-6 w-6 text-yellow-600 mr-2" />
                                    <h2 className="text-lg font-semibold text-gray-900">VIP会员套餐</h2>
                                </div>
                                <button
                                    onClick={() => {
                                        const newPackage: VipPackage = {
                                            id: Date.now().toString(),
                                            name: '',
                                            days: 30,
                                            amount: 0,
                                            originalAmount: 0,
                                            features: [],
                                            enabled: true
                                        };
                                        setConfig({
                                            ...config,
                                            vipPackages: [...config.vipPackages, newPackage]
                                        });
                                    }}
                                    className="btn-secondary text-sm"
                                >
                                    + 添加VIP套餐
                                </button>
                            </div>

                            <div className="space-y-4">
                                {config.vipPackages.map((pkg, index) => (
                                    <div key={pkg.id} className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-orange-50">
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-12 gap-3">
                                                <div className="col-span-4">
                                                    <label className="block text-xs text-gray-600 mb-1">套餐名称</label>
                                                    <input
                                                        type="text"
                                                        value={pkg.name}
                                                        onChange={(e) => {
                                                            const packages = [...config.vipPackages];
                                                            packages[index].name = e.target.value;
                                                            setConfig({ ...config, vipPackages: packages });
                                                        }}
                                                        className="input-field text-sm"
                                                        placeholder="月度VIP"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-xs text-gray-600 mb-1">有效天数</label>
                                                    <input
                                                        type="number"
                                                        value={pkg.days}
                                                        onChange={(e) => {
                                                            const packages = [...config.vipPackages];
                                                            packages[index].days = parseInt(e.target.value) || 0;
                                                            setConfig({ ...config, vipPackages: packages });
                                                        }}
                                                        className="input-field text-sm"
                                                        placeholder="30"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-xs text-gray-600 mb-1">原价（USD）</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={pkg.originalAmount || ''}
                                                        onChange={(e) => {
                                                            const packages = [...config.vipPackages];
                                                            packages[index].originalAmount = parseFloat(e.target.value) || undefined;
                                                            setConfig({ ...config, vipPackages: packages });
                                                        }}
                                                        className="input-field text-sm"
                                                        placeholder="6.00"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-xs text-gray-600 mb-1">现价（USD）*</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={pkg.amount}
                                                        onChange={(e) => {
                                                            const packages = [...config.vipPackages];
                                                            packages[index].amount = parseFloat(e.target.value) || 0;
                                                            setConfig({ ...config, vipPackages: packages });
                                                        }}
                                                        className="input-field text-sm"
                                                        placeholder="4.50"
                                                    />
                                                </div>
                                                <div className="col-span-2 flex items-end justify-between">
                                                    <label className="flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={pkg.enabled}
                                                            onChange={(e) => {
                                                                const packages = [...config.vipPackages];
                                                                packages[index].enabled = e.target.checked;
                                                                setConfig({ ...config, vipPackages: packages });
                                                            }}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="ml-2 text-xs text-gray-600">启用</span>
                                                    </label>
                                                    <button
                                                        onClick={() => {
                                                            const packages = config.vipPackages.filter((_, i) => i !== index);
                                                            setConfig({ ...config, vipPackages: packages });
                                                        }}
                                                        className="text-red-600 hover:text-red-700 text-sm"
                                                    >
                                                        删除
                                                    </button>
                                                </div>
                                            </div>
                                            {pkg.originalAmount && pkg.originalAmount > pkg.amount && (
                                                <div className="text-xs text-green-600">
                                                    💰 优惠 ${(pkg.originalAmount - pkg.amount).toFixed(2)} 
                                                    （{(((pkg.originalAmount - pkg.amount) / pkg.originalAmount) * 100).toFixed(0)}% OFF）
                                                </div>
                                            )}
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-2">
                                                    VIP特权（每行一个特权，按Enter换行）
                                                </label>
                                                <textarea
                                                    value={pkg.features.join('\n')}
                                                    onChange={(e) => {
                                                        const packages = [...config.vipPackages];
                                                        packages[index].features = e.target.value.split('\n').filter(f => f.trim());
                                                        setConfig({ ...config, vipPackages: packages });
                                                    }}
                                                    className="input-field text-sm font-mono"
                                                    rows={5}
                                                    placeholder={'无限搜索次数\n专属客服\n优先数据更新\n去除广告'}
                                                    style={{ resize: 'vertical', minHeight: '100px' }}
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    💡 提示：每行输入一个特权，按Enter键换行
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {config.vipPackages.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <p className="text-sm">暂无VIP套餐</p>
                                        <p className="text-xs mt-1">点击"添加VIP套餐"创建新的会员选项</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 预览区域 */}
                    <div className="lg:col-span-1">
                        <div className="card sticky top-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">配置预览</h2>

                            {/* 积分套餐预览 */}
                            <div className="mb-6">
                                <p className="text-sm font-medium text-gray-700 mb-2">积分套餐示例：</p>
                                {config.pointsPackages.filter(p => p.enabled).slice(0, 2).map(pkg => (
                                    <div key={pkg.id} className="border rounded-lg p-3 mb-2 bg-blue-50">
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-gray-900">{pkg.points} 积分</div>
                                            <div className="flex items-center justify-center space-x-2 mt-1">
                                                {pkg.originalAmount && pkg.originalAmount > pkg.amount && (
                                                    <span className="text-xs text-gray-500 line-through">${pkg.originalAmount.toFixed(2)}</span>
                                                )}
                                                <span className="text-xl font-bold text-blue-600">${pkg.amount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* VIP套餐预览 */}
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">VIP套餐示例：</p>
                                {config.vipPackages.filter(p => p.enabled).slice(0, 1).map(pkg => (
                                    <div key={pkg.id} className="border rounded-lg p-3 bg-gradient-to-br from-yellow-50 to-orange-50">
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-gray-900">{pkg.name}</div>
                                            <div className="text-xs text-gray-600 mb-2">{pkg.days} 天</div>
                                            <div className="flex items-center justify-center space-x-2">
                                                {pkg.originalAmount && pkg.originalAmount > pkg.amount && (
                                                    <span className="text-xs text-gray-500 line-through">${pkg.originalAmount.toFixed(2)}</span>
                                                )}
                                                <span className="text-xl font-bold text-yellow-600">${pkg.amount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 统计信息 */}
                            <div className="mt-6 pt-6 border-t">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">积分套餐：</span>
                                        <span className="font-medium">{config.pointsPackages.filter(p => p.enabled).length} 个</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">VIP套餐：</span>
                                        <span className="font-medium">{config.vipPackages.filter(p => p.enabled).length} 个</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">支付币种：</span>
                                        <span className="font-medium">{config.bepusdt.supportedCurrencies.length} 种</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};
