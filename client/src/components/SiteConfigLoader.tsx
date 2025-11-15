import { useEffect } from 'react';

/**
 * 全局网站配置加载器
 * 在应用启动时加载配置并更新页面标题和favicon
 */
export const SiteConfigLoader: React.FC = () => {
  useEffect(() => {
    const loadConfig = async () => {
      try {
        // 先从localStorage快速加载
        const savedConfig = localStorage.getItem('siteConfig');
        if (savedConfig) {
          const config = JSON.parse(savedConfig);
          updatePageMeta(config);
        }

        // 然后从API加载最新配置
        const response = await fetch('/api/site-config/public');
        const data = await response.json();
        
        if (data.success && data.data) {
          updatePageMeta(data.data);
          localStorage.setItem('siteConfig', JSON.stringify(data.data));
        }
      } catch (error) {
        console.error('Failed to load site config:', error);
      }
    };

    loadConfig();

    // 监听配置更新事件
    const handleConfigUpdate = (e: any) => {
      updatePageMeta(e.detail);
    };

    window.addEventListener('siteConfigUpdated', handleConfigUpdate);
    return () => window.removeEventListener('siteConfigUpdated', handleConfigUpdate);
  }, []);

  return null; // 这是一个无UI组件
};

/**
 * 更新页面元数据（标题和favicon）
 */
function updatePageMeta(config: any) {
  // 更新页面标题：网站名称 - 网站简介
  if (config.siteName) {
    const title = config.siteDescription 
      ? `${config.siteName} - ${config.siteDescription}`
      : config.siteName;
    document.title = title;
  }
  
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
}
