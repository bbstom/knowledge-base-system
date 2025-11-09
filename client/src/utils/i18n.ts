// 简单的国际化实现
export const translations = {
  zh: {
    // 通用
    'common.search': '搜索',
    'common.login': '登录',
    'common.register': '注册',
    'common.logout': '退出',
    'common.submit': '提交',
    'common.cancel': '取消',
    'common.loading': '加载中...',
    'common.success': '成功',
    'common.error': '错误',

    // 导航
    'nav.home': '首页',
    'nav.search': '信息搜索',
    'nav.databases': '数据清单',
    'nav.shop': '商城',
    'nav.faq': '常见问题',
    'nav.hotTopics': '热门话题',
    'nav.dashboard': '用户中心',

    // 表单
    'form.username': '用户名',
    'form.email': '邮箱',
    'form.password': '密码',
    'form.required': '此字段为必填项',
  },
  en: {
    // Common
    'common.search': 'Search',
    'common.login': 'Login',
    'common.register': 'Register',
    'common.logout': 'Logout',
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading...',
    'common.success': 'Success',
    'common.error': 'Error',

    // Navigation
    'nav.home': 'Home',
    'nav.search': 'Search',
    'nav.databases': 'Data Catalog',
    'nav.shop': 'Shop',
    'nav.faq': 'FAQ',
    'nav.hotTopics': 'Hot Topics',
    'nav.dashboard': 'Dashboard',

    // Forms
    'form.username': 'Username',
    'form.email': 'Email',
    'form.password': 'Password',
    'form.required': 'This field is required',
  }
};

// 语言变更事件
const languageChangeEvent = new Event('languageChanged');

// 当前语言状态
let currentLanguage: 'zh' | 'en' = 'zh';

export const setLanguage = (lang: 'zh' | 'en') => {
  currentLanguage = lang;
  try {
    localStorage.setItem('language', lang);
    // 触发语言变更事件
    window.dispatchEvent(languageChangeEvent);
  } catch (error) {
    console.warn('Failed to save language preference');
  }
};

export const getLanguage = (): 'zh' | 'en' => {
  try {
    const saved = localStorage.getItem('language') as 'zh' | 'en';
    if (saved && (saved === 'zh' || saved === 'en')) {
      currentLanguage = saved;
      return saved;
    }
    return 'zh';
  } catch (error) {
    return 'zh';
  }
};

export const t = (key: string): string => {
  try {
    // 使用当前语言状态，而不是每次都从 localStorage 读取
    const lang = currentLanguage;
    const langTranslations = translations[lang] as Record<string, string>;
    const value = langTranslations[key];

    return typeof value === 'string' ? value : key;
  } catch (error) {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }
};

// 初始化语言
try {
  currentLanguage = getLanguage();
} catch (error) {
  currentLanguage = 'zh';
}