"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, Users, Trash2, Calendar, BarChart2, Home } from "lucide-react";
import Analytics from "../components/Analytics";
import SpendingTrend from "../components/SpendingTrend";
import SubscriptionCategories from "../components/SubscriptionCategories";
import SavingsOpportunities from "../components/SavingsOpportunities";
import Link from "next/link";

export default function InsightsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      setIsLoading(false);
    }
  }, [status, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen dashboard-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8A68DD]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dashboard-bg">
      <div className="max-w-4xl mx-auto p-4 pb-28">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
          <div className="flex items-center">
            <BarChart2 className="w-5 h-5 text-[#8A68DD] mr-2" />
            <h2 className="text-xl font-bold text-white">Spending Insights</h2>
          </div>
        </div>
        
        {/* Analytics Summary - Always visible */}
        <div className="mb-5">
          <Analytics />
        </div>
        
        {/* Tab Navigation */}
        <div className="flex mb-4 border-b border-gray-800 overflow-x-auto pb-0.5 scrollbar-hide">
          <button 
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === "overview" 
                ? "text-[#8A68DD] border-b-2 border-[#8A68DD]" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab("trends")}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === "trends" 
                ? "text-[#8A68DD] border-b-2 border-[#8A68DD]" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            Spending Trends
          </button>
          <button 
            onClick={() => setActiveTab("categories")}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === "categories" 
                ? "text-[#8A68DD] border-b-2 border-[#8A68DD]" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            Categories
          </button>
          <button 
            onClick={() => setActiveTab("savings")}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === "savings" 
                ? "text-[#8A68DD] border-b-2 border-[#8A68DD]" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            Savings
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="bg-[#252525] border border-[#323232] rounded-xl shadow-sm overflow-hidden">
          {/* Overview Tab - Shows a summary of all sections */}
          {activeTab === "overview" && (
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-[#1E1E1E] border border-[#323232] rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-white mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 text-[#8A68DD] mr-1" />
                    Monthly Trend
                  </h3>
                  <div className="h-56">
                    <SpendingTrend />
                  </div>
                </div>
                <div className="bg-[#1E1E1E] border border-[#323232] rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-white mb-2 flex items-center">
                    <DollarSign className="w-4 h-4 text-[#8A68DD] mr-1" />
                    Categories
                  </h3>
                  <div className="h-56">
                    <SubscriptionCategories />
                  </div>
                </div>
              </div>
              <div className="bg-[#1E1E1E] border border-[#323232] rounded-lg p-3">
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center">
                  <Trash2 className="w-4 h-4 text-[#8A68DD] mr-1" />
                  Savings Opportunities
                </h3>
                <SavingsOpportunities />
              </div>
            </div>
          )}
          
          {/* Spending Trends Tab */}
          {activeTab === "trends" && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 text-[#8A68DD] mr-1" />
                Monthly Spending Trend
              </h3>
              <div className="h-[400px]">
                <SpendingTrend />
              </div>
            </div>
          )}
          
          {/* Categories Tab */}
          {activeTab === "categories" && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
                <DollarSign className="w-4 h-4 text-[#8A68DD] mr-1" />
                Subscription Categories
              </h3>
              <div className="h-[400px]">
                <SubscriptionCategories />
              </div>
            </div>
          )}
          
          {/* Savings Tab */}
          {activeTab === "savings" && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
                <Trash2 className="w-4 h-4 text-[#8A68DD] mr-1" />
                Savings Opportunities
              </h3>
              <SavingsOpportunities />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 