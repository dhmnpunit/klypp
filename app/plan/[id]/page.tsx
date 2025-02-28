"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronLeft, Calendar, Users2, CreditCard, Clock, DollarSign, History, PieChart, BarChart2, Users, Trash, Edit, UserPlus } from "lucide-react";
import { useSession } from "next-auth/react";
import InviteMemberModal from "@/app/components/InviteMemberModal";

interface Member {
  id: string;
  email: string;
  status: string;
}

interface Plan {
  id: string;
  name: string;
  cost: number;
  renewalFrequency: string;
  maxMembers: number;
  startDate: string;
  nextRenewalDate: string;
  members: Member[];
  ownerId: string;
}

export default function PlanDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchPlan() {
      try {
        const response = await fetch(`/api/plans/${params.id}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch plan');
        }

        const data = await response.json();
        setPlan(data);
      } catch (error) {
        console.error('Error fetching plan:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch plan');
      } finally {
        setIsLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchPlan();
    }
  }, [params.id, status]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen p-4 dark:bg-gray-900">
        <div className="bg-red-50 dark:bg-red-900 text-red-500 dark:text-red-200 p-4 rounded-xl text-center">
          {error || 'Failed to load plan details'}
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this plan?")) return;

    try {
      const response = await fetch(`/api/plans/${plan.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete plan");

      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

  const handleInviteSuccess = () => {
    // Refresh plan data to show updated member list
    const fetchPlan = async () => {
      try {
        const response = await fetch(`/api/plans/${plan.id}`);
        if (!response.ok) throw new Error("Failed to fetch plan");
        const data = await response.json();
        setPlan(data);
      } catch (error) {
        console.error("Error fetching plan:", error);
      }
    };
    fetchPlan();
  };

  const isOwner = session?.user?.id === plan.ownerId;
  const memberCount = plan.members?.length || 0;
  const costPerMember = plan.cost / (memberCount || 1);

  // Calculate days until renewal
  const now = new Date();
  const renewalDate = new Date(plan.nextRenewalDate);
  const daysUntilRenewal = Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-4 py-4 flex items-center shadow-sm">
        <button onClick={() => router.back()} className="mr-4">
          <ChevronLeft className="w-6 h-6 dark:text-white" />
        </button>
        <h1 className="text-xl font-semibold text-black dark:text-white">Plan Details</h1>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Plan Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-black dark:text-white mb-2">{plan.name}</h2>
              <p className="text-3xl text-black dark:text-white">${plan.cost.toFixed(2)}<span className="text-sm text-gray-500">/{plan.renewalFrequency}</span></p>
            </div>
            {isOwner && (
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push(`/plan/${plan.id}/edit`)}
                  className="p-2 text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                >
                  <Trash className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Next Renewal</p>
                <p className="text-black dark:text-white">
                  {renewalDate.toLocaleDateString()} ({daysUntilRenewal} days)
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Members</p>
                <p className="text-black dark:text-white">{memberCount} / {plan.maxMembers}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Cost per Member</p>
                <p className="text-black dark:text-white">${costPerMember.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {isOwner && memberCount < plan.maxMembers && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>Invite Member</span>
            </button>
          )}
        </div>

        {/* Members List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Members</h3>
          <div className="space-y-4">
            {plan.members && plan.members.length > 0 ? (
              plan.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0"
                >
                  <div>
                    <p className="text-black dark:text-white">{member.email}</p>
                    <p className="text-sm text-gray-500 capitalize">{member.status.toLowerCase()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No members yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Invite Member Modal */}
      <InviteMemberModal
        planId={plan.id}
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={handleInviteSuccess}
      />
    </div>
  );
} 