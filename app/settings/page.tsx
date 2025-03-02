"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, LogOut, User, Moon, Sun, Bell, CreditCard, Home } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function Settings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center dashboard-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8A68DD]"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <div className="min-h-screen dashboard-bg">
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="mr-4 text-white">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white">Settings</h1>
        </div>
        <button 
          onClick={() => router.push('/dashboard')}
          className="text-white/70 hover:text-white transition-colors"
        >
          <Home className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Profile Section */}
        <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#323232]">
          <h2 className="text-sm font-medium text-white/80 mb-3">Profile</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-400">Name</span>
              </div>
              <span className="text-sm text-white">{session?.user?.name}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Email</span>
              <span className="text-sm text-white">{session?.user?.email}</span>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#323232]">
          <h2 className="text-sm font-medium text-white/80 mb-3">Preferences</h2>
          
          {/* Theme Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                {isDarkMode ? (
                  <Moon className="w-4 h-4 text-gray-400 mr-2" />
                ) : (
                  <Sun className="w-4 h-4 text-gray-400 mr-2" />
                )}
                <span className="text-sm text-white">Theme</span>
              </div>
              <button
                onClick={toggleDarkMode}
                className="w-10 h-5 rounded-full bg-[#252525] relative transition-colors duration-200 ease-in-out"
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ${
                    isDarkMode ? "translate-x-5 bg-[#8A68DD]" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between py-2 border-t border-[#323232]">
              <div className="flex items-center">
                <Bell className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-white">Notifications</span>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className="w-10 h-5 rounded-full bg-[#252525] relative transition-colors duration-200 ease-in-out"
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ${
                    notifications ? "translate-x-5 bg-[#8A68DD]" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Currency Selection */}
            <div className="flex items-center justify-between py-2 border-t border-[#323232]">
              <div className="flex items-center">
                <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-white">Currency</span>
              </div>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-[#252525] text-white text-sm rounded-md px-2 py-1 border border-[#323232] focus:border-[#8A68DD] focus:outline-none"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-[#1A1A1A] text-white py-2.5 rounded-md font-medium border border-red-500/30 flex items-center justify-center space-x-2 hover:bg-[#252525] transition-colors text-sm"
        >
          <LogOut className="w-4 h-4 text-red-400 mr-1" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
} 