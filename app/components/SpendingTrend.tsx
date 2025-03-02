import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface MonthlySpending {
  month: string;
  spending: number;
  savings: number;
}

export default function SpendingTrend() {
  const [monthlyData, setMonthlyData] = useState<MonthlySpending[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMonthlyData() {
      try {
        setIsLoading(true);
        
        // This would be replaced with an actual API call
        // For now, we'll generate mock data based on the current month
        const mockData = generateMockData();
        setMonthlyData(mockData);
      } catch (err) {
        console.error('Error fetching monthly spending data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load monthly spending data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMonthlyData();
  }, []);

  // Generate mock data for the last 6 months
  const generateMockData = (): MonthlySpending[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    
    // Generate data for the last 6 months
    const data: MonthlySpending[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12; // Handle wrapping around to previous year
      
      // Base spending between $200-$400
      const baseSpending = 200 + Math.random() * 200;
      
      // Savings between 10-30% of spending
      const savingsPercentage = 0.1 + Math.random() * 0.2;
      
      data.push({
        month: months[monthIndex],
        spending: parseFloat(baseSpending.toFixed(2)),
        savings: parseFloat((baseSpending * savingsPercentage).toFixed(2))
      });
    }
    
    return data;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-2 rounded-md text-xs border border-gray-700">
          <p className="text-gray-300 font-medium">{`${label}`}</p>
          <p className="text-blue-400">{`Spending: $${payload[0].value.toFixed(2)}`}</p>
          <p className="text-green-400">{`Savings: $${payload[1].value.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8A68DD]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-red-400 text-sm">Error loading data: {error}</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={monthlyData}
          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          barGap={2}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
          <XAxis 
            dataKey="month" 
            tick={{ fill: '#9ca3af', fontSize: 11 }} 
            axisLine={{ stroke: '#4b5563' }}
            tickLine={false}
            dy={10}
          />
          <YAxis 
            tick={{ fill: '#9ca3af', fontSize: 11 }} 
            axisLine={{ stroke: '#4b5563' }}
            tickFormatter={(value) => `$${value}`}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="spending" name="Spending" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={30} />
          <Bar dataKey="savings" name="Savings" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 