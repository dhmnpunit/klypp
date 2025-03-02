"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home, Users, Settings, BarChart2, Bell } from "lucide-react";
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
    <div className="fixed bottom-0 w-full bg-[#252525] border-t border-[#323232] shadow-lg z-50">
      <div className="flex justify-around py-3">
        <button 
          onClick={() => router.push('/dashboard')}
          className={`flex flex-col items-center ${
            isActive('/dashboard') ? 'text-[#8A68DD]' : 'text-gray-400 dark:text-gray-500 hover:text-gray-300'
          } transition-colors duration-200`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs mt-1">My Plans</span>
        </button>
        <button 
          onClick={() => router.push('/insights')}
          className={`flex flex-col items-center ${
            isActive('/insights') ? 'text-[#8A68DD]' : 'text-gray-400 dark:text-gray-500 hover:text-gray-300'
          } transition-colors duration-200`}
        >
          <BarChart2 className="w-6 h-6" />
          <span className="text-xs mt-1">Insights</span>
        </button>
        <button 
          onClick={() => router.push('/notifications')}
          className={`flex flex-col items-center ${
            isActive('/notifications') ? 'text-[#8A68DD]' : 'text-gray-400 dark:text-gray-500 hover:text-gray-300'
          } transition-colors duration-200`}
        >
          <div className="flex flex-col items-center">
            <NotificationBadge isActive={isActive('/notifications')} />
            <span className="text-xs mt-1">Alerts</span>
          </div>
        </button>
        <button 
          onClick={() => router.push('/settings')}
          className={`flex flex-col items-center ${
            isActive('/settings') ? 'text-[#8A68DD]' : 'text-gray-400 dark:text-gray-500 hover:text-gray-300'
          } transition-colors duration-200`}
        >
          <Settings className="w-6 h-6" />
          <span className="text-xs mt-1">Settings</span>
        </button>
      </div>
    </div>
  );
} 