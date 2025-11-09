import Cookies from 'js-cookie';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role?: 'user' | 'admin';  // 用户角色
  vipStatus: 'none' | 'basic' | 'premium' | 'enterprise';
  balance: number;
  points: number;
  commission: number;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
  updatedAt: string;
}

export const getToken = (): string | null => {
  return Cookies.get('token') || null;
};

export const setToken = (token: string): void => {
  Cookies.set('token', token, { expires: 7 }); // 7天过期
};

export const removeToken = (): void => {
  Cookies.remove('token');
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const getUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr || userStr === 'undefined' || userStr === 'null') {
      return null;
    }
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem('user');
    return null;
  }
};

export const setUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const removeUser = (): void => {
  localStorage.removeItem('user');
};

export const logout = (): void => {
  removeToken();
  removeUser();
  window.location.href = '/login';
};