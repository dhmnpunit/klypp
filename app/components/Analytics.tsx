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
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-6">
        <p className="text-red-500">Unable to load analytics: {error}</p>
        <button 
          onClick={handleRetry}
          className="mt-2 text-blue-500 text-sm hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  // If we have an error but also have analytics (default values), show a warning
  const showErrorWarning = error && analytics;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-6">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Spending Insights</h3>
      
      {showErrorWarning && (
        <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm text-yellow-700 dark:text-yellow-400">
          Note: Using estimated data. {error}
          <button 
            onClick={handleRetry}
            className="ml-2 text-blue-500 hover:underline"
          >
            Retry
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="flex items-center mb-2">
            <DollarSign className="w-5 h-5 text-blue-500 mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">This Month</span>
          </div>
          <p className="text-xl font-bold text-black dark:text-white">
            ${analytics?.currentMonthSpending.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            across {analytics?.planCount || 0} plan{(analytics?.planCount || 0) !== 1 ? 's' : ''}
          </p>
        </div>
        
        <Link 
          href="/savings-logs" 
          className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors block"
        >
          <div className="flex items-center mb-2">
            <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              Total Savings
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleSavingsInfo();
                }}
                className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Info className="w-3 h-3" />
              </button>
              <ExternalLink className="w-3 h-3 ml-1 text-gray-400" />
            </span>
          </div>
          <p className="text-xl font-bold text-black dark:text-white">
            ${analytics?.totalSavings.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            from shared & canceled plans
          </p>
        </Link>
      </div>
      
      {showSavingsInfo && (
        <div className="mb-4 p-2 bg-gray-50 dark:bg-gray-700/20 rounded-lg text-xs text-gray-600 dark:text-gray-400">
          <p className="mb-1">Your savings come from two sources:</p>
          <ul className="list-disc list-inside mb-2">
            <li>
              <span className="font-medium">Shared Plans:</span> ${analytics?.sharedPlanSavings?.toFixed(2) || '0.00'} saved by sharing costs with others
            </li>
            <li>
              <span className="font-medium">Canceled Plans:</span> ${analytics?.canceledPlanSavings?.toFixed(2) || '0.00'} saved from {analytics?.canceledPlanCount || 0} canceled plan{(analytics?.canceledPlanCount || 0) !== 1 ? 's' : ''}
            </li>
          </ul>
          <p>Savings calculation:</p>
          <ul className="list-disc list-inside">
            <li>For shared plans, we calculate the difference between the full cost and your share.</li>
            <li>For canceled plans, we count your portion of each plan's cost as savings.</li>
            <li>Canceled plan savings are estimated for the last 3 months.</li>
          </ul>
          <div className="mt-2 text-center">
            <Link 
              href="/savings-logs" 
              className="text-blue-500 hover:underline inline-flex items-center"
            >
              View detailed savings log
              <ExternalLink className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </div>
      )}
      
      {/* Savings breakdown in a more visual way */}
      {!showSavingsInfo && (analytics?.sharedPlanSavings || 0) > 0 && (analytics?.canceledPlanSavings || 0) > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-2 bg-gray-50 dark:bg-gray-700/20 rounded-lg flex items-center">
            <Users className="w-4 h-4 text-purple-500 mr-2" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Shared Plan Savings</p>
              <p className="text-sm font-medium">${analytics?.sharedPlanSavings?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
          
          <div className="p-2 bg-gray-50 dark:bg-gray-700/20 rounded-lg flex items-center">
            <Trash2 className="w-4 h-4 text-red-500 mr-2" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Canceled Plan Savings</p>
              <p className="text-sm font-medium">${analytics?.canceledPlanSavings?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>
      )}
      
      {(analytics?.totalSavings || 0) > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400 italic flex justify-between items-center">
          <span>You've saved ${analytics?.totalSavings.toFixed(2)} through sharing and canceling plans!</span>
          <Link 
            href="/savings-logs" 
            className="text-blue-500 hover:underline text-xs inline-flex items-center"
          >
            View details
            <ExternalLink className="w-3 h-3 ml-1" />
          </Link>
        </div>
      )}
    </div>
  );
} 