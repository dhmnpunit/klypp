'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Users, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface SavingsLog {
  id: string;
  name: string;
  cost: number;
  userShare: number;
  savedAmount: number;
  date: string;
  type: 'shared' | 'canceled';
  wasOwner?: boolean;
  isOwner?: boolean;
}

interface SavingsSummary {
  totalSavings: number;
  sharedPlanSavings: number;
  canceledPlanSavings: number;
}

export default function SavingsLogsPage() {
  const [logs, setLogs] = useState<SavingsLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SavingsSummary>({
    totalSavings: 0,
    sharedPlanSavings: 0,
    canceledPlanSavings: 0
  });

  useEffect(() => {
    async function fetchSavingsLogs() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/analytics/savings-logs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          cache: 'no-store'
        });
        
        const data = await response.json();
        console.log('Savings logs data:', data);
        
        if (!response.ok || data.error) {
          setError(data.error || 'Failed to fetch savings logs');
          if (data.logs && Array.isArray(data.logs)) {
            setLogs(data.logs);
          }
        } else if (data.logs && Array.isArray(data.logs)) {
          setLogs(data.logs);
          
          // Use summary from API if available
          if (data.summary) {
            setSummary({
              totalSavings: data.summary.totalSavings || 0,
              sharedPlanSavings: data.summary.sharedPlanSavings || 0,
              canceledPlanSavings: data.summary.canceledPlanSavings || 0
            });
          } else {
            // Calculate summary if not provided by API
            let sharedSavings = 0;
            let canceledSavings = 0;
            
            data.logs.forEach((log: SavingsLog) => {
              if (log.type === 'shared') {
                sharedSavings += log.savedAmount;
              } else {
                canceledSavings += log.savedAmount;
              }
            });
            
            setSummary({
              totalSavings: sharedSavings + canceledSavings,
              sharedPlanSavings: sharedSavings,
              canceledPlanSavings: canceledSavings
            });
          }
        }
      } catch (err) {
        console.error('Error fetching savings logs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load savings logs');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSavingsLogs();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center">
        <Link href="/dashboard" className="mr-4 text-blue-500 hover:text-blue-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Savings Details</h1>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-700 dark:text-red-400">
          Error: {error}
        </div>
      )}
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg shadow-sm">
          <div className="flex items-center mb-2">
            <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Savings</span>
          </div>
          <p className="text-2xl font-bold text-black dark:text-white">
            ${summary.totalSavings.toFixed(2)}
          </p>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg shadow-sm">
          <div className="flex items-center mb-2">
            <Users className="w-5 h-5 text-purple-500 mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Shared Plan Savings</span>
          </div>
          <p className="text-2xl font-bold text-black dark:text-white">
            ${summary.sharedPlanSavings.toFixed(2)}
          </p>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg shadow-sm">
          <div className="flex items-center mb-2">
            <Trash2 className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Canceled Plan Savings</span>
          </div>
          <p className="text-2xl font-bold text-black dark:text-white">
            ${summary.canceledPlanSavings.toFixed(2)}
          </p>
        </div>
      </div>
      
      {/* Detailed Logs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Detailed Savings Log</h2>
        
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        ) : logs.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 py-4">No savings logs available.</p>
        ) : (
          <div className="space-y-3">
            {logs.map(log => (
              <div 
                key={log.id} 
                className={`p-4 rounded-lg ${
                  log.type === 'shared' 
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-400' 
                    : 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400'
                }`}
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200 text-lg">{log.name}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400 mr-3">
                        {log.type === 'shared' ? 'Shared Plan' : 'Canceled Plan'}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {log.date}
                      </span>
                      {log.type === 'shared' && (
                        <span className="ml-3 text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                          {log.isOwner ? 'You are owner' : 'Member'}
                        </span>
                      )}
                      {log.type === 'canceled' && (
                        <span className="ml-3 text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                          {log.wasOwner ? 'You were owner' : 'Was member'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 md:mt-0 md:text-right">
                    <p className="font-medium text-green-600 dark:text-green-400 text-lg">
                      Saved: ${log.savedAmount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Full cost: ${log.cost.toFixed(2)} • Your share: ${log.userShare.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Savings are calculated based on your share of each plan's cost.</p>
        <p>For shared plans, we calculate the difference between the full cost and your share.</p>
        <p>For canceled plans, we count your portion of each plan's cost as savings.</p>
      </div>
    </div>
  );
} 