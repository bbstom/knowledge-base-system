import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

// 在应用启动时加载网站配置
async function loadSiteConfig() {
  try {
    // 先从localStorage快速加载
    const savedConfig = localStorage.getItem('siteConfig');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      // 标题格式：网站名称 - 网站简介
      const title = config.siteDescription 
        ? `${config.siteName} - ${config.siteDescription}`
        : config.siteName || 'InfoSearch';
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
    }

    // 然后从API加载最新配置
    const response = await fetch('/api/site-config/public');
    const data = await response.json();
    
    if (data.success && data.data) {
      // 标题格式：网站名称 - 网站简介
      const title = data.data.siteDescription 
        ? `${data.data.siteName} - ${data.data.siteDescription}`
        : data.data.siteName || 'InfoSearch';
      document.title = title;
      localStorage.setItem('siteConfig', JSON.stringify(data.data));
      
      // 更新favicon
      if (data.data.faviconUrl) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = data.data.faviconUrl;
      }
    }
  } catch (error) {
    console.error('Failed to load site config:', error);
  }
}

// 加载配置
loadSiteConfig();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)