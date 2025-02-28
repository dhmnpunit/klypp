"use client";

import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { collection, query, where, onSnapshot, orderBy, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { onMessage } from 'firebase/messaging';
import { db, messaging, requestNotificationPermission } from '@/lib/firebase/client';
import { toast } from 'sonner';
import useSWR from 'swr';

interface Notification {
  id: string;
  isRead: boolean;
  title: string;
  message: string;
  type: string;
  metadata: any;
  createdAt: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  isLoading: boolean;
  error: any;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

// Custom fetcher for SWR that uses Firestore
const notificationsFetcher = async (userId: string) => {
  return new Promise<Notification[]>((resolve, reject) => {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    // We only need this snapshot once for initial data
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        })) as Notification[];
        resolve(notifications);
        unsubscribe(); // Unsubscribe after getting initial data
      },
      reject
    );
  });
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [firestoreNotifications, setFirestoreNotifications] = useState<Notification[]>([]);

  // Use SWR for initial data fetching and caching
  const { data: initialNotifications, error } = useSWR(
    session?.user?.id ? `notifications/${session.user.id}` : null,
    () => session?.user?.id ? notificationsFetcher(session.user.id) : null,
    {
      revalidateOnFocus: false, // Disable revalidation on focus
      revalidateOnReconnect: false, // Disable revalidation on reconnect
    }
  );

  // Set up Firestore real-time listener
  useEffect(() => {
    if (!session?.user?.id) return;

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', session.user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const newNotifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        })) as Notification[];
        
        setFirestoreNotifications(newNotifications);
      },
      (error) => {
        console.error('Error in Firestore listener:', error);
      }
    );

    return () => unsubscribe();
  }, [session?.user?.id]);

  // Set up FCM for push notifications
  useEffect(() => {
    if (!session?.user?.id) return;

    const setupFCM = async () => {
      const token = await requestNotificationPermission();
      if (token) {
        try {
          await fetch('/api/notifications/register-device', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          });
        } catch (error) {
          console.error('Error registering FCM token:', error);
        }
      }
    };

    setupFCM();

    // Handle foreground messages
    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        toast.info(payload.notification?.title, {
          description: payload.notification?.body,
        });
      });

      return () => unsubscribe();
    }
  }, [session?.user?.id]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        isRead: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }, []);

  // Use Firestore real-time data if available, otherwise use initial SWR data
  const notifications = firestoreNotifications.length > 0 ? firestoreNotifications : (initialNotifications || []);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    isLoading: !error && !initialNotifications,
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