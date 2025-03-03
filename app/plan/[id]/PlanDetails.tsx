"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronLeft, Calendar, Users, DollarSign, Trash, Edit, UserPlus, Users2, CreditCard, PieChart, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import InviteMemberModal from "@/app/components/InviteMemberModal";
import { toast } from "sonner";

interface Member {
  id: string;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface Plan {
  id: string;
  name: string;
  cost: number;
  renewalFrequency: string;
  maxMembers: number;
  startDate: string;
  nextRenewalDate: string;
  logoUrl?: string;
  members: Member[];
  ownerId: string;
  owner: {
    name: string;
    email: string;
  };
}

export function PlanDetails({ id }: { id: string }) {
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
        console.log(`Fetching plan with ID: ${id}`);
        const response = await fetch(`/api/plans/${id}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          cache: 'no-store' // Disable caching to ensure fresh data
        });

        console.log(`Response status: ${response.status}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API error response: ${errorText}`);
          throw new Error(`Failed to fetch plan: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Plan data received:`, data);
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
  }, [id, status]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen p-4 bg-black">
        <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 text-white">
          <p className="font-medium mb-2">Unable to load plan details</p>
          <p className="text-sm text-white/80">{error || 'Failed to load plan details'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-800 hover:bg-red-700 rounded-md text-sm font-medium transition-colors"
            aria-label="Retry loading plan"
          >
            Retry
          </button>
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

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from this plan?`)) return;

