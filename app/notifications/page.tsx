"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Clock, Users, CreditCard } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "renewal" | "payment" | "member" | "system";
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      });

      if (!response.ok) {
        throw new Error("Failed to update notification");
      }

      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      ));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "renewal":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "member":
        return <Users className="w-5 h-5 text-green-500" />;
      case "payment":
        return <CreditCard className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} days ago`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-4 py-4 shadow-sm">
        <h1 className="text-xl font-semibold text-black dark:text-white">Notifications</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 dark:text-red-400">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm transition-colors ${
                    !notification.isRead ? "border-l-4 border-blue-500" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
} 