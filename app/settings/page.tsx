"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, LogOut, User, Moon, Sun, Bell, Globe, CreditCard } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-4 py-4 flex items-center shadow-sm">
        <button onClick={() => router.back()} className="mr-4">
          <ChevronLeft className="w-6 h-6 dark:text-white" />
        </button>
        <h1 className="text-xl font-semibold text-black dark:text-white">Settings</h1>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-black dark:text-white mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Name</label>
              <div className="flex items-center mt-1">
                <User className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-2" />
                <p className="text-black dark:text-white">{session?.user?.name}</p>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Email</label>
              <p className="text-black dark:text-white mt-1">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-black dark:text-white">Preferences</h2>
          
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full">
                {isDarkMode ? (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                )}
              </div>
              <div>
                <p className="text-black dark:text-white">Theme</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isDarkMode ? "Dark Mode" : "Light Mode"}
                </p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className="w-14 h-8 rounded-full bg-gray-200 dark:bg-gray-700 relative transition-colors duration-200 ease-in-out"
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white dark:bg-blue-500 transform transition-transform duration-200 ${
                  isDarkMode ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <p className="text-black dark:text-white">Notifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {notifications ? "Enabled" : "Disabled"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className="w-14 h-8 rounded-full bg-gray-200 dark:bg-gray-700 relative transition-colors duration-200 ease-in-out"
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white dark:bg-blue-500 transform transition-transform duration-200 ${
                  notifications ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Currency Selection */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full">
                <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <p className="text-black dark:text-white">Currency</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Select your preferred currency
                </p>
              </div>
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-gray-100 dark:bg-gray-700 text-black dark:text-white rounded-lg px-3 py-2 outline-none"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-white dark:bg-gray-800 text-red-500 py-4 rounded-xl font-medium border border-red-500 flex items-center justify-center space-x-2 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
} 