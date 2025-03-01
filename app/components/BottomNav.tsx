"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home, Users, Settings, BarChart2 } from "lucide-react";
import { useSession } from "next-auth/react";
import NotificationBadge from "./NotificationBadge";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useSession();

  const isActive = (path: string) => {
    return pathname === path;
  };

  // Don't render the navigation bar if user is not authenticated
  if (status !== "authenticated") {
    return null;
  }

  // Don't render on authentication-related pages
  if (['/login', '/signup', '/'].includes(pathname)) {
    return null;
  }

  return (
    <div className="fixed bottom-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-around py-3">
        <button 
          onClick={() => router.push('/dashboard')}
          className={`flex flex-col items-center ${
            isActive('/dashboard') ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs mt-1">My Plans</span>
        </button>
        <button 
          onClick={() => router.push('/insights')}
          className={`flex flex-col items-center ${
            isActive('/insights') ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          <BarChart2 className="w-6 h-6" />
          <span className="text-xs mt-1">Spending Insights</span>
        </button>
        <button 
          onClick={() => router.push('/notifications')}
          className={`flex flex-col items-center ${
            isActive('/notifications') ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          <div className="flex flex-col items-center">
            <NotificationBadge isActive={isActive('/notifications')} />
          </div>
        </button>
        <button 
          onClick={() => router.push('/settings')}
          className={`flex flex-col items-center ${
            isActive('/settings') ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          <Settings className="w-6 h-6" />
          <span className="text-xs mt-1">Settings</span>
        </button>
      </div>
    </div>
  );
} 