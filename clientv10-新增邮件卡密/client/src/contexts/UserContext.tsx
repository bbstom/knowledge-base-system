import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  points: number;
  balance: number;
  commission: number;
  isVip: boolean;
  vipExpireAt: string | null;
  role: string;
  lastDailyClaimAt?: string | null;
  referralCount?: number;
  createdAt?: string;
  avatar?: string;
  referralCode?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  loadUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  updatePoints: (points: number) => void;
  updateBalance: (balance: number) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 从API加载用户信息
  const loadUser = async () => {
    const token = document.cookie.split('token=')[1]?.split(';')[0];
    if (!token) {
      setUser(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('UserContext - API Response:', data); // 调试信息

      if (data.success && data.user) {
        console.log('UserContext - User data:', data.user); // 调试信息
        setUser({
          id: data.user._id || data.user.id,
          username: data.user.username,
          email: data.user.email,
          points: data.user.points || 0,
          balance: data.user.balance || 0,
          commission: data.user.commission || 0,
          isVip: data.user.isVip || false,
          vipExpireAt: data.user.vipExpireAt || null,
          role: data.user.role || 'user',
          lastDailyClaimAt: data.user.lastDailyClaimAt || null,
          referralCount: data.user.referralCount || 0,
          createdAt: data.user.createdAt || null,
          avatar: data.user.avatar || '',
          referralCode: data.user.referralCode || ''
        });
      } else {
        console.log('UserContext - Failed to load user:', data); // 调试信息
        setUser(null);
      }
    } catch (err) {
      console.error('Load user error:', err);
      setError('加载用户信息失败');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 更新用户信息（部分更新）
  const updateUser = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  // 更新积分
  const updatePoints = (points: number) => {
    if (user) {
      setUser({ ...user, points });
    }
  };

  // 更新余额
  const updateBalance = (balance: number) => {
    if (user) {
      setUser({ ...user, balance });
    }
  };

  // 刷新用户信息
  const refreshUser = async () => {
    await loadUser();
  };

  // 登出
  const logout = () => {
    setUser(null);
    setError(null);
    // 清除cookie
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  };

  // 初始加载
  useEffect(() => {
    loadUser();
  }, []);

  const value = {
    user,
    loading,
    error,
    loadUser,
    updateUser,
    updatePoints,
    updateBalance,
    refreshUser,
    logout
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
