import { useEffect, useState } from 'react';
import { ArrowRight, DollarSign, Users, Trash2, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface SavingsOpportunity {
  id: string;
  type: 'share' | 'cancel' | 'downgrade';
  planName: string;
  currentCost: number;
  potentialSavings: number;
  description: string;
}

export default function SavingsOpportunities() {
  const [opportunities, setOpportunities] = useState<SavingsOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOpportunities() {
      try {
        setIsLoading(true);
        
        // This would be replaced with an actual API call
        // For now, we'll generate mock data
        const mockData = generateMockData();
        setOpportunities(mockData);
      } catch (err) {
        console.error('Error fetching savings opportunities:', err);
        setError(err instanceof Error ? err.message : 'Failed to load savings opportunities');
      } finally {
        setIsLoading(false);
      }
    }

    fetchOpportunities();
  }, []);

  // Generate mock data for savings opportunities
  const generateMockData = (): SavingsOpportunity[] => {
    return [
      {
        id: 'opp1',
        type: 'share',
        planName: 'Netflix Premium',
        currentCost: 19.99,
        potentialSavings: 14.99,
        description: 'Share with up to 3 more people to save 75% on your monthly cost.'
      },
      {
        id: 'opp2',
        type: 'downgrade',
        planName: 'Spotify Premium',
        currentCost: 9.99,
        potentialSavings: 4.99,
        description: 'Switch to Spotify Duo and save 50% if you only need 2 accounts.'
      },
      {
        id: 'opp3',
        type: 'cancel',
        planName: 'Adobe Creative Cloud',
        currentCost: 52.99,
        potentialSavings: 52.99,
        description: 'You haven\'t used this subscription in 3 months. Consider canceling.'
      }
    ];
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'share':
        return <Users className="w-4 h-4 text-[#8A68DD]" />;
      case 'cancel':
        return <Trash2 className="w-4 h-4 text-[#8A68DD]" />;
      case 'downgrade':
        return <RefreshCw className="w-4 h-4 text-[#8A68DD]" />;
      default:
        return <DollarSign className="w-4 h-4 text-[#8A68DD]" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-800/30 rounded-lg p-3 animate-pulse">
            <div className="h-4 bg-gray-700/50 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-700/50 rounded w-3/4 mb-1"></div>
            <div className="h-3 bg-gray-700/50 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-3">
        <p className="text-red-400 text-xs">Error loading data: {error}</p>
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-center">
        <DollarSign className="w-10 h-10 text-[#8A68DD] mb-2 opacity-50" />
        <p className="text-gray-400 text-xs">No savings opportunities found at this time.</p>
        <p className="text-gray-500 text-xs mt-1">We'll notify you when we find ways to save!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-3">
      {opportunities.map((opportunity) => (
        <div key={opportunity.id} className="bg-gray-800/20 rounded-lg p-3 hover:bg-gray-800/30 transition-colors">
          <div className="flex items-start">
            <div className="p-1.5 bg-gray-800/50 rounded-lg mr-3 flex-shrink-0">
              {getIconForType(opportunity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white text-sm font-medium truncate">{opportunity.planName}</h4>
              <p className="text-gray-400 text-xs mt-1 line-clamp-2">{opportunity.description}</p>
              <div className="flex justify-between items-center mt-2">
                <div className="text-[#8A68DD] text-sm font-medium">
                  Save ${opportunity.potentialSavings.toFixed(2)}/mo
                </div>
                <Link 
                  href={`/plan/${opportunity.id}`} 
                  className="text-xs text-[#8A68DD] hover:text-[#A684FF] flex items-center"
                >
                  Take action
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 