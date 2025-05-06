import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardMetrics {
  totalBranches: number;
  lowStockItems: number;
  pendingRequests: number;
  missingStockChecks: number;
}

const defaultMetrics: DashboardMetrics = {
  totalBranches: 0,
  lowStockItems: 0,
  pendingRequests: 0,
  missingStockChecks: 0
};

export const useDashboardMetrics = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>(defaultMetrics);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      
      // Fetch total branches count
      interface BranchCountResult { count: number }
      const { data: branchesData, error: branchesError } = await supabase
        .from('branches')
        .select('*', { count: 'exact', head: true })
        .returns<BranchCountResult>();
        
      if (branchesError) {
        console.error('Error fetching branch count:', branchesError);
      }

      // Fetch low stock items count
      interface LowStockCountResult { count: number }
      const { data: lowStockData, error: lowStockError } = await supabase
        .rpc<LowStockCountResult>('get_low_stock_count');
        
      if (lowStockError) {
        console.error('Error fetching low stock count:', lowStockError);
      }

      // Fetch pending requests count
      interface RequestCountResult { count: number }
      const { data: requestsData, error: requestsError } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .returns<RequestCountResult>();
        
      if (requestsError) {
        console.error('Error fetching requests count:', requestsError);
      }

      // Fetch missing stock checks count
      interface StockCheckCountResult { count: number }
      const { data: missingChecksData, error: stockChecksError } = await supabase
        .rpc<StockCheckCountResult>('get_missing_checks_count');
        
      if (stockChecksError) {
        console.error('Error fetching missing checks count:', stockChecksError);
      }

      setMetrics({
        totalBranches: branchesData?.count || 0,
        lowStockItems: lowStockData?.count || 0,
        pendingRequests: requestsData?.count || 0,
        missingStockChecks: missingChecksData?.count || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    // Subscribe to changes on relevant tables that would affect metrics
    const channel = supabase
      .channel('dashboard-metrics-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'branches' }, () => {
        fetchMetrics();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_check_items' }, () => {
        fetchMetrics();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, () => {
        fetchMetrics();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { ...metrics, isLoading, refetch: fetchMetrics };
};
