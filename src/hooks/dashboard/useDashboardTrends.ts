import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TrendPoint {
  date: string;
  value: number;
}

export interface DashboardTrends {
  branchTrends: TrendPoint[];
  lowStockTrends: TrendPoint[];
  requestsTrends: TrendPoint[];
  stockChecksTrends: TrendPoint[];
}

const defaultTrends: DashboardTrends = {
  branchTrends: [],
  lowStockTrends: [],
  requestsTrends: [],
  stockChecksTrends: []
};

// Helper to generate sample trend data until database functions are available
const generateSampleTrendData = (days: number, min: number, max: number): TrendPoint[] => {
  const result: TrendPoint[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    result.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * (max - min + 1)) + min
    });
  }
  
  return result;
};

export const useDashboardTrends = () => {
  const [trends, setTrends] = useState<DashboardTrends>(defaultTrends);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTrends = async () => {
    try {
      setIsLoading(true);
      
      // Since the database functions aren't available yet, we'll generate sample data
      // These will be replaced with actual database function calls when available
      
      // Sample branch trend data (random growth)
      const branchTrendsData = generateSampleTrendData(7, 3, 12);
      
      // Sample low stock items trend (fluctuations)
      const lowStockTrendsData = generateSampleTrendData(7, 2, 8);
      
      // Sample pending requests trend (weekend peaks)
      const requestsTrendsData = generateSampleTrendData(7, 1, 15);
      
      // Sample missing stock checks trend (decreasing)
      const stockChecksTrendsData = generateSampleTrendData(7, 0, 5);
      
      // Update trend state with our generated data
      setTrends({
        branchTrends: branchTrendsData,
        lowStockTrends: lowStockTrendsData,
        requestsTrends: requestsTrendsData,
        stockChecksTrends: stockChecksTrendsData
      });
    } catch (error) {
      console.error('Error fetching dashboard trends:', error);
      // Keep sample data if fetch fails
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
    
    // We'll enable this when the actual database functions are available
    /*
    const channel = supabase
      .channel('dashboard-trends-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'branches' }, () => {
        fetchTrends();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
    */
  }, []);

  return { trends, isLoading, refetch: fetchTrends };
};
