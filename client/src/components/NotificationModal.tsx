import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'image' | 'html';
  imageUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification | null;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notification
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      // 记录浏览
      if (notification) {
        recordView(notification.id);
      }
    } else {
      setShow(false);
    }
  }, [isOpen, notification]);

  const recordView = async (notificationId: string) => {
    try {
      // 调用API记录浏览
      // await api.recordNotificationView(notificationId);
      console.log('Recorded view for notification:', notificationId);
    } catch (error) {
      console.error('Failed to record view:', error);
    }
  };

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen || !notification) return null;

  const renderContent = () => {
    if (notification.type === 'text') {
      return (
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{notification.content}</p>
        </div>
      );
    } else if (notification.type === 'image') {
      return (
        <div className="space-y-4">
          {notification.imageUrl && (
            <img 
              src={notification.imageUrl} 
              alt={notification.title}
              className="w-full rounded-lg"
            />
          )}
          <p className="text-gray-700 whitespace-pre-wrap">{notification.content}</p>
        </div>
      );
    } else {
      return (
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: notification.content }} 
        />
      );
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className={`relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ${
          show ? 'scale-100' : 'scale-95'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {notification.title}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={handleClose}
            className="btn-primary"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
};
