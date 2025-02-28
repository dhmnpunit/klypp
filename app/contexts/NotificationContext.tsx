"use client";

import { createContext, useContext, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import { pusherClient } from '../../lib/pusher';
import { useSession } from 'next-auth/react';

interface Notification {
  id: string;
  isRead: boolean;
  message: string;
  type: string;
  metadata: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  isLoading: boolean;
  error: any;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { data: notifications, error, mutate } = useSWR<Notification[]>(
    '/api/notifications',
    fetcher,
    {
      refreshInterval: 0, // Disable polling since we're using WebSocket
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Dedupe requests within 1 minute
    }
  );

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });

      if (!response.ok) throw new Error('Failed to mark notification as read');

      // Optimistically update the cache
      mutate(
        notifications?.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
        false
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [notifications, mutate]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = pusherClient.subscribe(`user-${session.user.id}`);

    channel.bind('notification-new', (newNotification: Notification) => {
      mutate(current => {
        if (!current) return [newNotification];
        return [...current, newNotification];
      }, false);
    });

    channel.bind('notification-updated', (updatedNotification: Notification) => {
      mutate(current => {
        if (!current) return [updatedNotification];
        return current.map(n =>
          n.id === updatedNotification.id ? updatedNotification : n
        );
      }, false);
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`user-${session.user.id}`);
    };
  }, [session?.user?.id, mutate]);

  // Calculate unread count
  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;

  const value = {
    notifications: notifications ?? [],
    unreadCount,
    markAsRead,
    isLoading: !error && !notifications,
    error,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
} 