import React, { useState, useEffect } from 'react';
import { X, Bell } from 'lucide-react';

// 添加弹入动画样式
const style = document.createElement('style');
style.textContent = `
  @keyframes bounce-in {
    0% {
      opacity: 0;
      transform: scale(0.3);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      transform: scale(1);
    }
  }
  .animate-bounce-in {
    animation: bounce-in 0.5s ease-out;
  }
`;
if (!document.head.querySelector('style[data-login-notification-modal]')) {
  style.setAttribute('data-login-notification-modal', 'true');
  document.head.appendChild(style);
}

interface Notification {
  _id: string;
  title: string;
  content: string;
  type: 'text' | 'html' | 'markdown';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'draft' | 'active' | 'expired';
  startDate: string;
  endDate?: string;
  targetUsers: 'all' | 'vip' | 'normal';
  showTiming: 'before_login' | 'after_login';
}

export const LoginNotificationModal: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [hideToday, setHideToday] = useState(false);

  useEffect(() => {
    // 检查今日是否已隐藏
    const today = new Date().toDateString();
    const hiddenDate = localStorage.getItem('login_notification_hidden_date');
    
    if (hiddenDate === today) {
      // 今日已隐藏，不显示
      return;
    }
    
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      console.log('LoginNotificationModal: 开始加载登录前通知...');
      
      // 使用完整的API路径
      const apiUrl = '/api/notifications/public';
      console.log('LoginNotificationModal: 请求URL =', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('LoginNotificationModal: 响应状态 =', response.status);
      
      const result = await response.json();
      console.log('LoginNotificationModal: API响应 =', result);
      console.log('LoginNotificationModal: 通知数据 =', result.data);
      
      if (result.success && result.data && result.data.length > 0) {
        console.log(`LoginNotificationModal: 获取到 ${result.data.length} 条通知`);
        
        // 显示所有通知的 showTiming 字段
        result.data.forEach((n: Notification, index: number) => {
          console.log(`LoginNotificationModal: 通知${index + 1} - showTiming:`, n.showTiming, 'title:', n.title);
        });
        
        // 只显示登录前的通知
        const beforeLoginNotifications = result.data.filter(
          (n: Notification) => n.showTiming === 'before_login'
        );
        
        console.log(`LoginNotificationModal: 过滤后的登录前通知数量 = ${beforeLoginNotifications.length}`);
        
        if (beforeLoginNotifications.length > 0) {
          setNotifications(beforeLoginNotifications);
          setIsOpen(true);
          console.log('LoginNotificationModal: ✅ 显示通知弹窗');
        } else {
          console.log('LoginNotificationModal: ⚠️ 没有登录前显示的通知');
        }
      } else {
        console.log('LoginNotificationModal: ⚠️ 没有活动通知或API返回失败');
      }
    } catch (error) {
      console.error('LoginNotificationModal: ❌ 加载通知失败', error);
    }
  };

  const handleClose = () => {
    // 如果勾选了"今日不再显示"
    if (hideToday) {
      const today = new Date().toDateString();
      localStorage.setItem('login_notification_hidden_date', today);
    }

    if (currentIndex < notifications.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsOpen(false);
    }
  };

  const handleSkipAll = () => {
    // 如果勾选了"今日不再显示"
    if (hideToday) {
      const today = new Date().toDateString();
      localStorage.setItem('login_notification_hidden_date', today);
    }
    setIsOpen(false);
  };

  if (!isOpen || notifications.length === 0) {
    return null;
  }

  const currentNotification = notifications[currentIndex];
  const priorityColors = {
    low: 'bg-gray-100 text-gray-700 border border-gray-300',
    normal: 'bg-blue-100 text-blue-700 border border-blue-300',
    high: 'bg-orange-100 text-orange-700 border border-orange-400',
    urgent: 'bg-red-100 text-red-700 border border-red-400 animate-pulse'
  };

  const priorityLabels = {
    low: '普通',
    normal: '一般',
    high: '重要',
    urgent: '紧急'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none overflow-y-auto">
      {/* 通知弹窗 */}
      <div className="bg-white rounded-xl shadow-2xl max-h-[90vh] my-auto border-2 border-orange-400 animate-bounce-in pointer-events-auto"
           style={{ 
             width: 'fit-content',
             minWidth: '320px', 
             maxWidth: currentNotification.type === 'html' ? '90vw' : '600px' 
           }}>
          {/* 头部 */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1 min-w-0">
                <div className="bg-white rounded-full p-1.5 mr-2 flex-shrink-0">
                  <Bell className="h-4 w-4 text-orange-500 animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-white truncate">
                  {currentNotification.title}
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-all flex-shrink-0 ml-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 内容 */}
          <div className="px-4 py-3">
            {/* 优先级标签 */}
            <div className="flex items-center justify-between mb-3">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[currentNotification.priority]}`}>
                {priorityLabels[currentNotification.priority]}
              </span>
              {notifications.length > 1 && (
                <span className="text-xs text-gray-500">
                  {currentIndex + 1} / {notifications.length}
                </span>
              )}
            </div>

            {/* 内容 */}
            <div className="text-gray-700 text-sm mb-4 overflow-y-auto" style={{ maxHeight: currentNotification.type === 'html' ? '70vh' : 'none' }}>
              {currentNotification.type === 'html' ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: currentNotification.content }}
                  className="prose prose-sm max-w-none text-sm"
                />
              ) : (
                <div className="whitespace-pre-wrap">
                  {currentNotification.content}
                </div>
              )}
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 px-4 py-3">
            {/* 今日不再显示选项 */}
            <div className="mb-2 flex items-center">
              <input
                type="checkbox"
                id="hideToday"
                checked={hideToday}
                onChange={(e) => setHideToday(e.target.checked)}
                className="w-3.5 h-3.5 text-orange-500 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
              />
              <label htmlFor="hideToday" className="ml-2 text-xs text-gray-700 cursor-pointer select-none">
                今日不再显示
              </label>
            </div>

            {/* 按钮区域 */}
            <div className="flex justify-between items-center">
              {notifications.length > 1 && (
                <button
                  onClick={handleSkipAll}
                  className="text-xs text-gray-600 hover:text-gray-800 hover:underline transition-all"
                >
                  跳过全部
                </button>
              )}
              <div className="flex-1" />
              <button
                onClick={handleClose}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {currentIndex < notifications.length - 1 ? '下一条 →' : '我知道了 ✓'}
              </button>
            </div>
          </div>
        </div>
    </div>
  );
};
