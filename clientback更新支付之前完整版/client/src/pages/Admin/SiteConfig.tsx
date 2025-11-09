import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout/Layout';
import { Save, Upload, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface RechargePackage {
    id: string;
    points: number;
    amount: number;
    enabled: boolean;
}

interface VipPackage {
    id: string;
    name: string;
    days: number;
    amount: number;
    features: string[];
    enabled: boolean;
}

interface SiteConfig {
    siteName: string;
    siteDescription: string;
    logoUrl: string;
    faviconUrl: string;
    footerText: string;
    contactEmail: string;
    contactPhone: string;
    contactAddress: string;
    socialLinks: {
        wechat: string;
        qq: string;
        weibo: string;
        twitter: string;
    };
    recharge: {
        bepusdtUrl: string;
        bepusdtApiKey: string;
        bepusdtMerchantId: string;
        supportedCurrencies: string[];
        packages: RechargePackage[];
    };
    vip: {
        packages: VipPackage[];
    };
}

export const SiteConfig: React.FC = () => {
    const [config, setConfig] = useState<SiteConfig>({
        siteName: 'InfoSearch',
        siteDescription: '专业的信息搜索平台，提供安全、快速、准确的数据查询服务',
        logoUrl: '',
        faviconUrl: '',
        footerText: '© 2024 InfoSearch. All rights reserved.',
        contactEmail: 'support@infosearch.com',
        contactPhone: '400-123-4567',
        contactAddress: '中国 · 北京市朝阳区',
        socialLinks: {
            wechat: '',
            qq: '',
            weibo: '',
            twitter: ''
        },
        recharge: {
            bepusdtUrl: '',
            bepusdtApiKey: '',
            bepusdtMerchantId: '',
            supportedCurrencies: ['USDT', 'TRX'],
            packages: [
                { id: '1', points: 100, amount: 10, enabled: true },
                { id: '2', points: 500, amount: 50, enabled: true },
                { id: '3', points: 1000, amount: 100, enabled: true },
                { id: '4', points: 2000, amount: 200, enabled: true },
                { id: '5', points: 5000, amount: 500, enabled: true },
                { id: '6', points: 10000, amount: 1000, enabled: true }
            ]
        },
        vip: {
            packages: [
                {
                    id: '1',
                    name: '月度VIP',
                    days: 30,
                    amount: 30,
                    features: ['无限搜索次数', '专属客服', '优先数据更新', '去除广告'],
                    enabled: true
                },
                {
                    id: '2',
                    name: '季度VIP',
                    days: 90,
                    amount: 80,
                    features: ['无限搜索次数', '专属客服', '优先数据更新', '去除广告', '赠送500积分'],
                    enabled: true
                },
                {
                    id: '3',
                    name: '年度VIP',
                    days: 365,
                    amount: 300,
                    features: ['无限搜索次数', '专属客服', '优先数据更新', '去除广告', '赠送2000积分', 'VIP专属标识'],
                    enabled: true
                }
            ]
        }
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
                setConfig(data.data);
                // 同时保存到localStorage作为缓存
                localStorage.setItem('siteConfig', JSON.stringify(data.data));
            } else {
                // 如果API失败，尝试从localStorage加载
                const savedConfig = localStorage.getItem('siteConfig');
                if (savedConfig) {
                    setConfig(JSON.parse(savedConfig));
                }
            }
        } catch (error) {
            console.error('Failed to load config:', error);
            // 如果API失败，尝试从localStorage加载
            try {
                const savedConfig = localStorage.getItem('siteConfig');
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
            // 调用API保存到数据库
            const response = await fetch('/api/site-config', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
                },
                body: JSON.stringify(config)
            });

            const data = await response.json();

            if (data.success) {
                // 同时保存到localStorage作为缓存
                localStorage.setItem('siteConfig', JSON.stringify(config));

                // 触发全局配置更新事件
                window.dispatchEvent(new CustomEvent('siteConfigUpdated', { detail: config }));

                toast.success('配置已保存到数据库');
            } else {
                toast.error(data.message || '保存失败');
            }
        } catch (error) {
            console.error('保存配置失败:', error);
            toast.error('保存失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (field: 'logoUrl' | 'faviconUrl') => {
        // 实际应该上传到服务器
        const url = prompt('请输入图片URL:');
        if (url) {
            setConfig({ ...config, [field]: url });
        }
    };

    return (
        <Layout>
            <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">网站配置</h1>
                        <p className="text-gray-600 mt-1">管理网站基本信息和外观</p>
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
                    {/* 主要配置 */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* 基本信息 */}
                        <div className="card">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        网站名称 *
                                    </label>
                                    <input
                                        type="text"
                                        value={config.siteName}
                                        onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                                        className="input-field"
                                        placeholder="InfoSearch"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        显示在网站标题和Logo位置
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        网站描述
                                    </label>
                                    <textarea
                                        value={config.siteDescription}
                                        onChange={(e) => setConfig({ ...config, siteDescription: e.target.value })}
                                        className="input-field"
                                        rows={3}
                                        placeholder="专业的信息搜索平台..."
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        显示在网站首页和SEO描述中
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        底部版权信息
                                    </label>
                                    <input
                                        type="text"
                                        value={config.footerText}
                                        onChange={(e) => setConfig({ ...config, footerText: e.target.value })}
                                        className="input-field"
                                        placeholder="© 2024 InfoSearch. All rights reserved."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Logo和图标 */}
                        <div className="card">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Logo和图标</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        网站Logo
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        {config.logoUrl ? (
                                            <img
                                                src={config.logoUrl}
                                                alt="Logo"
                                                className="h-16 w-auto object-contain border rounded"
                                            />
                                        ) : (
                                            <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center">
                                                <ImageIcon className="h-8 w-8 text-gray-400" />
                                            </div>
                                        )}
                                        <button
                                            onClick={() => handleImageUpload('logoUrl')}
                                            className="btn-secondary flex items-center"
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            上传Logo
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        推荐尺寸：200x50px，支持PNG/SVG格式
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        网站图标（Favicon）
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        {config.faviconUrl ? (
                                            <img
                                                src={config.faviconUrl}
                                                alt="Favicon"
                                                className="h-8 w-8 object-contain border rounded"
                                            />
                                        ) : (
                                            <div className="h-8 w-8 bg-gray-100 rounded flex items-center justify-center">
                                                <ImageIcon className="h-4 w-4 text-gray-400" />
                                            </div>
                                        )}
                                        <button
                                            onClick={() => handleImageUpload('faviconUrl')}
                                            className="btn-secondary flex items-center"
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            上传图标
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        推荐尺寸：32x32px或64x64px，ICO/PNG格式
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 联系方式 */}
                        <div className="card">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">联系方式</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        联系邮箱
                                    </label>
                                    <input
                                        type="email"
                                        value={config.contactEmail}
                                        onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                                        className="input-field"
                                        placeholder="support@infosearch.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        联系电话
                                    </label>
                                    <input
                                        type="text"
                                        value={config.contactPhone}
                                        onChange={(e) => setConfig({ ...config, contactPhone: e.target.value })}
                                        className="input-field"
                                        placeholder="400-123-4567"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        联系地址
                                    </label>
                                    <input
                                        type="text"
                                        value={config.contactAddress}
                                        onChange={(e) => setConfig({ ...config, contactAddress: e.target.value })}
                                        className="input-field"
                                        placeholder="中国 · 北京市朝阳区"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 社交媒体 */}
                        <div className="card">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">社交媒体</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        微信公众号
                                    </label>
                                    <input
                                        type="text"
                                        value={config.socialLinks.wechat}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            socialLinks: { ...config.socialLinks, wechat: e.target.value }
                                        })}
                                        className="input-field"
                                        placeholder="微信号或二维码链接"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        QQ群
                                    </label>
                                    <input
                                        type="text"
                                        value={config.socialLinks.qq}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            socialLinks: { ...config.socialLinks, qq: e.target.value }
                                        })}
                                        className="input-field"
                                        placeholder="QQ群号"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        微博
                                    </label>
                                    <input
                                        type="text"
                                        value={config.socialLinks.weibo}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            socialLinks: { ...config.socialLinks, weibo: e.target.value }
                                        })}
                                        className="input-field"
                                        placeholder="微博主页链接"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Twitter
                                    </label>
                                    <input
                                        type="text"
                                        value={config.socialLinks.twitter}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            socialLinks: { ...config.socialLinks, twitter: e.target.value }
                                        })}
                                        className="input-field"
                                        placeholder="Twitter主页链接"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 充值系统配置 */}
                        <div className="card">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">充值系统配置</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        BEpusdt服务地址 *
                                    </label>
                                    <input
                                        type="text"
                                        value={config.recharge.bepusdtUrl}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            recharge: { ...config.recharge, bepusdtUrl: e.target.value }
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
                                        value={config.recharge.bepusdtApiKey}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            recharge: { ...config.recharge, bepusdtApiKey: e.target.value }
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
                                        value={config.recharge.bepusdtMerchantId}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            recharge: { ...config.recharge, bepusdtMerchantId: e.target.value }
                                        })}
                                        className="input-field"
                                        placeholder="your-merchant-id"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        您的商户ID
                                    </p>
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
                                                    checked={config.recharge.supportedCurrencies.includes(currency)}
                                                    onChange={(e) => {
                                                        const currencies = e.target.checked
                                                            ? [...config.recharge.supportedCurrencies, currency]
                                                            : config.recharge.supportedCurrencies.filter(c => c !== currency);
                                                        setConfig({
                                                            ...config,
                                                            recharge: { ...config.recharge, supportedCurrencies: currencies }
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

                        {/* 充值套餐配置 */}
                        <div className="card">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">积分充值套餐</h2>
                                <button
                                    onClick={() => {
                                        const newPackage: RechargePackage = {
                                            id: Date.now().toString(),
                                            points: 0,
                                            amount: 0,
                                            enabled: true
                                        };
                                        setConfig({
                                            ...config,
                                            recharge: {
                                                ...config.recharge,
                                                packages: [...config.recharge.packages, newPackage]
                                            }
                                        });
                                    }}
                                    className="btn-secondary text-sm"
                                >
                                    + 添加套餐
                                </button>
                            </div>

                            <div className="space-y-3">
                                {config.recharge.packages.map((pkg, index) => (
                                    <div key={pkg.id} className="border rounded-lg p-4">
                                        <div className="grid grid-cols-12 gap-3 items-center">
                                            <div className="col-span-4">
                                                <label className="block text-xs text-gray-600 mb-1">积分数量</label>
                                                <input
                                                    type="number"
                                                    value={pkg.points}
                                                    onChange={(e) => {
                                                        const packages = [...config.recharge.packages];
                                                        packages[index].points = parseInt(e.target.value) || 0;
                                                        setConfig({
                                                            ...config,
                                                            recharge: { ...config.recharge, packages }
                                                        });
                                                    }}
                                                    className="input-field text-sm"
                                                    placeholder="100"
                                                />
                                            </div>
                                            <div className="col-span-4">
                                                <label className="block text-xs text-gray-600 mb-1">金额（元）</label>
                                                <input
                                                    type="number"
                                                    value={pkg.amount}
                                                    onChange={(e) => {
                                                        const packages = [...config.recharge.packages];
                                                        packages[index].amount = parseInt(e.target.value) || 0;
                                                        setConfig({
                                                            ...config,
                                                            recharge: { ...config.recharge, packages }
                                                        });
                                                    }}
                                                    className="input-field text-sm"
                                                    placeholder="10"
                                                />
                                            </div>
                                            <div className="col-span-2 flex items-center justify-center">
                                                <label className="flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={pkg.enabled}
                                                        onChange={(e) => {
                                                            const packages = [...config.recharge.packages];
                                                            packages[index].enabled = e.target.checked;
                                                            setConfig({
                                                                ...config,
                                                                recharge: { ...config.recharge, packages }
                                                            });
                                                        }}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="ml-2 text-xs text-gray-600">启用</span>
                                                </label>
                                            </div>
                                            <div className="col-span-2 flex justify-end">
                                                <button
                                                    onClick={() => {
                                                        const packages = config.recharge.packages.filter((_, i) => i !== index);
                                                        setConfig({
                                                            ...config,
                                                            recharge: { ...config.recharge, packages }
                                                        });
                                                    }}
                                                    className="text-red-600 hover:text-red-700 text-sm"
                                                >
                                                    删除
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {config.recharge.packages.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <p className="text-sm">暂无充值套餐</p>
                                        <p className="text-xs mt-1">点击"添加套餐"创建新的充值选项</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* VIP套餐配置 */}
                        <div className="card">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">VIP会员套餐</h2>
                                <button
                                    onClick={() => {
                                        const newPackage: VipPackage = {
                                            id: Date.now().toString(),
                                            name: '',
                                            days: 30,
                                            amount: 0,
                                            features: [],
                                            enabled: true
                                        };
                                        setConfig({
                                            ...config,
                                            vip: {
                                                packages: [...config.vip.packages, newPackage]
                                            }
                                        });
                                    }}
                                    className="btn-secondary text-sm"
                                >
                                    + 添加VIP套餐
                                </button>
                            </div>

                            <div className="space-y-4">
                                {config.vip.packages.map((pkg, index) => (
                                    <div key={pkg.id} className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-orange-50">
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-12 gap-3">
                                                <div className="col-span-4">
                                                    <label className="block text-xs text-gray-600 mb-1">套餐名称</label>
                                                    <input
                                                        type="text"
                                                        value={pkg.name}
                                                        onChange={(e) => {
                                                            const packages = [...config.vip.packages];
                                                            packages[index].name = e.target.value;
                                                            setConfig({
                                                                ...config,
                                                                vip: { packages }
                                                            });
                                                        }}
                                                        className="input-field text-sm"
                                                        placeholder="月度VIP"
                                                    />
                                                </div>
                                                <div className="col-span-3">
                                                    <label className="block text-xs text-gray-600 mb-1">有效天数</label>
                                                    <input
                                                        type="number"
                                                        value={pkg.days}
                                                        onChange={(e) => {
                                                            const packages = [...config.vip.packages];
                                                            packages[index].days = parseInt(e.target.value) || 0;
                                                            setConfig({
                                                                ...config,
                                                                vip: { packages }
                                                            });
                                                        }}
                                                        className="input-field text-sm"
                                                        placeholder="30"
                                                    />
                                                </div>
                                                <div className="col-span-3">
                                                    <label className="block text-xs text-gray-600 mb-1">金额（元）</label>
                                                    <input
                                                        type="number"
                                                        value={pkg.amount}
                                                        onChange={(e) => {
                                                            const packages = [...config.vip.packages];
                                                            packages[index].amount = parseInt(e.target.value) || 0;
                                                            setConfig({
                                                                ...config,
                                                                vip: { packages }
                                                            });
                                                        }}
                                                        className="input-field text-sm"
                                                        placeholder="30"
                                                    />
                                                </div>
                                                <div className="col-span-2 flex items-end justify-between">
                                                    <label className="flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={pkg.enabled}
                                                            onChange={(e) => {
                                                                const packages = [...config.vip.packages];
                                                                packages[index].enabled = e.target.checked;
                                                                setConfig({
                                                                    ...config,
                                                                    vip: { packages }
                                                                });
                                                            }}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="ml-2 text-xs text-gray-600">启用</span>
                                                    </label>
                                                    <button
                                                        onClick={() => {
                                                            const packages = config.vip.packages.filter((_, i) => i !== index);
                                                            setConfig({
                                                                ...config,
                                                                vip: { packages }
                                                            });
                                                        }}
                                                        className="text-red-600 hover:text-red-700 text-sm"
                                                    >
                                                        删除
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">VIP特权（每行一个）</label>
                                                <textarea
                                                    value={pkg.features.join('\n')}
                                                    onChange={(e) => {
                                                        const packages = [...config.vip.packages];
                                                        packages[index].features = e.target.value.split('\n').filter(f => f.trim());
                                                        setConfig({
                                                            ...config,
                                                            vip: { packages }
                                                        });
                                                    }}
                                                    className="input-field text-sm"
                                                    rows={3}
                                                    placeholder="无限搜索次数&#10;专属客服&#10;优先数据更新"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {config.vip.packages.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <p className="text-sm">暂无VIP套餐</p>
                                        <p className="text-xs mt-1">点击"添加VIP套餐"创建新的会员选项</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 预览 */}
                    <div className="lg:col-span-1">
                        <div className="card sticky top-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">预览</h2>

                            {/* Logo预览 */}
                            <div className="mb-6">
                                <p className="text-sm text-gray-600 mb-2">Logo显示效果：</p>
                                <div className="border rounded-lg p-4 bg-white">
                                    {config.logoUrl ? (
                                        <img src={config.logoUrl} alt="Logo" className="h-12 w-auto" />
                                    ) : (
                                        <div className="text-xl font-bold text-blue-600">
                                            {config.siteName}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 网站信息预览 */}
                            <div className="mb-6">
                                <p className="text-sm text-gray-600 mb-2">网站信息：</p>
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <h3 className="font-semibold text-gray-900 mb-2">{config.siteName}</h3>
                                    <p className="text-sm text-gray-600 mb-3">{config.siteDescription}</p>
                                    <div className="text-xs text-gray-500 space-y-1">
                                        <p>📧 {config.contactEmail}</p>
                                        <p>📞 {config.contactPhone}</p>
                                        <p>📍 {config.contactAddress}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer预览 */}
                            <div>
                                <p className="text-sm text-gray-600 mb-2">底部版权：</p>
                                <div className="border rounded-lg p-4 bg-gray-50 text-center">
                                    <p className="text-xs text-gray-500">{config.footerText}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
