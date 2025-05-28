import { useState, useCallback, useEffect } from 'react';
import {
  Notification,
  getNotifications,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications,
  deleteNotification,
  getUnreadNotificationsCount,
  getNotificationsByType,
} from '@/lib/storage';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications on mount
  useEffect(() => {
    const loadNotifications = () => {
      const allNotifications = getNotifications();
      setNotifications(allNotifications);
      setUnreadCount(getUnreadNotificationsCount());
    };

    loadNotifications();
  }, []);

  const add = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    try {
      const newNotification = addNotification(notification);
      setNotifications(prev => [newNotification, ...prev].slice(0, 50));
      setUnreadCount(prev => prev + 1);
      return newNotification;
    } catch (error) {
      console.error('Failed to add notification:', error);
      throw error;
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    try {
      markNotificationAsRead(id);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }, []);

  const markAllAsRead = useCallback(() => {
    try {
      markAllNotificationsAsRead();
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }, []);

  const remove = useCallback((id: string) => {
    try {
      deleteNotification(id);
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === id);
        return notification && !notification.read ? Math.max(0, prev - 1) : prev;
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }, [notifications]);

  const clear = useCallback(() => {
    try {
      clearNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
      throw error;
    }
  }, []);

  const getByType = useCallback((type: Notification['type']) => {
    return getNotificationsByType(type);
  }, []);

  return {
    notifications,
    unreadCount,
    add,
    markAsRead,
    markAllAsRead,
    remove,
    clear,
    getByType,
  };
} 