"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Users, Bell, Settings, Calendar, Users2, Pencil } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  cost: number;
  renewsIn: number;
  renewalDate: string;
  currentMembers: number;
  maxMembers: number;
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

  const totalMonthlyCost = plans.reduce((acc, plan) => acc + plan.cost, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="p-4 pb-24">
        <h2 className="text-2xl font-bold text-black mb-6">My Plans</h2>
        
        {/* Total Monthly Cost */}
        <div className="mb-6">
          <p className="text-gray-600 mb-1">Total Monthly Cost</p>
          <p className="text-3xl text-black font-bold">${totalMonthlyCost.toFixed(2)}</p>
        </div>

        {/* Subscription Cards */}
        <div className="space-y-4">
          {plans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No plans yet. Click the + button to add one!
            </div>
          ) : (
            plans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl text-black font-bold">{plan.name}</h3>
                  <button 
                    onClick={() => router.push(`/plan/${plan.id}/edit`)}
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xl text-black mb-4">${plan.cost.toFixed(2)}/monthly</p>
                
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">
                      Renews in <span className={plan.renewsIn <= 7 ? "text-red-500" : "text-green-500"}>{plan.renewsIn} days</span>
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users2 className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">{plan.currentMembers}/{plan.maxMembers} members</span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm">Next renewal: {plan.renewalDate}</p>
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

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full bg-white border-t">
        <div className="flex justify-around py-3">
          <button className="flex flex-col items-center text-blue-500">
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">My Plans</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <Users className="w-6 h-6" />
            <span className="text-xs mt-1">Shared Plans</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <Bell className="w-6 h-6" />
            <span className="text-xs mt-1">Renewals</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <Settings className="w-6 h-6" />
            <span className="text-xs mt-1">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
} 