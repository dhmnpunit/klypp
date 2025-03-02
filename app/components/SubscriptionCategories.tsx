import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export default function SubscriptionCategories() {
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategoryData() {
      try {
        setIsLoading(true);
        
        // This would be replaced with an actual API call
        // For now, we'll generate mock data
        const mockData = generateMockData();
        setCategoryData(mockData);
      } catch (err) {
        console.error('Error fetching category data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load category data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategoryData();
  }, []);

  // Generate mock data for categories
  const generateMockData = (): CategoryData[] => {
    // Define common subscription categories with predefined colors
    return [
      { name: 'Entertainment', value: 120, color: '#8b5cf6' },
      { name: 'Productivity', value: 80, color: '#3b82f6' },
      { name: 'Education', value: 60, color: '#10b981' },
      { name: 'Social', value: 40, color: '#f59e0b' },
      { name: 'Utilities', value: 30, color: '#ef4444' }
    ];
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-2 rounded-md text-xs border border-gray-700">
          <p className="text-gray-300 font-medium">{`${payload[0].name}`}</p>
          <p style={{ color: payload[0].payload.color }}>{`$${payload[0].value.toFixed(2)} (${((payload[0].value / getTotalSpending()) * 100).toFixed(1)}%)`}</p>
        </div>
      );
    }
    return null;
  };

  const getTotalSpending = () => {
    return categoryData.reduce((total, category) => total + category.value, 0);
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text 
        x={x} 
        y={y} 
        fill="#fff" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
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
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="45%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={70}
            fill="#8884d8"
            dataKey="value"
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
            iconSize={8}
            iconType="circle"
            wrapperStyle={{ paddingTop: 20 }}
            formatter={(value, entry, index) => (
              <span className="text-xs text-gray-300">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
} 