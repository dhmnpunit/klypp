"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, CreditCard, Users2, Clock, Calendar } from "lucide-react";

export default function AddPlan() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [planData, setPlanData] = useState({
    name: "",
    cost: "",
    renewalFrequency: "monthly",
    maxMembers: "",
    startDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(planData),
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
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(planData),
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center">
        <button onClick={() => router.back()} className="mr-4">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl text-black">Add new Plan</h1>
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
              className="w-full p-4 pl-12 bg-white rounded-xl border border-gray-200"
              placeholder="Enter plan name"
              required
              disabled={isSubmitting}
            />
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
              onChange={(e) => setPlanData({ ...planData, cost: e.target.value })}
              className="w-full p-4 pl-8 bg-white rounded-xl border border-gray-200"
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
              onChange={(e) => setPlanData({ ...planData, maxMembers: e.target.value })}
              className="w-full p-4 pl-12 bg-white rounded-xl border border-gray-200"
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
              className="w-full p-4 pl-12 bg-white rounded-xl border border-gray-200"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-4 rounded-xl font-medium disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={handleSaveAndInvite}
            className="w-full bg-white text-blue-500 py-4 rounded-xl font-medium border border-blue-500 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save & Invite'}
          </button>
        </div>
      </form>
    </div>
  );
}