import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const [siteConfig, setSiteConfig] = React.useState({
    siteName: 'InfoSearch',
    siteDescription: '专业的信息搜索平台，提供安全、快速、准确的数据查询服务',
    footerText: '© 2024 InfoSearch. All rights reserved.',
    contactEmail: 'support@infosearch.com',
    contactPhone: '400-123-4567',
    socialLinks: {
      wechat: '',
      qq: '',
      weibo: '',
      twitter: ''
    }
  });

  React.useEffect(() => {
    // 从API加载最新配置
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/site-config/public');
        const data = await response.json();
        
        if (data.success && data.data) {
          const config = data.data;
          setSiteConfig({
            ...config,
            socialLinks: config.socialLinks || {
              wechat: '',
              qq: '',
              weibo: '',
              twitter: ''
            }
          });
          localStorage.setItem('siteConfig', JSON.stringify(config));
        } else {
          // 如果API失败，从localStorage加载
          const savedConfig = localStorage.getItem('siteConfig');
          if (savedConfig) {
            const config = JSON.parse(savedConfig);
            setSiteConfig({
              ...config,
              socialLinks: config.socialLinks || {
                wechat: '',
                qq: '',
                weibo: '',
                twitter: ''
              }
            });
          }
        }
      } catch (error) {
        console.error('Failed to load site config:', error);
        // 从localStorage加载
        const savedConfig = localStorage.getItem('siteConfig');
        if (savedConfig) {
          const config = JSON.parse(savedConfig);
          setSiteConfig({
            ...config,
            socialLinks: config.socialLinks || {
              wechat: '',
              qq: '',
              weibo: '',
              twitter: ''
            }
          });
        }
      }
    };

    loadConfig();

    // 监听配置更新
    const handleConfigUpdate = (e: any) => {
      const config = e.detail;
      setSiteConfig({
        ...config,
        socialLinks: config.socialLinks || {
          wechat: '',
          qq: '',
          weibo: '',
          twitter: ''
        }
      });
    };
    window.addEventListener('siteConfigUpdated', handleConfigUpdate);
    return () => window.removeEventListener('siteConfigUpdated', handleConfigUpdate);
  }, []);

  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="text-xl font-bold text-blue-600 mb-4">
              {siteConfig.siteName}
            </div>
            <p className="text-gray-600 text-sm mb-4">
              {siteConfig.siteDescription}
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>📧 {siteConfig.contactEmail}</p>
              <p>📞 {siteConfig.contactPhone}</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
              快速链接
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/search" className="text-gray-600 hover:text-gray-900 text-sm">
                  信息搜索
                </Link>
              </li>
              <li>
                <Link to="/databases" className="text-gray-600 hover:text-gray-900 text-sm">
                  数据库列表
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-gray-900 text-sm">
                  常见问题
                </Link>
              </li>
              <li>
                <Link to="/hot-topics" className="text-gray-600 hover:text-gray-900 text-sm">
                  热门话题
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
              帮助中心
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-gray-900 text-sm">
                  常见问题
                </Link>
              </li>
              <li>
                <a href={`mailto:${siteConfig.contactEmail}`} className="text-gray-600 hover:text-gray-900 text-sm">
                  联系我们
                </a>
              </li>
              <li>
                <a href={`tel:${siteConfig.contactPhone}`} className="text-gray-600 hover:text-gray-900 text-sm">
                  客服电话
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links */}
        {siteConfig.socialLinks && (siteConfig.socialLinks.wechat || siteConfig.socialLinks.qq || 
          siteConfig.socialLinks.weibo || siteConfig.socialLinks.twitter) && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex justify-center space-x-6">
              {siteConfig.socialLinks.wechat && (
                <a href={siteConfig.socialLinks.wechat} className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">微信</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.5 11c.8 0 1.5-.7 1.5-1.5S9.3 8 8.5 8 7 8.7 7 9.5 7.7 11 8.5 11zm7 0c.8 0 1.5-.7 1.5-1.5S16.3 8 15.5 8 14 8.7 14 9.5s.7 1.5 1.5 1.5z"/>
                  </svg>
                </a>
              )}
              {siteConfig.socialLinks.qq && (
                <a href={siteConfig.socialLinks.qq} className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">QQ</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/>
                  </svg>
                </a>
              )}
              {siteConfig.socialLinks.weibo && (
                <a href={siteConfig.socialLinks.weibo} className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">微博</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/>
                  </svg>
                </a>
              )}
              {siteConfig.socialLinks.twitter && (
                <a href={siteConfig.socialLinks.twitter} className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-center text-sm text-gray-400">
            {siteConfig.footerText}
          </p>
        </div>
      </div>
    </footer>
  );
};