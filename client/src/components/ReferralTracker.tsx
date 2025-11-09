import { useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { trackReferralVisit } from '../utils/referralTracking';

export const ReferralTracker: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    // 从URL获取邀请码
    const refCode = searchParams.get('ref');
    
    // 或从路径中获取（如 /register/:referralCode）
    const pathMatch = location.pathname.match(/\/register\/([A-Z0-9]+)/);
    const pathRefCode = pathMatch ? pathMatch[1] : null;

    const referralCode = refCode || pathRefCode;

    if (referralCode) {
      // 追踪邀请访问
      trackReferralVisit(referralCode);
    }
  }, [searchParams, location]);

  return null; // 这是一个无UI组件
};
