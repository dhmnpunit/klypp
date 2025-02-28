"use client";

import { Bell } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

interface NotificationBadgeProps {
  isActive: boolean;
}

export default function NotificationBadge({ isActive }: NotificationBadgeProps) {
  const { unreadCount } = useNotifications();

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