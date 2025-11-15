import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';

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
        }
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const response = await fetch('/api/site-config/admin', {
                headers: {
                    'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
                },
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success && data.data) {
                setConfig(data.data);
                localStorage.setItem('siteConfig', JSON.stringify(data.data));
            } else {
                const savedConfig = localStorage.getItem('siteConfig');
                if (savedConfig) {
                    setConfig(JSON.parse(savedConfig));
                }
            }
        } catch (error) {
            console.error('Failed to load config:', error);
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
            const response = await fetch('/api/site-config', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
                },
                credentials: 'include',
                body: JSON.stringify(config)
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('siteConfig', JSON.stringify(config));
                
                // 更新页面标题：网站名称 - 网站简介
                const title = config.siteDescription 
                    ? `${config.siteName} - ${config.siteDescription}`
                    : config.siteName;
                document.title = title;
                
                // 更新favicon
                if (config.faviconUrl) {
                    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
                    if (!link) {
                        link = document.createElement('link');
                        link.rel = 'icon';
                        document.head.appendChild(link);
                    }
                    link.href = config.faviconUrl;
                }
                
                // 触发全局配置更新事件
                window.dispatchEvent(new CustomEvent('siteConfigUpdated', { detail: config }));
                toast.success('配置已保存并立即生效');
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

    return (
        <AdminLayout>
            <div>
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
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Logo URL
                                    </label>
                                    <input
                                        type="text"
                                        value={config.logoUrl}
                                        onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
                                        className="input-field"
                                        placeholder="https://example.com/logo.png"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Favicon URL
                                    </label>
                                    <input
                                        type="text"
                                        value={config.faviconUrl}
                                        onChange={(e) => setConfig({ ...config, faviconUrl: e.target.value })}
                                        className="input-field"
                                        placeholder="https://example.com/favicon.ico"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        页脚版权文字
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
                                        placeholder="support@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        联系电话
                                    </label>
                                    <input
                                        type="tel"
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
                                        QQ号
                                    </label>
                                    <input
                                        type="text"
                                        value={config.socialLinks.qq}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            socialLinks: { ...config.socialLinks, qq: e.target.value }
                                        })}
                                        className="input-field"
                                        placeholder="QQ号码"
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
                                    <p className="font-semibold text-gray-900">{config.siteName}</p>
                                    <p className="text-sm text-gray-600 mt-1">{config.siteDescription}</p>
                                </div>
                            </div>

                            {/* Footer预览 */}
                            <div>
                                <p className="text-sm text-gray-600 mb-2">底部版权：</p>
                                <div className="border rounded-lg p-4 bg-gray-50 text-center">
                                    <p className="text-sm text-gray-600">{config.footerText}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};
