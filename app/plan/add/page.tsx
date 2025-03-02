"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronLeft, CreditCard, Users2, Clock, Calendar, RefreshCw, Link as LinkIcon, Home } from "lucide-react";

export default function AddPlan() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isCustomLogo, setIsCustomLogo] = useState(false);
  const [customLogoUrl, setCustomLogoUrl] = useState("");
  const [planData, setPlanData] = useState({
    name: "",
    cost: "",
    renewalFrequency: "monthly",
    maxMembers: "",
    startDate: new Date().toISOString().split('T')[0]
  });

  // Fetch logo preview when plan name changes
  useEffect(() => {
    const fetchLogoPreview = async () => {
      if (!planData.name || planData.name.length < 2 || isCustomLogo) {
        return;
      }

      try {
        const response = await fetch(`/api/logo-search?name=${encodeURIComponent(planData.name)}`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setLogoPreview(data.logoUrl);
        }
      } catch (error) {
        console.error('Error fetching logo preview:', error);
        setLogoPreview(null);
      }
    };

    // Debounce the logo fetch to avoid too many requests
    const timeoutId = setTimeout(fetchLogoPreview, 500);
    return () => clearTimeout(timeoutId);
  }, [planData.name, isCustomLogo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Create a copy of planData with the custom logo URL if applicable
      const dataToSubmit = {
        ...planData,
        logoUrl: isCustomLogo ? customLogoUrl : undefined
      };

      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create plan');
      }

      // Make sure we only proceed after confirming the response is OK
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Error creating plan:', error);
      setError(error instanceof Error ? error.message : 'Failed to create plan. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAndInvite = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      // Create a copy of planData with the custom logo URL if applicable
      const dataToSubmit = {
        ...planData,
        logoUrl: isCustomLogo ? customLogoUrl : undefined
      };

      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create plan');
      }

      // Make sure we parse the response data ONLY after confirming response is OK
      const plan = await response.json();
      
      // Make sure plan and plan.id exist before redirecting
      if (plan && plan.id) {
        router.push(`/plan/${plan.id}/invite`);
      } else {
        throw new Error('Invalid plan data received from server');
      }
    } catch (error) {
      console.error('Error creating plan:', error);
      setError(error instanceof Error ? error.message : 'Failed to create plan. Please try again.');
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
        setLogoPreview(data.logoUrl);
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
      setCustomLogoUrl(logoPreview || "");
    }
  };

  return (
    <div className="min-h-screen dashboard-bg">
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="mr-4 text-white">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white">Add New Plan</h1>
        </div>
        <button 
          onClick={() => router.push('/dashboard')}
          className="text-white/70 hover:text-white transition-colors"
        >
          <Home className="w-5 h-5" />
        </button>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="p-4 space-y-5 pb-24">
          {error && (
            <div className="bg-red-900/30 text-red-300 p-3 rounded-lg text-center border border-red-500/30 text-sm">
              {error}
            </div>
          )}

          {/* Plan Name and Logo Preview in a card */}
          <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#323232]">
            <div>
              <label htmlFor="planName" className="block text-sm text-white/80 font-medium mb-2">
                Plan Name
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  id="planName"
                  value={planData.name}
                  onChange={(e) => setPlanData({ ...planData, name: e.target.value })}
                  className="w-full text-white p-2.5 pl-9 bg-[#252525] rounded-md border border-[#323232] focus:border-[#8A68DD] focus:outline-none text-sm"
                  placeholder="Enter plan name"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              {/* Logo Preview */}
              {planData.name && (
                <div className="mt-3 bg-[#252525] p-3 rounded-md border border-[#323232]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Logo Preview</span>
                    <div className="flex space-x-2">
                      {!isCustomLogo && (
                        <button 
                          type="button"
                          onClick={handleRefreshLogo}
                          className="text-xs text-[#8A68DD] flex items-center hover:text-[#7958C5]"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" /> Try another
                        </button>
                      )}
                      <button 
                        type="button"
                        onClick={toggleCustomLogo}
                        className="text-xs text-[#8A68DD] hover:text-[#7958C5]"
                      >
                        {isCustomLogo ? "Use automatic" : "Use custom URL"}
                      </button>
                    </div>
                  </div>
                  
                  {isCustomLogo ? (
                    <div className="flex items-start space-x-2">
                      <div className="flex-grow">
                        <div className="relative">
                          <LinkIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                          <input
                            type="url"
                            value={customLogoUrl}
                            onChange={(e) => setCustomLogoUrl(e.target.value)}
                            className="w-full text-xs text-white p-1.5 pl-7 bg-[#1A1A1A] rounded-md border border-[#323232] focus:border-[#8A68DD] focus:outline-none"
                            placeholder="Enter logo URL"
                          />
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {customLogoUrl ? (
                          <img 
                            src={customLogoUrl} 
                            alt="Custom logo preview" 
                            className="w-8 h-8 rounded object-contain bg-white p-1 border border-[#323232]"
                            onError={(e) => {
                              // If image fails to load, show a placeholder
                              const target = e.target as HTMLImageElement;
                              target.onerror = null; // Prevent infinite loop
                              target.src = `https://ui-avatars.com/api/?name=${planData.name.charAt(0)}&background=random&color=fff&size=128`;
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded flex items-center justify-center bg-[#8A68DD] text-white text-xs font-bold">
                            {planData.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      {logoPreview ? (
                        <img 
                          src={logoPreview} 
                          alt="Logo preview" 
                          className="w-8 h-8 rounded object-contain bg-white p-1 border border-[#323232]"
                          onError={(e) => {
                            // If image fails to load, replace with a fallback
                            const target = e.target as HTMLImageElement;
                            target.onerror = null; // Prevent infinite loop
                            target.src = `https://ui-avatars.com/api/?name=${planData.name.charAt(0)}&background=random&color=fff&size=128`;
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded flex items-center justify-center bg-[#8A68DD] text-white text-xs font-bold">
                          {planData.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs text-gray-400 ml-2">
                        (Logo automatically fetched based on plan name)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Plan Details Card */}
          <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#323232]">
            <h3 className="text-sm font-medium text-white/80 mb-3">Plan Details</h3>
            
            {/* Cost */}
            <div className="mb-4">
              <label htmlFor="cost" className="block text-xs text-white/80 font-medium mb-1.5">
                Cost
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  id="cost"
                  value={planData.cost}
                  onChange={(e) => setPlanData({ ...planData, cost: e.target.value })}
                  className="w-full text-white p-2.5 pl-7 bg-[#252525] rounded-md border border-[#323232] focus:border-[#8A68DD] focus:outline-none text-sm"
                  placeholder="0.00"
                  step="0.01"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Renewal Frequency */}
            <div className="mb-4">
              <label className="block text-xs text-white/80 font-medium mb-1.5">
                Renewal Frequency
              </label>
              <div className="grid grid-cols-3 gap-2 bg-[#252525] p-1 rounded-md">
                {["monthly", "quarterly", "yearly"].map((frequency) => (
                  <button
                    key={frequency}
                    type="button"
                    onClick={() => setPlanData({ ...planData, renewalFrequency: frequency })}
                    className={`p-1.5 rounded-sm flex items-center justify-center gap-1 text-xs ${
                      planData.renewalFrequency === frequency
                        ? "bg-[#8A68DD] text-white"
                        : "text-[#8A68DD] hover:bg-[#1A1A1A]"
                    }`}
                    disabled={isSubmitting}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span className="capitalize">{frequency}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Maximum Members */}
            <div className="mb-4">
              <label htmlFor="maxMembers" className="block text-xs text-white/80 font-medium mb-1.5">
                Maximum Members
              </label>
              <div className="relative">
                <Users2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  id="maxMembers"
                  value={planData.maxMembers}
                  onChange={(e) => setPlanData({ ...planData, maxMembers: e.target.value })}
                  className="w-full text-white p-2.5 pl-9 bg-[#252525] rounded-md border border-[#323232] focus:border-[#8A68DD] focus:outline-none text-sm"
                  placeholder="Enter maximum members"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label htmlFor="startDate" className="block text-xs text-white/80 font-medium mb-1.5">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  id="startDate"
                  value={planData.startDate}
                  onChange={(e) => setPlanData({ ...planData, startDate: e.target.value })}
                  className="w-full text-white p-2.5 pl-9 bg-[#252525] rounded-md border border-[#323232] focus:border-[#8A68DD] focus:outline-none text-sm"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              type="submit"
              className="w-full bg-[#8A68DD] text-white py-2.5 rounded-md font-medium hover:bg-[#7958C5] transition-colors disabled:opacity-50 text-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Plan'}
            </button>
            <button
              type="button"
              onClick={handleSaveAndInvite}
              className="w-full bg-[#252525] text-[#8A68DD] py-2.5 rounded-md font-medium border border-[#8A68DD] hover:bg-[#2A2A2A] transition-colors disabled:opacity-50 text-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save & Invite Members'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}