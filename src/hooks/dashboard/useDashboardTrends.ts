
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TrendItem {
  day: string;
  count: number;
}

interface DashboardTrends {
  branchTrend: TrendItem[];
  lowStockTrend: TrendItem[];
  requestsTrend: TrendItem[];
  stockChecksTrend: TrendItem[];
  isLoading: boolean;
}

const createMockTrendData = (days = 7): TrendItem[] => {
  return Array.from({ length: days }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - index - 1));
    
    return {
      day: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 10)
    };
  });
};

export const useDashboardTrends = (): DashboardTrends => {
  const [branchTrend, setBranchTrend] = useState<TrendItem[]>([]);
  const [lowStockTrend, setLowStockTrend] = useState<TrendItem[]>([]);
  const [requestsTrend, setRequestsTrend] = useState<TrendItem[]>([]);
  const [stockChecksTrend, setStockChecksTrend] = useState<TrendItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setIsLoading(true);
        
        // Branch trend
        const { data: branchData, error: branchError } = await supabase
          .rpc('get_branch_trend_data');

        if (branchError) throw branchError;
        
        // Low stock trend
        const { data: lowStockData, error: lowStockError } = await supabase
          .rpc('get_low_stock_trend_data');

        if (lowStockError) throw lowStockError;
        
        // Requests trend
        const { data: requestsData, error: requestsError } = await supabase
          .rpc('get_pending_requests_trend_data');
          
        if (requestsError) throw requestsError;
        
        // Stock checks trend
        const { data: stockChecksData, error: stockChecksError } = await supabase
          .rpc('get_missing_checks_trend_data');
          
        if (stockChecksError) throw stockChecksError;
        
        // Set data with type assertions, since we know the structure
        setBranchTrend(branchData as TrendItem[] || []);
        setLowStockTrend(lowStockData as TrendItem[] || []);
        setRequestsTrend(requestsData as TrendItem[] || []);
        setStockChecksTrend(stockChecksData as TrendItem[] || []);
        
      } catch (error) {
        console.error('Error fetching dashboard trends:', error);
        toast({
          title: "Failed to load trend data",
          description: "Using sample data instead",
          variant: "destructive"
        });
        
        // Use mock data as fallback
        setBranchTrend(createMockTrendData());
        setLowStockTrend(createMockTrendData());
        setRequestsTrend(createMockTrendData());
        setStockChecksTrend(createMockTrendData());
        
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrends();
    
    // Set up a realtime subscription for trends updates
    const trendsChannel = supabase
      .channel('trends_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'stock_checks' }, 
        () => fetchTrends()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'requests' }, 
        () => fetchTrends()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'branch_inventory' }, 
        () => fetchTrends()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(trendsChannel);
    };
  }, [toast]);
  
  return {
    branchTrend,
    lowStockTrend,
    requestsTrend,
    stockChecksTrend,
    isLoading
  };
};
