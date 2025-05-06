
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TrendData {
  branches: number[];
  lowStock: number[];
  requests: number[];
  stockChecks: number[];
  isLoading: boolean;
}

// Initialize with empty arrays for the charts
const initialTrendData = {
  branches: [],
  lowStock: [],
  requests: [],
  stockChecks: [],
  isLoading: true
};

export const useDashboardTrends = (): TrendData => {
  const [trendData, setTrendData] = useState<TrendData>(initialTrendData);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        // Fetch branch trend data (daily counts for last 14 days)
        const { data: branchTrend, error: branchError } = await supabase
          .rpc('get_branch_trend_data');
          
        if (branchError) throw branchError;
        
        // Fetch low stock trend
        const { data: lowStockTrend, error: lowStockError } = await supabase
          .rpc('get_low_stock_trend_data');
          
        if (lowStockError) throw lowStockError;
        
        // Fetch requests trend
        const { data: requestsTrend, error: requestsError } = await supabase
          .rpc('get_pending_requests_trend_data');
          
        if (requestsError) throw requestsError;
        
        // Fetch stock checks trend
        const { data: stockChecksTrend, error: stockChecksError } = await supabase
          .rpc('get_missing_checks_trend_data');
          
        if (stockChecksError) throw stockChecksError;
        
        // Process data for charts
        // If RPC functions are not available yet, we'll use mock data for now
        // These will be replaced with actual data once the RPCs are implemented
        
        // For now, we'll use the same 14-day pattern for all metrics
        const mockDataForDays = (baseValue = 5, variance = 2, days = 14) => {
          return Array.from({ length: days }, () => 
            Math.max(0, baseValue + Math.floor(Math.random() * variance * 2) - variance)
          );
        };
        
        setTrendData({
          branches: branchTrend?.map((item: any) => item.count) || mockDataForDays(4, 1, 14),
          lowStock: lowStockTrend?.map((item: any) => item.count) || mockDataForDays(12, 4, 14),
          requests: requestsTrend?.map((item: any) => item.count) || mockDataForDays(10, 5, 14),
          stockChecks: stockChecksTrend?.map((item: any) => item.count) || mockDataForDays(3, 2, 14),
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching trend data:', error);
        toast({
          title: "Failed to load chart data",
          description: "Using estimated trends for charts",
          variant: "destructive"
        });
        
        // Fallback to mock data on error
        setTrendData({
          branches: Array(14).fill(4),
          lowStock: [8, 10, 12, 15, 14, 12, 10, 8, 10, 12, 12, 12, 12, 10],
          requests: [3, 5, 7, 8, 10, 12, 15, 18, 15, 12, 10, 8, 10, 15],
          stockChecks: [1, 2, 3, 2, 1, 0, 0, 1, 2, 3, 3, 2, 2, 3],
          isLoading: false
        });
      }
    };

    fetchTrendData();
  }, [toast]);

  return trendData;
};
