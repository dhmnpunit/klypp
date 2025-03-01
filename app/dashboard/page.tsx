"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Users, Bell, Settings, Calendar, Users2, Pencil } from "lucide-react";
import Analytics from "../components/Analytics";

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
        console.log('Session status:', status);
        console.log('Session data:', session);
        console.log('Fetching plans...');
        const response = await fetch('/api/plans', {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'  // Important: include credentials
        });
        console.log('Response status:', response.status);
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          throw new Error(`Failed to fetch plans: ${errorData.error || response.statusText}`);
        }
        const data = await response.json();
        console.log('Fetched plans:', data);
        setPlans(data);
      } catch (error) {
        console.error('Error fetching plans:', error);
        // Show error in UI
        setPlans([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchPlans();
    }
  }, [status, session]); // Added session to dependencies

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const totalMonthlyCost = plans.reduce((acc, plan) => {
    // Calculate number of members (owner + accepted members)
    const memberCount = (plan.members?.filter(member => member.status === 'ACCEPTED').length || 0) + 1;
    // Calculate user's share of the plan cost
    const costPerMember = Number((plan.cost / memberCount).toFixed(2));
    return acc + costPerMember;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <div className="p-4 pb-24">
        <h2 className="text-2xl font-bold text-black dark:text-white mb-6">My Plans</h2>
        
        {/* Analytics Component */}
        {status === "authenticated" && <Analytics />}
        
        {/* Total Monthly Cost */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400 mb-1">My Monthly Share</p>
          <p className="text-3xl text-black dark:text-white font-bold">${totalMonthlyCost.toFixed(2)}</p>
        </div>

        {/* Subscription Cards */}
        <div className="space-y-4">
          {plans.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No plans yet. Click the + button to add one!
            </div>
          ) : (
            plans.map((plan) => (
              <div 
                key={plan.id} 
                onClick={() => router.push(`/plan/${plan.id}`)}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="mb-2 flex justify-between items-center">
                  <h3 className="text-xl text-black dark:text-white font-bold">{plan.name}</h3>
                  {!plan.isOwner && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      Shared by {plan.owner.name}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-xl text-black dark:text-white">${plan.cost.toFixed(2)}/monthly</p>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Your share</p>
                    <p className="text-lg text-black dark:text-white">
                      ${Number((plan.cost / ((plan.members?.filter(member => member.status === 'ACCEPTED').length || 0) + 1)).toFixed(2))}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Renews in <span className={plan.renewsIn <= 7 ? "text-red-500" : "text-green-500"}>{plan.renewsIn} days</span>
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users2 className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {(plan.members?.filter(member => member.status === 'ACCEPTED').length || 0) + 1}/{plan.maxMembers} members
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                  <span>Next renewal: {plan.renewalDate}</span>
                  <span>Started: {new Date(plan.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => router.push('/plan/add')}
        className="fixed right-4 bottom-20 w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:bg-blue-600 transition-colors"
      >
        +
      </button>
    </div>
  );
} 