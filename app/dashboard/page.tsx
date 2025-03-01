"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Users, Calendar, Users2, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [planColors, setPlanColors] = useState<Record<string, string>>({});
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const plansPerPage = 6;
  const totalPages = Math.ceil(plans.length / plansPerPage);

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
          cache: 'no-store'
        });
        
        if (!response.ok) {
          let errorMessage = 'Failed to fetch plans';
          try {
            const errorText = await response.text();
            console.error('Error response text:', errorText);
            
            if (errorText) {
              try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.error || errorMessage;
              } catch (parseError) {
                console.error('Error parsing error response:', parseError);
              }
            }
          } catch (textError) {
            console.error('Error getting response text:', textError);
          }
          
          throw new Error(`${errorMessage}: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setPlans(data);
        
        // Extract and save colors for all plans
        const colors: Record<string, string> = {};
        data.forEach((plan: Plan) => {
          const planNameLower = plan.name.toLowerCase();
          
          // For Airtel, use their brand color
          if (planNameLower.includes('airtel')) {
            colors[plan.id] = '#ED1C24'; // Airtel red
          }
          // For Amazon Prime Video, use their brand color
          else if (planNameLower.includes('amazon prime') || 
                  (planNameLower.includes('amazon') && planNameLower.includes('video')) || 
                  planNameLower.includes('prime video')) {
            colors[plan.id] = '#00A8E1'; // Amazon Prime Video blue
          }
          // For Amazon services, use their brand color
          else if (planNameLower.includes('amazon') || planNameLower.includes('prime')) {
            colors[plan.id] = '#FF9900'; // Amazon orange
          }
          // For Spotify, use their brand color
          else if (planNameLower.includes('spotify')) {
            colors[plan.id] = '#1DB954'; // Spotify green
          }
          // For Netflix, use their brand color
          else if (planNameLower.includes('netflix')) {
            colors[plan.id] = '#E50914'; // Netflix red
          }
          // For Disney+, use their brand color
          else if (planNameLower.includes('disney') || planNameLower.includes('disney+')) {
            colors[plan.id] = '#0063E5'; // Disney+ blue
          }
          // For Hulu, use their brand color
          else if (planNameLower.includes('hulu')) {
            colors[plan.id] = '#1CE783'; // Hulu green
          }
          // For HBO, use their brand color
          else if (planNameLower.includes('hbo') || planNameLower.includes('max')) {
            colors[plan.id] = '#5822B4'; // HBO Max purple
          }
          // For YouTube, use their brand color
          else if (planNameLower.includes('youtube')) {
            colors[plan.id] = '#FF0000'; // YouTube red
          }
          // For Apple services, use their brand color
          else if (planNameLower.includes('apple')) {
            colors[plan.id] = '#A2AAAD'; // Apple silver
          }
          // For Microsoft services, use their brand color
          else if (planNameLower.includes('microsoft') || planNameLower.includes('xbox')) {
            colors[plan.id] = '#00A4EF'; // Microsoft blue
          }
          // For Google services, use their brand color
          else if (planNameLower.includes('google')) {
            colors[plan.id] = '#4285F4'; // Google blue
          }
          // Default color for other services
          else {
            // Generate a color based on the plan name
            const hash = plan.name.split('').reduce((acc, char) => {
              return char.charCodeAt(0) + ((acc << 5) - acc);
            }, 0);
            const h = Math.abs(hash) % 360;
            colors[plan.id] = `hsl(${h}, 70%, 50%)`;
          }
        });
        
        setPlanColors(colors);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching plans:', error);
        setIsLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchPlans();
    }
  }, [status, session]);

  // Calculate total monthly cost
  const totalMonthlyCost = plans.reduce((acc, plan) => {
    const memberCount = (plan.members?.filter(member => member.status === 'ACCEPTED').length || 0) + 1;
    const costPerMember = Number((plan.cost / memberCount).toFixed(2));
    return acc + costPerMember;
  }, 0);

  // Function to get the color for a plan with reduced saturation
  const getPlanColor = (plan: Plan) => {
    const baseColor = planColors[plan.id] || '#252525'; // Fallback to default color
    
    // If it's a hex color, convert to HSL to reduce saturation
    if (baseColor.startsWith('#')) {
      // Convert hex to RGB
      const r = parseInt(baseColor.slice(1, 3), 16) / 255;
      const g = parseInt(baseColor.slice(3, 5), 16) / 255;
      const b = parseInt(baseColor.slice(5, 7), 16) / 255;
      
      // Find max and min RGB components
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      
      // Calculate lightness
      const l = (max + min) / 2;
      
      // Calculate saturation
      let s = 0;
      if (max !== min) {
        s = l > 0.5 
          ? (max - min) / (2 - max - min) 
          : (max - min) / (max + min);
      }
      
      // Calculate hue
      let h = 0;
      if (max !== min) {
        if (max === r) {
          h = (g - b) / (max - min) + (g < b ? 6 : 0);
        } else if (max === g) {
          h = (b - r) / (max - min) + 2;
        } else {
          h = (r - g) / (max - min) + 4;
        }
        h *= 60;
      }
      
      // Reduce saturation by 50% and add transparency
      const newS = Math.max(0, s * 0.5);
      
      // Return HSL color with reduced saturation and transparency
      return `hsla(${Math.round(h)}, ${Math.round(newS * 100)}%, ${Math.round(l * 100)}%, 0.7)`;
    }
    
    // If it's already an HSL color, reduce saturation
    if (baseColor.startsWith('hsl')) {
      // Extract HSL values
      const hslMatch = baseColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
      if (hslMatch) {
        const h = parseInt(hslMatch[1]);
        const s = parseInt(hslMatch[2]);
        const l = parseInt(hslMatch[3]);
        
        // Reduce saturation by 50%
        const newS = Math.max(0, s * 0.5);
        
        // Return HSL color with reduced saturation and transparency
        return `hsla(${h}, ${Math.round(newS)}%, ${l}%, 0.7)`;
      }
    }
    
    // If we can't parse the color, just add some transparency
    return baseColor + 'B3'; // Add 70% opacity
  };

  // Get current page plans
  const getCurrentPagePlans = () => {
    const indexOfLastPlan = currentPage * plansPerPage;
    const indexOfFirstPlan = indexOfLastPlan - plansPerPage;
    return plans.slice(indexOfFirstPlan, indexOfLastPlan);
  };

  // Handle page navigation
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Group plans by renewal date proximity
  const groupPlansByRenewal = () => {
    const currentPlans = getCurrentPagePlans();
    const soonToRenew = currentPlans.filter(plan => plan.renewsIn <= 7);
    const upcomingRenewals = currentPlans.filter(plan => plan.renewsIn > 7 && plan.renewsIn <= 30);
    const laterRenewals = currentPlans.filter(plan => plan.renewsIn > 30);

    return {
      soonToRenew,
      upcomingRenewals,
      laterRenewals
    };
  };

  const { soonToRenew, upcomingRenewals, laterRenewals } = groupPlansByRenewal();

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
            <p className="text-5xl text-white font-bold tracking-tight">
              {totalMonthlyCost.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Subscription Cards */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : plans.length === 0 ? (
            <div className="text-center py-8 text-[#A8A8A8]">
              No plans yet. Click the + button to add one!
            </div>
          ) : (
          <>
            {/* Plans that renew soon */}
            {soonToRenew.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl text-red-300 font-semibold mb-4">Renewing Soon</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {soonToRenew.map(plan => (
                <div 
                  key={plan.id} 
                  onClick={() => router.push(`/plan/${plan.id}`)}
                      className="relative border border-[#323232] rounded-2xl p-6 shadow-sm cursor-pointer hover:shadow-md transition-all hover:translate-y-[-2px] overflow-hidden backdrop-blur-sm"
                      style={{
                        background: `linear-gradient(135deg, ${getPlanColor(plan)} 0%, rgba(37, 37, 37, 0.98) 70%)`,
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
                        {plan.logoUrl && (
                          <img 
                            src={plan.logoUrl} 
                            alt={`${plan.name} logo`}
                                  className="w-12 h-12 rounded-md mr-3 object-contain bg-white/10 p-1"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.style.display = 'none';
                            }}
                          />
                        )}
                              <div>
                                <h3 className="text-lg text-white font-bold leading-tight mb-1">{plan.name}</h3>
                      {!plan.isOwner && (
                                  <span className="text-sm text-white/50 flex items-center">
                                    <Users className="w-3.5 h-3.5 mr-1" />
                          Shared by {plan.owner.name}
                        </span>
                      )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-white/50 mb-1">{!plan.isOwner ? "Your share" : "Total cost"}</p>
                              <div className="flex items-center">
                                <DollarSign className="w-6 h-6 text-white mr-0.5" strokeWidth={2} />
                                <p className="text-2xl text-white font-bold tracking-tight">
                                  {!plan.isOwner 
                                    ? Number((plan.cost / ((plan.members?.filter(member => member.status === 'ACCEPTED').length || 0) + 1)).toFixed(2))
                                    : plan.cost.toFixed(2)
                                  }
                                </p>
                                <span className="text-white/50 ml-1 text-xs">/monthly</span>
                              </div>
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
              </div>
            )}

            {/* Upcoming renewals */}
            {upcomingRenewals.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl text-yellow-300 font-semibold mb-4">Upcoming Renewals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingRenewals.map(plan => (
                    <div 
                      key={plan.id} 
                      onClick={() => router.push(`/plan/${plan.id}`)}
                      className="relative border border-[#323232] rounded-2xl p-6 shadow-sm cursor-pointer hover:shadow-md transition-all hover:translate-y-[-2px] overflow-hidden backdrop-blur-sm"
                      style={{
                        background: `linear-gradient(135deg, ${getPlanColor(plan)} 0%, rgba(37, 37, 37, 0.98) 70%)`,
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
                              {plan.logoUrl && (
                                <img 
                                  src={plan.logoUrl} 
                                  alt={`${plan.name} logo`}
                                  className="w-12 h-12 rounded-md mr-3 object-contain bg-white/10 p-1"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.style.display = 'none';
                                  }}
                                />
                              )}
                              <div>
                                <h3 className="text-lg text-white font-bold leading-tight mb-1">{plan.name}</h3>
                                {!plan.isOwner && (
                                  <span className="text-sm text-white/50 flex items-center">
                                    <Users className="w-3.5 h-3.5 mr-1" />
                                    Shared by {plan.owner.name}
                                  </span>
                                )}
                              </div>
                      </div>
                      <div className="text-right">
                              <p className="text-xs text-white/50 mb-1">{!plan.isOwner ? "Your share" : "Total cost"}</p>
                              <div className="flex items-center">
                          <DollarSign className="w-5 h-5 text-white mr-0.5" strokeWidth={2} />
                                <p className="text-xl text-white font-bold tracking-tight">
                                  {!plan.isOwner 
                                    ? Number((plan.cost / ((plan.members?.filter(member => member.status === 'ACCEPTED').length || 0) + 1)).toFixed(2))
                                    : plan.cost.toFixed(2)
                                  }
                                </p>
                                <span className="text-white/50 ml-1 text-xs">/monthly</span>
                              </div>
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
              </div>
            )}

            {/* Later renewals */}
            {laterRenewals.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl text-green-300 font-semibold mb-4">Later Renewals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {laterRenewals.map(plan => (
                    <div 
                      key={plan.id} 
                      onClick={() => router.push(`/plan/${plan.id}`)}
                      className="relative border border-[#323232] rounded-2xl p-6 shadow-sm cursor-pointer hover:shadow-md transition-all hover:translate-y-[-2px] overflow-hidden backdrop-blur-sm"
                      style={{
                        background: `linear-gradient(135deg, ${getPlanColor(plan)} 0%, rgba(37, 37, 37, 0.98) 70%)`,
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
                              {plan.logoUrl && (
                                <img 
                                  src={plan.logoUrl} 
                                  alt={`${plan.name} logo`}
                                  className="w-12 h-12 rounded-md mr-3 object-contain bg-white/10 p-1"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.style.display = 'none';
                                  }}
                                />
                              )}
                              <div>
                                <h3 className="text-lg text-white font-bold leading-tight mb-1">{plan.name}</h3>
                                {!plan.isOwner && (
                                  <span className="text-sm text-white/50 flex items-center">
                                    <Users className="w-3.5 h-3.5 mr-1" />
                                    Shared by {plan.owner.name}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-white/50 mb-1">{!plan.isOwner ? "Your share" : "Total cost"}</p>
                              <div className="flex items-center">
                                <DollarSign className="w-5 h-5 text-white mr-0.5" strokeWidth={2} />
                                <p className="text-xl text-white font-bold tracking-tight">
                                  {!plan.isOwner 
                                    ? Number((plan.cost / ((plan.members?.filter(member => member.status === 'ACCEPTED').length || 0) + 1)).toFixed(2))
                                    : plan.cost.toFixed(2)
                                  }
                                </p>
                                <span className="text-white/50 ml-1 text-xs">/monthly</span>
                              </div>
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
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-4">
                <button 
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg ${currentPage === 1 ? 'bg-[#1A1A1A] text-gray-500' : 'bg-[#1A1A1A] text-white hover:bg-[#252525]'} border border-[#323232]`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-white">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg ${currentPage === totalPages ? 'bg-[#1A1A1A] text-gray-500' : 'bg-[#1A1A1A] text-white hover:bg-[#252525]'} border border-[#323232]`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
        </div>
            )}
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