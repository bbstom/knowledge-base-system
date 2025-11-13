import React, { useState, useEffect } from 'react';
import { X, Bell } from 'lucide-react';
import { notificationApi } from '../utils/adminApi';
import toast from 'react-hot-toast';

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
if (!document.head.querySelector('style[data-notification-modal]')) {
  style.setAttribute('data-notification-modal', 'true');
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
  readBy: Array<{ userId: string; readAt: string }>;
}

export const NotificationModal: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [hideToday, setHideToday] = useState(false);

  useEffect(() => {
    // 检查今日是否已隐藏
    const today = new Date().toDateString();
    const hiddenDate = localStorage.getItem('notification_hidden_date');
    
    if (hiddenDate === today) {
      // 今日已隐藏，不显示
      return;
    }
    
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      console.log('NotificationModal: 开始加载通知...');
      const response = await notificationApi.getActive();
      console.log('NotificationModal: API响应 =', response);
      
      if (response.success && response.data && response.data.length > 0) {
        console.log(`NotificationModal: 获取到 ${response.data.length} 条通知`);
        // 每次登录都显示所有活动通知
        setNotifications(response.data);
        setIsOpen(true);
      } else {
        console.log('NotificationModal: 没有活动通知');
      }
    } catch (error) {
      console.error('NotificationModal: 加载通知失败', error);
    }
  };

  const getUserId = () => {
    // 从token中获取用户ID
    const token = document.cookie.split('token=')[1]?.split(';')[0];
    if (!token) {
      console.log('NotificationModal: 未找到token');
      return '';
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('NotificationModal: 用户ID =', payload.userId);
      return payload.userId || '';
    } catch (error) {
      console.error('NotificationModal: 解析token失败', error);
      return '';
    }
  };

  const handleClose = async () => {
    // 如果勾选了"今日不再显示"
    if (hideToday) {
      const today = new Date().toDateString();
      localStorage.setItem('notification_hidden_date', today);
    }

    if (notifications[currentIndex]) {
      try {
        await notificationApi.markAsRead(notifications[currentIndex]._id);
      } catch (error) {
        console.error('标记已读失败:', error);
      }
    }

    if (currentIndex < notifications.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsOpen(false);
    }
  };

  const handleSkipAll = async () => {
    // 如果勾选了"今日不再显示"
    if (hideToday) {
      const today = new Date().toDateString();
      localStorage.setItem('notification_hidden_date', today);
    }

    try {
      // 标记所有通知为已读
      await Promise.all(
        notifications.map(n => notificationApi.markAsRead(n._id))
      );
    } catch (error) {
      console.error('标记已读失败:', error);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      {/* 通知弹窗 */}
      <div className="bg-white rounded-xl shadow-2xl max-h-[85vh] overflow-y-auto border-2 border-orange-400 w-full max-w-lg pointer-events-auto animate-bounce-in">
          {/* 头部 */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white rounded-full p-2 mr-3">
                  <Bell className="h-5 w-5 text-orange-500 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  📢 重要通知
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-all"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* 内容 */}
          <div className="px-6 py-4">
            {/* 优先级标签 */}
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${priorityColors[currentNotification.priority]}`}>
                {priorityLabels[currentNotification.priority]}
              </span>
              {notifications.length > 1 && (
                <span className="text-sm text-gray-500">
                  {currentIndex + 1} / {notifications.length}
                </span>
              )}
            </div>

            {/* 标题 */}
            <h4 className="text-xl font-bold text-gray-900 mb-4">
              {currentNotification.title}
            </h4>

            {/* 内容 */}
            <div className="text-gray-700 mb-6">
              {currentNotification.type === 'html' ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: currentNotification.content }}
                  className="prose prose-sm max-w-none"
                />
              ) : (
                <div className="whitespace-pre-wrap">
                  {currentNotification.content}
                </div>
              )}
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4">
            {/* 今日不再显示选项 */}
            <div className="mb-3 flex items-center">
              <input
                type="checkbox"
                id="hideToday"
                checked={hideToday}
                onChange={(e) => setHideToday(e.target.checked)}
                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
              />
              <label htmlFor="hideToday" className="ml-2 text-sm text-gray-700 cursor-pointer select-none">
                今日不再显示
              </label>
            </div>

            {/* 按钮区域 */}
            <div className="flex justify-between items-center">
              {notifications.length > 1 && (
                <button
                  onClick={handleSkipAll}
                  className="text-sm text-gray-600 hover:text-gray-800 hover:underline transition-all"
                >
                  跳过全部
                </button>
              )}
              <div className="flex-1" />
              <button
                onClick={handleClose}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {currentIndex < notifications.length - 1 ? '下一条 →' : '我知道了 ✓'}
              </button>
            </div>
          </div>
        </div>
    </div>
  );
};
