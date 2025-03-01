"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Users, Bell, Settings, Calendar, Users2, Pencil, DollarSign, ChevronDown, ChevronUp, BarChart2 } from "lucide-react";
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
          credentials: 'include',  // Important: include credentials
          cache: 'no-store'        // Disable caching to ensure fresh data
        });
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          let errorMessage = 'Failed to fetch plans';
          try {
            const errorText = await response.text();
            console.error('Error response text:', errorText);
            
            // Try to parse as JSON if possible
            if (errorText) {
              try {
                const errorData = JSON.parse(errorText);
                console.error('Parsed error data:', errorData);
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
        console.log('Fetched plans:', data);
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
          else if (planNameLower.includes('disney')) {
            colors[plan.id] = '#0063e5'; // Disney+ blue
          }
          // For Apple services, use their brand color
          else if (planNameLower.includes('apple')) {
            colors[plan.id] = '#A2AAAD'; // Apple silver
          }
          // For YouTube, use their brand color
          else if (planNameLower.includes('youtube')) {
            colors[plan.id] = '#FF0000'; // YouTube red
          }
          // For HBO, use their brand color
          else if (planNameLower.includes('hbo')) {
            colors[plan.id] = '#5E2490'; // HBO purple
          }
          // For Hulu, use their brand color
          else if (planNameLower.includes('hulu')) {
            colors[plan.id] = '#1CE783'; // Hulu green
          }
          // Try to detect color from logo URL if it exists
          else if (plan.logoUrl) {
            // If the logo URL contains ui-avatars (fallback), extract the background color
            if (plan.logoUrl.includes('ui-avatars.com') && plan.logoUrl.includes('background=')) {
              const bgParam = plan.logoUrl.split('background=')[1].split('&')[0];
              colors[plan.id] = `#${bgParam}`;
            } 
            // For logos with specific services
            else if (plan.logoUrl.includes('amazon') && plan.logoUrl.includes('prime')) {
              colors[plan.id] = '#00A8E1'; // Amazon Prime Video blue
            }
            else if (plan.logoUrl.includes('amazon')) {
              colors[plan.id] = '#FF9900'; // Amazon orange
            }
            else if (plan.logoUrl.includes('airtel') || planNameLower.includes('telecom')) {
              colors[plan.id] = '#ED1C24'; // Default to red for telecom companies
            }
            // Otherwise use a fallback color based on the plan name
            else {
              const hash = plan.name.split('').reduce((acc, char) => {
                return char.charCodeAt(0) + ((acc << 5) - acc);
              }, 0);
              
              // Generate a vibrant color (avoiding too dark colors)
              const h = Math.abs(hash) % 360;
              const s = 70 + (Math.abs(hash) % 30); // 70-100%
              const l = 45 + (Math.abs(hash) % 15); // 45-60%
              
              colors[plan.id] = `hsl(${h}, ${s}%, ${l}%)`;
            }
          }
          // Generate a color based on the plan name for other services
          else {
            const hash = plan.name.split('').reduce((acc, char) => {
              return char.charCodeAt(0) + ((acc << 5) - acc);
            }, 0);
            
            // Generate a vibrant color (avoiding too dark colors)
            const h = Math.abs(hash) % 360;
            const s = 70 + (Math.abs(hash) % 30); // 70-100%
            const l = 45 + (Math.abs(hash) % 15); // 45-60%
            
            colors[plan.id] = `hsl(${h}, ${s}%, ${l}%)`;
          }
        });
        
        setPlanColors(colors);
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

  return (
    <div className="min-h-screen dashboard-bg">
      {/* Main Content */}
      <div className="p-4 pb-24">
        <h2 className="text-2xl font-bold text-white mb-6">My Plans</h2>
        
        {/* Simple Analytics Cards */}
        {status === "authenticated" && <DashboardAnalytics />}
        
        {/* Total Monthly Cost */}
        <div className="mb-8">
          <p className="text-[#A8A8A8] mb-1">My Monthly Share</p>
          <div className="flex items-center">
            <DollarSign className="w-10 h-10 text-violet-400 mr-2" strokeWidth={2.5} />
            <p className="text-5xl text-white font-bold tracking-tight">
              {totalMonthlyCost.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Subscription Cards */}
        <div className="space-y-4">
          {plans.length === 0 ? (
            <div className="text-center py-8 text-[#A8A8A8]">
              No plans yet. Click the + button to add one!
            </div>
          ) : (
            plans.map((plan) => {
              const primaryColor = getPlanColor(plan);
              const gradientStyle = {
                background: `linear-gradient(135deg, ${primaryColor} 0%, rgba(37, 37, 37, 0.98) 70%)`,
                borderColor: '#323232'
              };
              
              return (
                <div 
                  key={plan.id} 
                  onClick={() => router.push(`/plan/${plan.id}`)}
                  className="relative border border-[#323232] rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-all hover:translate-y-[-2px] overflow-hidden backdrop-blur-sm"
                  style={gradientStyle}
                >
                  {/* Subtle texture overlay - reduced opacity */}
                  <div className="absolute inset-0 opacity-3 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNjY2MiPjwvcmVjdD4KPC9zdmc+')]"></div>
                  
                  {/* Card content */}
                  <div className="relative z-10">
                    <div className="mb-2 flex justify-between items-center">
                      <div className="flex items-center">
                        {plan.logoUrl && (
                          <img 
                            src={plan.logoUrl} 
                            alt={`${plan.name} logo`}
                            className="w-8 h-8 rounded-md mr-3 object-contain bg-white/10 p-1"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.style.display = 'none';
                            }}
                          />
                        )}
                        <h3 className="text-xl text-white font-bold">{plan.name}</h3>
                      </div>
                      {!plan.isOwner && (
                        <span className="text-sm text-white/80 flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          Shared by {plan.owner.name}
                        </span>
                      )}
                    </div>
                    
                    {/* Rest of the card content */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <DollarSign className="w-6 h-6 text-white mr-1" strokeWidth={2} />
                        <p className="text-xl text-white font-bold tracking-tight">
                          {plan.cost.toFixed(2)}
                        </p>
                        <span className="text-white/70 ml-1">/monthly</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white/70">Your share</p>
                        <div className="flex items-center justify-end">
                          <DollarSign className="w-5 h-5 text-white mr-0.5" strokeWidth={2} />
                          <p className="text-lg text-white font-bold tracking-tight">
                            {Number((plan.cost / ((plan.members?.filter(member => member.status === 'ACCEPTED').length || 0) + 1)).toFixed(2))}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-white/70 mr-2" />
                        <span className="text-white/70">
                          Renews in <span className={plan.renewsIn <= 7 ? "text-red-300" : "text-green-300"}>{plan.renewsIn} days</span>
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Users2 className="w-5 h-5 text-white/70 mr-2" />
                        <span className="text-white/70">
                          {(plan.members?.filter(member => member.status === 'ACCEPTED').length || 0) + 1}/{plan.maxMembers} members
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-white/70 text-sm">
                      <span>Next renewal: {plan.renewalDate}</span>
                      <span>Started: {new Date(plan.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
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