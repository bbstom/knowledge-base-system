import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LanguageContextType {
    language: 'zh' | 'en';
    setLanguage: (lang: 'zh' | 'en') => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

interface LanguageProviderProps {
    children: ReactNode;
}

// 获取保存的语言设置
const getSavedLanguage = (): 'zh' | 'en' => {
    try {
        const saved = localStorage.getItem('language') as 'zh' | 'en';
        return saved && (saved === 'zh' || saved === 'en') ? saved : 'zh';
    } catch (error) {
        return 'zh';
    }
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [language, setLanguageState] = useState<'zh' | 'en'>(getSavedLanguage());

    const setLanguage = (lang: 'zh' | 'en') => {
        try {
            localStorage.setItem('language', lang);
        } catch (error) {
            console.warn('Failed to save language preference');
        }
        setLanguageState(lang);
    };

    const t = (key: string): string => {
        const translations = {
            zh: {
                'nav.home': '首页',
                'nav.search': '信息搜索',
                'nav.databases': '数据库列表',
                'nav.faq': '常见问题',
                'nav.hotTopics': '热门话题',
                'nav.dashboard': '用户中心',
                'common.login': '登录',
                'common.register': '注册',
                'common.logout': '退出',
                'common.loading': '加载中...',
                'common.search': '搜索',
                'common.submit': '提交',
                'common.cancel': '取消',
                'common.success': '成功',
                'common.error': '错误',
                'form.username': '用户名',
                'form.email': '邮箱',
                'form.password': '密码',
                'form.required': '此字段为必填项',
            },
            en: {
                'nav.home': 'Home',
                'nav.search': 'Search',
                'nav.databases': 'Databases',
                'nav.faq': 'FAQ',
                'nav.hotTopics': 'Hot Topics',
                'nav.dashboard': 'Dashboard',
                'common.login': 'Login',
                'common.register': 'Register',
                'common.logout': 'Logout',
                'common.loading': 'Loading...',
                'common.search': 'Search',
                'common.submit': 'Submit',
                'common.cancel': 'Cancel',
                'common.success': 'Success',
                'common.error': 'Error',
                'form.username': 'Username',
                'form.email': 'Email',
                'form.password': 'Password',
                'form.required': 'This field is required',
            }
        };

        const keys = key.split('.');
        let value: any = translations[language];

        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                return key;
            }
        }

        return typeof value === 'string' ? value : key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};