import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Package, Trash2, Info, Users, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface AnalyticsData {
  currentMonthSpending: number;
  planCount: number;
  totalSavings: number;
  canceledPlanCount: number;
  canceledPlanSavings?: number;
  sharedPlanSavings?: number;
  error?: string;
}

// Default values if analytics fail to load
const defaultAnalytics: AnalyticsData = {
  currentMonthSpending: 0,
  planCount: 0,
  totalSavings: 0,
  canceledPlanCount: 0,
  canceledPlanSavings: 0,
  sharedPlanSavings: 0
};

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showSavingsInfo, setShowSavingsInfo] = useState(false);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching analytics data... (attempt:', retryCount + 1, ')');
        
        const response = await fetch('/api/analytics', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          cache: 'no-store' // Prevent caching
        });
        
        console.log('Analytics response status:', response.status);
        
        // Always try to parse the response, even if status is not OK
        const data = await response.json();
        console.log('Analytics data received:', data);
        
        // Check if the response contains an error
        if (!response.ok || data.error) {
          // Set the error message but still use the data if available
          setError(data.error || 'Failed to fetch analytics');
          
          // If we have data despite the error, use it
          if (typeof data.currentMonthSpending === 'number') {
            setAnalytics({
              currentMonthSpending: data.currentMonthSpending,
              planCount: data.planCount || 0,
              totalSavings: data.totalSavings || 0,
              canceledPlanCount: data.canceledPlanCount || 0,
              canceledPlanSavings: data.canceledPlanSavings || 0,
              sharedPlanSavings: data.sharedPlanSavings || 0,
              error: data.error
            });
          } else if (retryCount > 0) {
            // Use default values if we've already retried
            setAnalytics(defaultAnalytics);
          }
          return;
        }
        
        // Validate the data
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid analytics data received');
        }
        
        // Use default values for any missing properties
        const validatedData: AnalyticsData = {
          currentMonthSpending: typeof data.currentMonthSpending === 'number' ? data.currentMonthSpending : 0,
          planCount: typeof data.planCount === 'number' ? data.planCount : 0,
          totalSavings: typeof data.totalSavings === 'number' ? data.totalSavings : 0,
          canceledPlanCount: typeof data.canceledPlanCount === 'number' ? data.canceledPlanCount : 0,
          canceledPlanSavings: typeof data.canceledPlanSavings === 'number' ? data.canceledPlanSavings : 0,
          sharedPlanSavings: typeof data.sharedPlanSavings === 'number' ? data.sharedPlanSavings : 0
        };
        
        setAnalytics(validatedData);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
        
        // Use default values if we've already retried
        if (retryCount > 0) {
          setAnalytics(defaultAnalytics);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalytics();
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const toggleSavingsInfo = () => {
    setShowSavingsInfo(!showSavingsInfo);
  };

  if (isLoading) {
    return (
      <div className="bg-white/5 dark:bg-gray-800/30 rounded-xl p-3 shadow-sm mb-4 animate-pulse">
        <div className="h-5 bg-gray-700/50 rounded w-3/4 mb-3"></div>
        <div className="h-8 bg-gray-700/50 rounded w-1/2 mb-2"></div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="bg-white/5 dark:bg-gray-800/30 rounded-xl p-3 shadow-sm mb-4">
        <p className="text-red-400 text-sm">Unable to load analytics: {error}</p>
        <button 
          onClick={handleRetry}
          className="mt-2 text-[#8A68DD] text-xs hover:text-[#A684FF]"
        >
          Try again
        </button>
      </div>
    );
  }

  // If we have an error but also have analytics (default values), show a warning
  const showErrorWarning = error && analytics;

  return (
    <div className="bg-white/5 dark:bg-gray-800/30 rounded-xl p-3 shadow-sm">
      {showErrorWarning && (
        <div className="mb-3 p-2 bg-yellow-900/10 rounded-lg text-xs text-yellow-400">
          Note: Using estimated data. {error}
          <button 
            onClick={handleRetry}
            className="ml-2 text-[#8A68DD] hover:text-[#A684FF]"
          >
            Retry
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-gray-800/30 p-2 rounded-lg">
          <div className="flex items-center mb-1">
            <DollarSign className="w-4 h-4 text-[#8A68DD] mr-1" />
            <span className="text-xs text-gray-300">This Month</span>
          </div>
          <p className="text-base font-bold text-white">
            ${analytics?.currentMonthSpending.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-gray-400">
            {analytics?.planCount || 0} plan{(analytics?.planCount || 0) !== 1 ? 's' : ''}
          </p>
        </div>
        
        <Link 
          href="/savings-logs" 
          className="bg-gray-800/30 p-2 rounded-lg hover:bg-gray-800/50 transition-colors block"
        >
          <div className="flex items-center mb-1">
            <TrendingUp className="w-4 h-4 text-[#8A68DD] mr-1" />
            <span className="text-xs text-gray-300 flex items-center">
              Savings
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleSavingsInfo();
                }}
                className="ml-1 text-gray-400 hover:text-gray-300"
              >
                <Info className="w-3 h-3" />
              </button>
            </span>
          </div>
          <p className="text-base font-bold text-white">
            ${analytics?.totalSavings.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-gray-400">
            shared & canceled
          </p>
        </Link>
      </div>
      
      {showSavingsInfo && (
        <div className="mb-3 p-2 bg-gray-800/30 rounded-lg text-xs text-gray-300">
          <div className="flex justify-between mb-1">
            <span>Shared Plans:</span>
            <span className="font-medium">${analytics?.sharedPlanSavings?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span>Canceled Plans:</span>
            <span className="font-medium">${analytics?.canceledPlanSavings?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="mt-2 text-center">
            <Link 
              href="/savings-logs" 
              className="text-[#8A68DD] hover:text-[#A684FF] inline-flex items-center text-xs"
            >
              View detailed savings
              <ExternalLink className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </div>
      )}
      
      {!showSavingsInfo && (analytics?.sharedPlanSavings || 0) > 0 && (analytics?.canceledPlanSavings || 0) > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2 bg-gray-800/30 rounded-lg flex items-center">
            <Users className="w-4 h-4 text-[#8A68DD] mr-1" />
            <div>
              <p className="text-xs text-gray-400">Shared Savings</p>
              <p className="text-sm font-medium text-white">${analytics?.sharedPlanSavings?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
          
          <div className="p-2 bg-gray-800/30 rounded-lg flex items-center">
            <Trash2 className="w-4 h-4 text-[#8A68DD] mr-1" />
            <div>
              <p className="text-xs text-gray-400">Canceled Savings</p>
              <p className="text-sm font-medium text-white">${analytics?.canceledPlanSavings?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 