"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home, Users, Bell, Settings } from "lucide-react";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

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
          className="flex flex-col items-center text-gray-400 dark:text-gray-500"
        >
          <Users className="w-6 h-6" />
          <span className="text-xs mt-1">Shared Plans</span>
        </button>
        <button 
          onClick={() => router.push('/notifications')}
          className={`flex flex-col items-center ${
            isActive('/notifications') ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          <Bell className="w-6 h-6" />
          <span className="text-xs mt-1">Notifications</span>
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