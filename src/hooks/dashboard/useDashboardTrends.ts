
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TrendPoint {
  date: string;
  value: number;
}

export interface DashboardTrends {
  branchTrend: TrendPoint[];
  lowStockTrend: TrendPoint[];
  requestsTrend: TrendPoint[];
  stockChecksTrend: TrendPoint[];
}

interface TrendData {
  day: string;
  count: number;
}

const defaultTrends: DashboardTrends = {
  branchTrend: [],
  lowStockTrend: [],
  requestsTrend: [],
  stockChecksTrend: []
};

export const useDashboardTrends = () => {
  const [trends, setTrends] = useState<DashboardTrends>(defaultTrends);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTrends = async () => {
    try {
      setIsLoading(true);
      
      // Fetch branch trend data
      const { data: branchData, error: branchError } = await supabase
        .rpc<TrendData>('get_branch_trend_data');
        
      if (branchError) {
        console.error('Error fetching branch trends:', branchError);
      }

      // Fetch low stock trend data
      const { data: lowStockData, error: lowStockError } = await supabase
        .rpc<TrendData>('get_low_stock_trend_data');
        
      if (lowStockError) {
        console.error('Error fetching low stock trends:', lowStockError);
      }

      // Fetch pending requests trend data
      const { data: requestsData, error: requestsError } = await supabase
        .rpc<TrendData>('get_pending_requests_trend_data');
        
      if (requestsError) {
        console.error('Error fetching requests trends:', requestsError);
      }

      // Fetch missing stock checks trend data
      const { data: stockChecksData, error: stockChecksError } = await supabase
        .rpc<TrendData>('get_missing_checks_trend_data');
        
      if (stockChecksError) {
        console.error('Error fetching stock checks trends:', stockChecksError);
      }

      // Transform the data for charts with null checks
      const branchTrend = branchData && Array.isArray(branchData) && branchData.length > 0 
        ? branchData.map(item => ({ 
            date: item.day, 
            value: item.count 
          }))
        : [];
      
      const lowStockTrend = lowStockData && Array.isArray(lowStockData) && lowStockData.length > 0 
        ? lowStockData.map(item => ({ 
            date: item.day, 
            value: item.count 
          }))
        : [];
      
      const requestsTrend = requestsData && Array.isArray(requestsData) && requestsData.length > 0 
        ? requestsData.map(item => ({ 
            date: item.day, 
            value: item.count 
          }))
        : [];
      
      const stockChecksTrend = stockChecksData && Array.isArray(stockChecksData) && stockChecksData.length > 0 
        ? stockChecksData.map(item => ({ 
            date: item.day, 
            value: item.count 
          }))
        : [];

      setTrends({
        branchTrend,
        lowStockTrend,
        requestsTrend,
        stockChecksTrend
      });
    } catch (error) {
      console.error('Error fetching dashboard trends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
    
    // No need to subscribe to realtime updates for trends
    // These are typically fetched on demand or on a timer
  }, []);

  return { trends, isLoading, refetch: fetchTrends };
};
