"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronLeft, CreditCard, Users2, Clock, Calendar, RefreshCw, Link as LinkIcon } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  cost: number;
  renewalFrequency: string;
  maxMembers: number;
  startDate: string;
  logoUrl?: string;
}

export default function EditPlan({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCustomLogo, setIsCustomLogo] = useState(false);
  const [customLogoUrl, setCustomLogoUrl] = useState("");
  const [planData, setPlanData] = useState<Plan>({
    id: "",
    name: "",
    cost: 0,
    renewalFrequency: "monthly",
    maxMembers: 1,
    startDate: new Date().toISOString().split('T')[0],
    logoUrl: ""
  });

  useEffect(() => {
    async function fetchPlan() {
      try {
        const response = await fetch(`/api/plans/${params.id}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch plan');
        }

        const data = await response.json();
        setPlanData(data);
        
        // If the plan has a logo URL, check if it's from Clearbit or custom
        if (data.logoUrl) {
          const isClearbitLogo = data.logoUrl.includes('logo.clearbit.com');
          setIsCustomLogo(!isClearbitLogo);
          if (!isClearbitLogo) {
            setCustomLogoUrl(data.logoUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching plan:', error);
        setError('Failed to load plan details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlan();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Create a copy of planData with the custom logo URL if applicable
      const dataToSubmit = {
        ...planData,
        logoUrl: isCustomLogo ? customLogoUrl : planData.logoUrl
      };

      const response = await fetch(`/api/plans/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update plan');
      }

      router.push(`/plan/${params.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error updating plan:', error);
      setError(error instanceof Error ? error.message : 'Failed to update plan. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefreshLogo = async () => {
    if (!planData.name || planData.name.length < 2) {
      return;
    }

    try {
      const response = await fetch(`/api/logo-search?name=${encodeURIComponent(planData.name)}&refresh=true`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlanData(prev => ({ ...prev, logoUrl: data.logoUrl }));
        setIsCustomLogo(false);
        setCustomLogoUrl("");
      }
    } catch (error) {
      console.error('Error refreshing logo preview:', error);
    }
  };

  const toggleCustomLogo = () => {
    setIsCustomLogo(!isCustomLogo);
    if (!isCustomLogo) {
      // When switching to custom logo, initialize with current logo if available
      setCustomLogoUrl(planData.logoUrl || "");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center">
        <button onClick={() => router.back()} className="mr-4">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl text-black">Edit Plan</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Plan Name */}
        <div>
          <label htmlFor="planName" className="block text-lg text-black font-medium mb-2">
            Plan Name
          </label>
          <div className="relative">
            <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              id="planName"
              value={planData.name}
              onChange={(e) => setPlanData({ ...planData, name: e.target.value })}
              className="w-full text-black p-4 pl-12 bg-white rounded-xl border border-gray-200"
              placeholder="Enter plan name"
              required
              disabled={isSubmitting}
            />
          </div>
          
          {/* Logo Preview */}
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Logo:</span>
              <div className="flex space-x-2">
                {!isCustomLogo && (
                  <button 
                    type="button"
                    onClick={handleRefreshLogo}
                    className="text-xs text-blue-500 flex items-center"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" /> Try another logo
                  </button>
                )}
                <button 
                  type="button"
                  onClick={toggleCustomLogo}
                  className="text-xs text-blue-500"
                >
                  {isCustomLogo ? "Use automatic logo" : "Use custom logo URL"}
                </button>
              </div>
            </div>
            
            {isCustomLogo ? (
              <div className="flex items-start space-x-2">
                <div className="flex-grow">
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="url"
                      value={customLogoUrl}
                      onChange={(e) => setCustomLogoUrl(e.target.value)}
                      className="w-full text-sm text-black p-2 pl-8 bg-white rounded-lg border border-gray-200"
                      placeholder="Enter logo URL"
                    />
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {customLogoUrl ? (
                    <img 
                      src={customLogoUrl} 
                      alt="Custom logo preview" 
                      className="w-8 h-8 rounded object-contain bg-white p-1 border border-gray-200"
                      onError={(e) => {
                        // If image fails to load, show a placeholder
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // Prevent infinite loop
                        target.src = `https://ui-avatars.com/api/?name=${planData.name.charAt(0)}&background=random&color=fff&size=128`;
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded flex items-center justify-center bg-blue-500 text-white text-xs font-bold">
                      {planData.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                {planData.logoUrl ? (
                  <img 
                    src={planData.logoUrl} 
                    alt="Logo preview" 
                    className="w-8 h-8 rounded object-contain bg-white p-1 border border-gray-200"
                    onError={(e) => {
                      // If image fails to load, replace with a fallback
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // Prevent infinite loop
                      target.src = `https://ui-avatars.com/api/?name=${planData.name.charAt(0)}&background=random&color=fff&size=128`;
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded flex items-center justify-center bg-blue-500 text-white text-xs font-bold">
                    {planData.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs text-gray-400 ml-2">
                  (Logo automatically fetched based on plan name)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Cost */}
        <div>
          <label htmlFor="cost" className="block text-lg text-black font-medium mb-2">
            Cost
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              id="cost"
              value={planData.cost}
              onChange={(e) => setPlanData({ ...planData, cost: parseFloat(e.target.value) })}
              className="w-full text-black p-4 pl-8 bg-white rounded-xl border border-gray-200"
              placeholder="0.00"
              step="0.01"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Renewal Frequency */}
        <div>
          <label className="block text-lg text-black font-medium mb-2">
            Renewal Frequency
          </label>
          <div className="grid grid-cols-3 gap-2 bg-blue-100 p-1 rounded-xl">
            {["monthly", "quarterly", "yearly"].map((frequency) => (
              <button
                key={frequency}
                type="button"
                onClick={() => setPlanData({ ...planData, renewalFrequency: frequency })}
                className={`p-3 rounded-lg flex items-center justify-center gap-2 ${
                  planData.renewalFrequency === frequency
                    ? "bg-blue-500 text-white"
                    : "text-blue-500"
                }`}
                disabled={isSubmitting}
              >
                <Clock className="w-5 h-5" />
                <span className="capitalize">{frequency}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Maximum Members */}
        <div>
          <label htmlFor="maxMembers" className="block text-lg text-black font-medium mb-2">
            Maximum Members
          </label>
          <div className="relative">
            <Users2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="number"
              id="maxMembers"
              value={planData.maxMembers}
              onChange={(e) => setPlanData({ ...planData, maxMembers: parseInt(e.target.value) })}
              className="w-full text-black p-4 pl-12 bg-white rounded-xl border border-gray-200"
              placeholder="Enter maximum members"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-lg text-black font-medium mb-2">
            Start Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="date"
              id="startDate"
              value={planData.startDate}
              onChange={(e) => setPlanData({ ...planData, startDate: e.target.value })}
              className="w-full text-black p-4 pl-12 bg-white rounded-xl border border-gray-200"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-4 rounded-xl font-medium disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
} 