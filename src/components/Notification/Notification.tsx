import React, { useEffect, useState } from 'react';
import { Notification as NotificationInterface, NotificationType } from '../../types';
import { generateId } from '../../utils/helpers';
import './Notification.css';

interface NotificationProps {
  notification: NotificationInterface;
  onClose: (id: string) => void;
}

const Notification: React.FC<NotificationProps> = ({ notification, onClose }) => {
  const { id, type, message, timeout = 3000 } = notification;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, timeout);

    return () => {
      clearTimeout(timer);
    };
  }, [id, timeout, onClose]);

  const getTypeClass = () => {
    switch (type) {
      case 'success': return 'notification-success';
      case 'error': return 'notification-error';
      case 'info': return 'notification-info';
      case 'drag-success': return 'notification-drag-success';
      case 'drag-error': return 'notification-drag-error';
      default: return 'notification-info';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
      case 'drag-success':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
          </svg>
        );
      case 'error':
      case 'drag-error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
          </svg>
        );
    }
  };

  return (
    <div className={`notification ${getTypeClass()}`}>
      <div className="notification-icon">
        {getIcon()}
      </div>
      <div className="notification-content">
        {message}
      </div>
      <button
        onClick={() => onClose(id)}
        className="notification-close"
      >
        ✕
      </button>
    </div>
  );
};

// 알림 래퍼 컴포넌트
interface NotificationsWrapperProps {
  notifications: NotificationInterface[];
  removeNotification: (id: string) => void;
}

export const NotificationsWrapper: React.FC<NotificationsWrapperProps> = ({
  notifications,
  removeNotification
}) => {
  return (
    <div className="notifications-container">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
};

// 알림 상태 관리 훅
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationInterface[]>([]);

  const addNotification = (
    message: string,
    type: NotificationType = 'info',
    timeout: number = 3000
  ) => {
    const newNotification: NotificationInterface = {
      id: generateId(),
      message,
      type,
      timeout
    };

    setNotifications((prev) => [...prev, newNotification]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  return {
    notifications,
    addNotification,
    removeNotification
  };
};

export default Notification; 