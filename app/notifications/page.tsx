"use client";

import { useState, useMemo } from "react";
import { Bell, Check, Clock, Users, CreditCard, X, Filter, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useNotifications } from "../contexts/NotificationContext";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  metadata?: {
    planId: string;
    planName: string;
    inviterId: string;
    inviterName: string;
    memberId: string;
    status?: string;
  };
}

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, markAsRead, isLoading, error } = useNotifications();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleInvitation = async (memberId: string, action: 'ACCEPT' | 'DECLINE') => {
    try {
      const response = await fetch(`/api/plans/invitations/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action.toLowerCase()} invitation`);
      }

      // Show success message
      toast.success(`Successfully ${action.toLowerCase()}ed invitation`);
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing invitation:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to ${action.toLowerCase()} invitation`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "RENEWAL":
        return <Clock className="w-5 h-5 text-[#8A68DD]" />;
      case "PLAN_INVITATION":
        return <Users className="w-5 h-5 text-[#8A68DD]" />;
      case "PAYMENT":
        return <CreditCard className="w-5 h-5 text-[#8A68DD]" />;
      default:
        return <Bell className="w-5 h-5 text-[#8A68DD]" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      if (days < 7) {
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    }
  };

  // Group notifications by date
  const groupNotificationsByDate = (notifications: Notification[]) => {
    const groups: { [key: string]: Notification[] } = {};
    
    notifications.forEach(notification => {
      const date = new Date(notification.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let groupKey = '';
      
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday';
      } else {
        groupKey = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      
      groups[groupKey].push(notification);
    });
    
    return groups;
  };

  // Filter notifications based on active filter and search query
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];
    
    // Apply type filter
    if (activeFilter !== "all") {
      filtered = filtered.filter(notification => notification.type === activeFilter);
    }
    
    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(notification => 
        notification.title.toLowerCase().includes(query) || 
        notification.message.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [notifications, activeFilter, searchQuery]);

  // Group filtered notifications by date
  const groupedNotifications = useMemo(() => {
    return groupNotificationsByDate(filteredNotifications);
  }, [filteredNotifications]);

  // Get notification type counts for filter badges
  const notificationCounts = useMemo(() => {
    const counts = {
      all: notifications.length,
      RENEWAL: 0,
      PLAN_INVITATION: 0,
      PAYMENT: 0
    };
    
    notifications.forEach(notification => {
      if (counts.hasOwnProperty(notification.type)) {
        counts[notification.type as keyof typeof counts] += 1;
      }
    });
    
    return counts;
  }, [notifications]);

  if (isLoading) {
    return (
      <div className="min-h-screen dashboard-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8A68DD]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dashboard-bg">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 pb-28">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
          <div className="flex items-center">
            <Bell className="w-5 h-5 text-[#8A68DD] mr-2" />
            <h2 className="text-xl font-bold text-white">Alerts</h2>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search notifications..."
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-[#323232] bg-[#1E1E1E] text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#8A68DD] focus:border-[#8A68DD]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeFilter === "all"
                  ? "bg-[#8A68DD]/20 text-[#8A68DD] border border-[#8A68DD]/30"
                  : "bg-[#252525] text-gray-400 hover:text-white border border-[#323232]"
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              All
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-[#252525] text-white">
                {notificationCounts.all}
              </span>
            </button>
            
            <button
              onClick={() => setActiveFilter("PLAN_INVITATION")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeFilter === "PLAN_INVITATION"
                  ? "bg-[#8A68DD]/20 text-[#8A68DD] border border-[#8A68DD]/30"
                  : "bg-[#252525] text-gray-400 hover:text-white border border-[#323232]"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Invitations
              {notificationCounts.PLAN_INVITATION > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-[#252525] text-white">
                  {notificationCounts.PLAN_INVITATION}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveFilter("RENEWAL")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeFilter === "RENEWAL"
                  ? "bg-[#8A68DD]/20 text-[#8A68DD] border border-[#8A68DD]/30"
                  : "bg-[#252525] text-gray-400 hover:text-white border border-[#323232]"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Renewals
              {notificationCounts.RENEWAL > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-[#252525] text-white">
                  {notificationCounts.RENEWAL}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveFilter("PAYMENT")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeFilter === "PAYMENT"
                  ? "bg-[#8A68DD]/20 text-[#8A68DD] border border-[#8A68DD]/30"
                  : "bg-[#252525] text-gray-400 hover:text-white border border-[#323232]"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Payments
              {notificationCounts.PAYMENT > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-[#252525] text-white">
                  {notificationCounts.PAYMENT}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {/* Notifications List */}
        <div className="space-y-6">
          {Object.keys(groupedNotifications).length === 0 ? (
            <div className="bg-[#252525] border border-[#323232] rounded-xl p-6 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-white mb-1">No notifications</h3>
              <p className="text-gray-400">
                {activeFilter !== "all" 
                  ? `You don't have any ${activeFilter.toLowerCase().replace('_', ' ')} notifications.`
                  : searchQuery 
                    ? "No notifications match your search."
                    : "You're all caught up!"}
              </p>
            </div>
          ) : (
            Object.entries(groupedNotifications).map(([date, notifications]) => (
              <div key={date} className="space-y-2">
                <h3 className="text-sm font-medium text-gray-400 px-2">{date}</h3>
                <div className="bg-[#252525] border border-[#323232] rounded-xl overflow-hidden">
                  {notifications.map((notification, index) => (
                    <div 
                      key={notification.id}
                      className={`p-4 ${!notification.isRead ? 'bg-[#1E1E1E]' : ''} ${
                        index !== notifications.length - 1 ? 'border-b border-[#323232]' : ''
                      }`}
                      onClick={() => {
                        if (!notification.isRead) {
                          markAsRead(notification.id);
                        }
                        
                        // Navigate to relevant page based on notification type
                        if (notification.type === "PLAN_INVITATION" && notification.metadata?.planId) {
                          router.push(`/plan/${notification.metadata.planId}`);
                        } else if (notification.type === "RENEWAL" && notification.metadata?.planId) {
                          router.push(`/plan/${notification.metadata.planId}`);
                        }
                      }}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className="text-sm font-medium text-white truncate pr-2">
                              {notification.title}
                            </h4>
                            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                              {formatDate(notification.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          {/* Invitation Actions */}
                          {notification.type === "PLAN_INVITATION" && notification.metadata?.status === "PENDING" && (
                            <div className="mt-3 flex space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleInvitation(notification.metadata?.memberId || '', 'ACCEPT');
                                }}
                                className="px-3 py-1 bg-[#8A68DD] text-white text-xs font-medium rounded-md hover:bg-[#7958C5] transition-colors"
                              >
                                Accept
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleInvitation(notification.metadata?.memberId || '', 'DECLINE');
                                }}
                                className="px-3 py-1 bg-[#252525] border border-[#323232] text-gray-300 text-xs font-medium rounded-md hover:bg-[#1E1E1E] transition-colors"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-[#8A68DD] flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 