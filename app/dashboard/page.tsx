"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Users, Calendar, Users2, DollarSign } from "lucide-react";
import DashboardAnalytics from "../components/DashboardAnalytics";

interface Plan {
  id: string;
  name: string;
  cost: number;
  renewsIn: number;
  renewalDate: string;
  members: { status: string }[];
  maxMembers: number;
  startDate: string;
  isOwner: boolean;
  logoUrl?: string;
  owner: {
    name: string;
  };
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await fetch('/api/plans', {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch plans');
        }

        const data = await response.json();
        setPlans(data);
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchPlans();
    }
  }, [status]);

  return (
    <div className="min-h-screen dashboard-bg">
      {/* Main Content */}
      <div className="p-4 pb-24">
        <h2 className="text-2xl font-bold text-white mb-6">My Plans</h2>
        
        {/* Simple Analytics Cards */}
        {status === "authenticated" && <DashboardAnalytics />}
        
        {/* Total Monthly Cost */}
        <div className="mb-6">
          <p className="text-[#A8A8A8] mb-1">My Monthly Share</p>
          <div className="flex items-center">
            <DollarSign className="w-10 h-10 text-violet-400 mr-2" strokeWidth={2.5} />
            <h3 className="text-3xl font-bold text-white">
              ${plans.reduce((total, plan) => total + (plan.cost / (plan.members?.filter(member => member.status === 'ACCEPTED').length + 1)), 0).toFixed(2)}
              <span className="text-[#A8A8A8] text-lg font-normal ml-2">/ month</span>
            </h3>
          </div>
        </div>

        {/* Plans */}
        <h3 className="text-xl font-semibold text-white mb-4">All Plans</h3>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : plans.length === 0 ? (
            <div className="text-center py-8 text-[#A8A8A8]">
              No plans yet. Click the + button to add one!
            </div>
          ) : (
          <>
            {/* All plans in a single grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map(plan => (
                <div 
                  key={plan.id} 
                  onClick={() => router.push(`/plan/${plan.id}`)}
                  className="relative border border-[#323232] rounded-2xl p-6 shadow-sm cursor-pointer hover:shadow-md transition-all hover:translate-y-[-2px] overflow-hidden backdrop-blur-sm"
                  style={{
                    background: '#252525',
                    borderColor: '#323232'
                  }}
                >
                  {/* Subtle texture overlay */}
                  <div className="absolute inset-0 opacity-3 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNjY2MiPjwvcmVjdD4KPC9zdmc+')]"></div>
                  
                  {/* Card content */}
                  <div className="relative z-10">
                    <div className="mb-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          {plan.logoUrl ? (
                            <img 
                              src={plan.logoUrl} 
                              alt={`${plan.name} logo`} 
                              className="w-10 h-10 rounded-md mr-3 object-contain bg-white p-1"
                              onError={(e) => {
                                // If image fails to load, replace with a fallback
                                const target = e.target as HTMLImageElement;
                                target.onerror = null; // Prevent infinite loop
                                target.src = `https://ui-avatars.com/api/?name=${plan.name.charAt(0)}&background=random&color=fff&size=128`;
                              }}
                            />
                          ) : (
                            <div 
                              className="w-10 h-10 rounded-md mr-3 flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: '#3B82F6' }}
                            >
                              {plan.name.substring(0, 1).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h4 className="text-lg font-semibold text-white">{plan.name}</h4>
                            <p className="text-sm text-white/70">
                              {plan.isOwner ? 'You own this plan' : `Shared by ${plan.owner.name}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">${plan.cost.toFixed(2)}</p>
                          <p className="text-sm text-white/70">
                            ${(plan.cost / (plan.members?.filter(member => member.status === 'ACCEPTED').length + 1)).toFixed(2)} per person
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Calendar className="w-4.5 h-4.5 text-white/50 mr-2" />
                          <span className="text-sm text-white/80">
                            Renews in <span className={`font-medium ${
                              plan.renewsIn <= 7 ? "text-red-300" : 
                              plan.renewsIn <= 30 ? "text-yellow-300" : 
                              "text-green-300"
                            }`}>{plan.renewsIn} days</span>
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end">
                            <Users2 className="w-4.5 h-4.5 text-white/50 mr-2" />
                            <span className="text-sm text-white/80">
                              {(plan.members?.filter(member => member.status === 'ACCEPTED').length || 0) + 1}/{plan.maxMembers}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => router.push('/plan/add')}
        className="fixed right-4 bottom-20 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:bg-blue-700 transition-colors"
      >
        +
      </button>
    </div>
  );
} 