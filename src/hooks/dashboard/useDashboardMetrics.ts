
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
      const { count: branchesCount, error: branchesError } = await supabase
        .from('branches')
        .select('*', { count: 'exact', head: true });
        
      if (branchesError) {
        console.error('Error fetching branch count:', branchesError);
      }

      // Fetch low stock items count
      const { data: lowStockData, error: lowStockError } = await supabase
        .rpc('get_low_stock_count');
        
      if (lowStockError) {
        console.error('Error fetching low stock count:', lowStockError);
      }

      // Fetch pending requests count
      const { count: requestsCount, error: requestsError } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
        
      if (requestsError) {
        console.error('Error fetching requests count:', requestsError);
      }

      // Fetch missing stock checks count
      const { data: missingChecksData, error: stockChecksError } = await supabase
        .rpc('count_missing_checks');
        
      if (stockChecksError) {
        console.error('Error fetching missing checks count:', stockChecksError);
      }

      setMetrics({
        totalBranches: branchesCount || 0,
        lowStockItems: lowStockData?.count || 0,
        pendingRequests: requestsCount || 0,
        missingStockChecks: missingChecksData?.missing || 0
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
