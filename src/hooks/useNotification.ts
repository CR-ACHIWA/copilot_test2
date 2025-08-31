import { useState, useCallback } from 'react';
import type { NotificationOptions } from '../types';

export const useNotification = () => {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof Notification === 'undefined') {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (permission === 'granted') {
      return true;
    }

    if (permission === 'denied') {
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }, [permission]);

  const sendNotification = useCallback((options: NotificationOptions): Notification | null => {
    if (typeof Notification === 'undefined') {
      console.warn('This browser does not support notifications');
      return null;
    }

    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/vite.svg',
        tag: options.tag || 'todo-notification',
        requireInteraction: false,
        silent: false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return null;
    }
  }, [permission]);

  const isSupported = typeof Notification !== 'undefined';
  const isEnabled = permission === 'granted';

  return {
    permission,
    isSupported,
    isEnabled,
    requestPermission,
    sendNotification,
  };
};