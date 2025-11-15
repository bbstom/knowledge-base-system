import { useState, useEffect } from 'react';

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

const defaultConfig: SiteConfig = {
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
};

export const useSiteConfig = () => {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        // 先从localStorage加载（快速显示）
        const savedConfig = localStorage.getItem('siteConfig');
        if (savedConfig) {
          const parsed = JSON.parse(savedConfig);
          setConfig({
            ...parsed,
            socialLinks: parsed.socialLinks || defaultConfig.socialLinks
          });
        }

        // 然后从API加载最新配置
        const response = await fetch('/api/site-config/public');
        const data = await response.json();
        
        if (data.success && data.data) {
          const newConfig = {
            ...data.data,
            socialLinks: data.data.socialLinks || defaultConfig.socialLinks
          };
          setConfig(newConfig);
          localStorage.setItem('siteConfig', JSON.stringify(newConfig));
          
          // 更新页面标题：网站名称 - 网站简介
          const title = newConfig.siteDescription 
            ? `${newConfig.siteName} - ${newConfig.siteDescription}`
            : newConfig.siteName;
          document.title = title;
          
          // 更新favicon
          if (newConfig.faviconUrl) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.head.appendChild(link);
            }
            link.href = newConfig.faviconUrl;
          }
        }
      } catch (error) {
        console.error('Failed to load site config:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();

    // 监听配置更新事件
    const handleConfigUpdate = (e: any) => {
      const newConfig = {
        ...e.detail,
        socialLinks: e.detail.socialLinks || defaultConfig.socialLinks
      };
      setConfig(newConfig);
      
      // 更新页面标题：网站名称 - 网站简介
      const title = newConfig.siteDescription 
        ? `${newConfig.siteName} - ${newConfig.siteDescription}`
        : newConfig.siteName;
      document.title = title;
      
      // 更新favicon
      if (newConfig.faviconUrl) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = newConfig.faviconUrl;
      }
    };

    window.addEventListener('siteConfigUpdated', handleConfigUpdate);
    return () => window.removeEventListener('siteConfigUpdated', handleConfigUpdate);
  }, []);

  return { config, loading };
};
