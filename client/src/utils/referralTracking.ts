// 生成设备指纹
export const generateFingerprint = (): string => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let fingerprint = '';

    // Canvas指纹
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('fingerprint', 2, 2);
      fingerprint += canvas.toDataURL();
    }

    // 屏幕信息
    fingerprint += screen.width + 'x' + screen.height;
    fingerprint += screen.colorDepth;
    fingerprint += screen.pixelDepth;
    
    // 浏览器信息
    fingerprint += navigator.language;
    fingerprint += navigator.languages?.join(',') || '';
    fingerprint += navigator.userAgent;
    
    // 使用新的 userAgentData API（如果可用），替代废弃的 platform
    if ('userAgentData' in navigator) {
      const uaData = (navigator as any).userAgentData;
      fingerprint += uaData?.platform || '';
      fingerprint += uaData?.mobile ? 'mobile' : 'desktop';
    } else {
      // 降级方案：使用 userAgent 中的信息
      fingerprint += navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop';
    }
    
    // 时区信息
    try {
      fingerprint += Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
      // 时区获取失败，跳过
    }
    
    // 硬件并发数
    fingerprint += navigator.hardwareConcurrency || '';
    
    // 设备内存（如果可用）
    if ('deviceMemory' in navigator) {
      fingerprint += (navigator as any).deviceMemory || '';
    }

    // 生成哈希
    return hashCode(fingerprint).toString();
  } catch (error) {
    console.error('Generate fingerprint error:', error);
    // 降级方案：使用随机值 + 时间戳
    return 'fallback_' + Date.now() + '_' + Math.random().toString(36).substring(7);
  }
};

// 简单哈希函数
const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

// 缓存设备指纹，避免重复生成
let cachedFingerprint: string | null = null;

// 获取缓存的设备指纹
export const getCachedFingerprint = (): string => {
  if (!cachedFingerprint) {
    cachedFingerprint = generateFingerprint();
  }
  return cachedFingerprint;
};

// Cookie操作
const REFERRAL_COOKIE_NAME = 'ref_code';
const COOKIE_DAYS = 30;

export const setReferralCookie = (referralCode: string): void => {
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + COOKIE_DAYS * 24 * 60 * 60 * 1000);
    document.cookie = `${REFERRAL_COOKIE_NAME}=${referralCode};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    console.log('[Referral] Cookie set successfully');
  } catch (error) {
    console.warn('[Referral] Failed to set cookie:', error);
    // Cookie 设置失败，依赖 LocalStorage 和服务器记录
  }
};

export const getReferralCookie = (): string | null => {
  try {
    const name = REFERRAL_COOKIE_NAME + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
  } catch (error) {
    console.warn('[Referral] Failed to read cookie:', error);
    return null;
  }
};

// LocalStorage操作
const REFERRAL_STORAGE_KEY = 'referral_code';

export const setReferralStorage = (referralCode: string): void => {
  try {
    localStorage.setItem(REFERRAL_STORAGE_KEY, referralCode);
    console.log('[Referral] LocalStorage set successfully');
  } catch (error) {
    console.warn('[Referral] LocalStorage not available:', error);
    // LocalStorage 不可用，依赖 Cookie 和服务器记录
  }
};

export const getReferralStorage = (): string | null => {
  try {
    return localStorage.getItem(REFERRAL_STORAGE_KEY);
  } catch (error) {
    console.warn('[Referral] Failed to read LocalStorage:', error);
    return null;
  }
};

// 防止重复追踪
let trackingInProgress = false;

// 追踪邀请访问
export const trackReferralVisit = async (referralCode: string): Promise<void> => {
  // 防抖：避免重复追踪
  if (trackingInProgress) {
    console.log('Tracking already in progress, skipping...');
    return;
  }

  trackingInProgress = true;

  try {
    const fingerprint = getCachedFingerprint();
    
    // 先保存到本地（即使服务器请求失败也能保存）
    setReferralCookie(referralCode);
    setReferralStorage(referralCode);

    // 发送到服务器（异步，不阻塞）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

    try {
      const response = await fetch('/api/referral/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          referralCode,
          fingerprint
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn('[Referral] Server returned error:', response.status);
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.warn('[Referral] Request timeout');
      } else {
        throw fetchError;
      }
    }
    
    console.log('[Referral] Visit tracked successfully:', referralCode);
  } catch (error) {
    console.error('[Referral] Track visit error:', error);
    // 静默失败，不影响用户体验
  } finally {
    trackingInProgress = false;
  }
};

// 获取邀请码（注册时使用）
export const getReferralCode = async (): Promise<string | null> => {
  try {
    // 1. 优先从Cookie获取
    let code = getReferralCookie();
    if (code) {
      console.log('[Referral] Code retrieved from Cookie:', code);
      return code;
    }

    // 2. 从LocalStorage获取
    code = getReferralStorage();
    if (code) {
      console.log('[Referral] Code retrieved from LocalStorage:', code);
      return code;
    }

    // 3. 从服务器获取（基于设备指纹）
    const fingerprint = getCachedFingerprint();
    
    // 添加超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

    try {
      const response = await fetch('/api/referral/get-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fingerprint }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn('[Referral] Server request failed:', response.status);
        return null;
      }

      const data = await response.json();
      if (data.success && data.referralCode) {
        // 保存到本地
        setReferralCookie(data.referralCode);
        setReferralStorage(data.referralCode);
        console.log('[Referral] Code retrieved from server:', data.referralCode);
        return data.referralCode;
      }

      console.log('[Referral] No referral code found');
      return null;
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.warn('[Referral] Server request timeout');
      } else {
        throw fetchError;
      }
      return null;
    }
  } catch (error) {
    console.error('[Referral] Get referral code error:', error);
    return null;
  }
};
