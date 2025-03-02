"use client";

import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NotificationBadgeProps {
  isActive: boolean;
}

export default function NotificationBadge({ isActive }: NotificationBadgeProps) {
  const [hasNotifications, setHasNotifications] = useState(false);
  
  // Simulate checking for notifications
  useEffect(() => {
    // This would typically be an API call to check for unread notifications
    const checkNotifications = async () => {
      // Placeholder for API call
      // const response = await fetch('/api/notifications/unread');
      // const data = await response.json();
      // setHasNotifications(data.count > 0);
      
      // For demo purposes, randomly show notifications
      setHasNotifications(Math.random() > 0.5);
    };
    
    checkNotifications();
    
    // Check for new notifications periodically
    const interval = setInterval(checkNotifications, 60000); // every minute
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="relative">
      <Bell className="w-6 h-6" />
      {hasNotifications && !isActive && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#8A68DD] rounded-full border border-[#252525]"></span>
      )}
    </div>
  );
} 