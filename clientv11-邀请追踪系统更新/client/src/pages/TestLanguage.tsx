import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const TestLanguage: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">语言测试页面</h1>
      
      <div className="mb-4">
        <p>当前语言: {language}</p>
      </div>
      
      <div className="mb-4 space-x-2">
        <button 
          onClick={() => setLanguage('zh')}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          中文
        </button>
        <button 
          onClick={() => setLanguage('en')}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          English
        </button>
      </div>
      
      <div className="space-y-2">
        <p>nav.home: {t('nav.home')}</p>
        <p>nav.search: {t('nav.search')}</p>
        <p>nav.databases: {t('nav.databases')}</p>
        <p>common.login: {t('common.login')}</p>
        <p>common.register: {t('common.register')}</p>
      </div>
    </div>
  );
};