"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, Users, Trash2, Calendar, BarChart2 } from "lucide-react";
import Analytics from "../components/Analytics";

export default function InsightsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      setIsLoading(false);
    }
  }, [status, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dashboard-bg">
      <div className="p-4 pb-24">
        <div className="flex items-center mb-6">
          <BarChart2 className="w-6 h-6 text-violet-400 mr-2" />
          <h2 className="text-2xl font-bold text-white">Spending Insights</h2>
        </div>
        
        {/* Full Analytics Component */}
        <Analytics />
        
        {/* Additional Insights */}
        <div className="mt-6 bg-white/10 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Spending Trend</h3>
          <div className="h-40 flex items-center justify-center">
            <p className="text-gray-400 text-sm">Detailed spending charts coming soon</p>
          </div>
        </div>
        
        <div className="mt-6 bg-white/10 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-white mb-4">Subscription Categories</h3>
          <div className="h-40 flex items-center justify-center">
            <p className="text-gray-400 text-sm">Category breakdown coming soon</p>
          </div>
        </div>
        
        <div className="mt-6 bg-white/10 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-white mb-4">Savings Opportunities</h3>
          <div className="h-40 flex items-center justify-center">
            <p className="text-gray-400 text-sm">Personalized recommendations coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
} 