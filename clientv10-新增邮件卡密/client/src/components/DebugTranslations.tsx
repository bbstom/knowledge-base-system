import React, { useState, useEffect } from 'react';
import { t, setLanguage, getLanguage } from '../utils/i18n';

export const DebugTranslations: React.FC = () => {
  const [currentLang, setCurrentLang] = useState(getLanguage());

  useEffect(() => {
    const handleLanguageChange = () => {
      setCurrentLang(getLanguage());
    };
    
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  const handleLanguageToggle = (lang: 'zh' | 'en') => {
    setLanguage(lang);
    setCurrentLang(lang);
  };
  
  const testKeys = [
    'nav.home',
    'nav.search', 
    'nav.databases',
    'nav.faq',
    'nav.hotTopics',
    'common.login',
    'common.register',
    'form.username',
    'form.email',
    'form.password'
  ];

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm">
      <h3 className="font-bold mb-2">翻译调试</h3>
      <p className="text-sm mb-2">当前语言: {currentLang}</p>
      
      <div className="space-y-1 text-xs">
        {testKeys.map(key => (
          <div key={key} className="flex justify-between">
            <span className="text-gray-600">{key}:</span>
            <span className="font-mono">{t(key)}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-2 space-x-2">
        <button 
          onClick={() => handleLanguageToggle('zh')}
          className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
        >
          中文
        </button>
        <button 
          onClick={() => handleLanguageToggle('en')}
          className="text-xs bg-green-500 text-white px-2 py-1 rounded"
        >
          English
        </button>
      </div>
    </div>
  );
};