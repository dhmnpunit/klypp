"use client";

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

interface NotificationBadgeProps {
  isActive: boolean;
}

export default function NotificationBadge({ isActive }: NotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (!response.ok) return;
      const notifications = await response.json();
      const unread = notifications.filter((n: any) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const intervalId = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <div className="relative inline-block">
        <Bell className={`w-6 h-6 ${isActive ? 'text-inherit' : 'text-inherit'}`} />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </div>
      <span className="text-xs mt-1">Notifications</span>
    </>
  );
} 