    try {
      const response = await fetch(`/api/plans/members/${memberId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove member");

      // Refresh plan data to show updated member list
      const updatedPlan = await fetch(`/api/plans/${plan.id}`);
      if (!updatedPlan.ok) throw new Error("Failed to fetch updated plan");
      const data = await updatedPlan.json();
      setPlan(data);
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const handleInvitation = async (memberId: string, action: 'ACCEPT' | 'DECLINE') => {
    try {
      const response = await fetch(`/api/plans/invitations/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${action.toLowerCase()} invitation`);
      }

      // Refresh plan data
      const updatedPlan = await fetch(`/api/plans/${plan.id}`);
      if (!updatedPlan.ok) throw new Error("Failed to fetch updated plan");
      const data = await updatedPlan.json();
      setPlan(data);

      // Show success message
      toast.success(`Successfully ${action.toLowerCase()}ed invitation`);
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing invitation:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to ${action.toLowerCase()} invitation`);
    }
  };

  const isOwner = session?.user?.id === plan.ownerId;
  // Include owner in member count (owner + other members)
  const memberCount = (plan.members?.filter(member => member.status === 'ACCEPTED').length || 0) + 1;
  // Calculate cost per member with proper rounding to 2 decimal places
  const costPerMember = Number((plan.cost / memberCount).toFixed(2));

  // Calculate days until renewal
  const now = new Date();
  const renewalDate = new Date(plan.nextRenewalDate);
  const daysUntilRenewal = Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Get a category-based color for the header
  const getCategoryColor = (name: string) => {
    const categories: Record<string, string> = {
      'netflix': '#E50914',
      'spotify': '#1DB954',
      'hulu': '#1CE783',
      'disney': '#113CCF',
      'hbo': '#5822B4',
      'apple': '#A2AAAD',
      'amazon': '#FF9900',
      'youtube': '#FF0000',
      'paramount': '#0064FF',
      'peacock': '#000000',
      'streaming': '#FF6B81',
      'gaming': '#7B68EE',
      'fitness': '#00CED1',
      'news': '#4682B4',
      'music': '#1DB954',
      'productivity': '#4285F4',
    };
    
    const lowerName = name.toLowerCase();
    for (const [key, color] of Object.entries(categories)) {
      if (lowerName.includes(key)) {
        return color;
      }
    }
    
    // Default color if no match
    return '#FF6B81'; // Pink-ish color like in the image
  };

  const headerColor = getCategoryColor(plan.name);

  return (
    <div className="min-h-screen bg-black pb-28 overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-4 flex items-center sticky top-0 bg-black z-10">
        <button onClick={() => router.push('/dashboard')} className="mr-4 text-white hover:text-white/80 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-white">Plan Details</h1>
      </div>

      {/* Plan Info Card */}
      <div className="px-4 pb-4">
        <div className="relative overflow-hidden border border-[#323232] rounded-xl shadow-sm"
             style={{ background: '#1A1A1A' }}>
          {/* Colored Header */}
          <div className="w-full py-4 px-6 text-center" style={{ backgroundColor: headerColor }}>
            <h2 className="text-xl font-bold text-white">{plan.name}</h2>
          </div>
          
          {/* Subscription Cost */}
          <div className="py-6 px-6 text-center border-b border-[#323232]">
            <p className="text-[#A8A8A8] text-sm mb-1">Subscription Cost</p>
            <h3 className="text-4xl font-bold text-white mb-1">${plan.cost.toFixed(2)}</h3>
            <p className="text-[#A8A8A8] text-sm">per {plan.renewalFrequency.toLowerCase()}</p>
          </div>
          
          {/* Plan Details */}
          <div className="divide-y divide-[#323232]">
            {/* Next Renewal */}
            <div className="flex items-center px-6 py-4">
              <Calendar className="w-5 h-5 text-indigo-400 mr-3" />
              <div>
                <p className="text-white text-sm">Next renewal: {new Date(plan.nextRenewalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ({daysUntilRenewal} days)</p>
              </div>
            </div>
            
            {/* Members */}
            <div className="flex items-center px-6 py-4">
              <Users2 className="w-5 h-5 text-indigo-400 mr-3" />
              <div>
                <p className="text-white text-sm">Members: {memberCount}/{plan.maxMembers}</p>
              </div>
            </div>
            
            {/* Your Share */}
            <div className="flex items-center px-6 py-4">
              <CreditCard className="w-5 h-5 text-indigo-400 mr-3" />
              <div>
                <p className="text-white text-sm">Your share: <span className="font-medium">${costPerMember.toFixed(2)}</span> per {plan.renewalFrequency.toLowerCase()}</p>
              </div>
            </div>
            
            {/* Total Savings */}
            <div className="flex items-center px-6 py-4">
              <PieChart className="w-5 h-5 text-indigo-400 mr-3" />
              <div>
                <p className="text-white text-sm">You save: <span className="font-medium text-green-400">${(plan.cost - costPerMember).toFixed(2)}</span> per {plan.renewalFrequency.toLowerCase()}</p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="p-6 flex flex-col space-y-3">
            {isOwner && (
              <>
                <button 
                  onClick={() => router.push(`/plan/${plan.id}/edit`)}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Plan
                </button>
                <button 
                  onClick={handleDelete}
                  className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg flex items-center justify-center transition-colors"
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Delete Plan
                </button>
              </>
            )}
            {isOwner && memberCount < plan.maxMembers && (
              <button 
                onClick={() => setShowInviteModal(true)}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg flex items-center justify-center transition-colors"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Members Section */}
      <div className="px-4 pb-24">
        <h3 className="text-xl font-semibold text-white mb-4">Members</h3>
        <div className="bg-[#252525] border border-[#323232] rounded-xl overflow-hidden">
          <div className="divide-y divide-[#323232]">
            {/* Owner */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold mr-3">
                  {plan.owner.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-medium">{plan.owner.name}</p>
                  <p className="text-[#A8A8A8] text-sm">{plan.owner.email}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-blue-600/20 text-blue-400 text-xs font-medium rounded-full">
                Owner
              </span>
            </div>
            
            {/* Members */}
            {plan.members.filter(member => member.status === 'ACCEPTED').map(member => (
              <div key={member.id} className="flex items-center justify-between p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold mr-3">
                    {member.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium">{member.user.name}</p>
                    <p className="text-[#A8A8A8] text-sm">{member.user.email}</p>
                  </div>
                </div>
                {isOwner && (
                  <button 
                    onClick={() => handleRemoveMember(member.id, member.user.name)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    aria-label={`Remove ${member.user.name}`}
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            
            {/* Pending Invitations */}
            {plan.members.filter(member => member.status === 'PENDING').map(member => (
              <div key={member.id} className="flex items-center justify-between p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold mr-3">
                    {member.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium">{member.user.name}</p>
                    <p className="text-[#A8A8A8] text-sm">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="px-2.5 py-1 bg-yellow-600/20 text-yellow-400 text-xs font-medium rounded-full mr-3">
                    Pending
                  </span>
                  {isOwner ? (
                    <button 
                      onClick={() => handleRemoveMember(member.id, member.user.name)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      aria-label={`Cancel invitation to ${member.user.name}`}
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  ) : session?.user?.id === member.user.id && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleInvitation(member.id, 'ACCEPT')}
                        className="px-3 py-1 bg-[#8A68DD] text-white text-xs font-medium rounded-md hover:bg-[#7958C5] transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleInvitation(member.id, 'DECLINE')}
                        className="px-3 py-1 bg-[#252525] border border-[#323232] text-gray-300 text-xs font-medium rounded-md hover:bg-[#1E1E1E] transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Empty State */}
            {plan.members.length === 0 && (
              <div className="p-6 text-center">
                <Users className="w-12 h-12 mx-auto mb-3 text-[#A8A8A8]" />
                <p className="text-[#A8A8A8] mb-2">No members yet</p>
                {isOwner && memberCount < plan.maxMembers && (
                  <button 
                    onClick={() => setShowInviteModal(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg inline-flex items-center transition-colors"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Member
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Invite Member Modal */}
      {showInviteModal && (
        <InviteMemberModal 
          planId={plan.id} 
          onClose={() => setShowInviteModal(false)}
          onSuccess={handleInviteSuccess}
          isOpen={showInviteModal}
        />
      )}
    </div>
  );
} 