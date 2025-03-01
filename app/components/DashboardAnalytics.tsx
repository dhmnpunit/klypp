import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Info } from 'lucide-react';
import Link from 'next/link';

interface AnalyticsData {
  currentMonthSpending: number;
  planCount: number;
  totalSavings: number;
  error?: string;
}

// Default values if analytics fail to load
const defaultAnalytics: AnalyticsData = {
  currentMonthSpending: 0,
  planCount: 0,
  totalSavings: 0
};

export default function DashboardAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/analytics', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          cache: 'no-store' // Prevent caching
        });
        
        // Always try to parse the response, even if status is not OK
        const data = await response.json();
        
        // Check if the response contains an error
        if (!response.ok || data.error) {
          // Set the error message but still use the data if available
          setError(data.error || 'Failed to fetch analytics');
          
          // If we have data despite the error, use it
          if (typeof data.currentMonthSpending === 'number') {
            setAnalytics({
              currentMonthSpending: data.currentMonthSpending,
              planCount: data.planCount || 0,
              totalSavings: data.totalSavings || 0
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
          totalSavings: typeof data.totalSavings === 'number' ? data.totalSavings : 0
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-blue-900/20 p-3 rounded-lg animate-pulse">
          <div className="h-4 bg-blue-800/30 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-blue-800/30 rounded w-1/2 mb-1"></div>
        </div>
        <div className="bg-green-900/20 p-3 rounded-lg animate-pulse">
          <div className="h-4 bg-green-800/30 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-green-800/30 rounded w-1/2 mb-1"></div>
        </div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-blue-900/20 p-3 rounded-lg">
          <p className="text-xs text-red-400">Error loading data</p>
          <button 
            onClick={handleRetry}
            className="text-xs text-blue-400 hover:underline"
          >
            Retry
          </button>
        </div>
        <div className="bg-green-900/20 p-3 rounded-lg">
          <p className="text-xs text-red-400">Error loading data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <div className="bg-blue-900/20 p-3 rounded-lg">
        <div className="flex items-center mb-1">
          <DollarSign className="w-4 h-4 text-blue-400 mr-1" />
          <span className="text-xs text-gray-300">This Month</span>
        </div>
        <p className="text-xl font-bold text-white">
          ${analytics?.currentMonthSpending.toFixed(2) || '0.00'}
        </p>
        <p className="text-xs text-gray-400">
          {analytics?.planCount || 0} plan{(analytics?.planCount || 0) !== 1 ? 's' : ''}
        </p>
      </div>
      
      <Link 
        href="/insights" 
        className="bg-green-900/20 p-3 rounded-lg hover:bg-green-900/30 transition-colors block"
      >
        <div className="flex items-center mb-1">
          <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
          <span className="text-xs text-gray-300 flex items-center">
            Savings
            <Info className="w-3 h-3 ml-1 text-gray-500" />
          </span>
        </div>
        <p className="text-xl font-bold text-white">
          ${analytics?.totalSavings.toFixed(2) || '0.00'}
        </p>
        <p className="text-xs text-gray-400">
          shared & canceled
        </p>
      </Link>
    </div>
  );
} 