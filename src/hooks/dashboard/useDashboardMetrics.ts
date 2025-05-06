
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardMetrics {
  lowStockCount: number;
  pendingRequestsCount: number;
  missingChecksCount: number;
  totalBranchesCount: number;
  closedBranchesCount: number;
}

const defaultMetrics: DashboardMetrics = {
  lowStockCount: 0,
  pendingRequestsCount: 0,
  missingChecksCount: 0,
  totalBranchesCount: 0,
  closedBranchesCount: 0
};

export const useDashboardMetrics = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>(defaultMetrics);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      
      // Get low stock count
      const { data: lowStockData, error: lowStockError } = await supabase
        .from('branch_inventory')
        .select('*')
        .lt('on_hand_qty', 10);
        
      if (lowStockError) throw lowStockError;

      // Get pending requests count
      const { data: requestsData, error: requestsError } = await supabase
        .from('requests')
        .select('*')
        .eq('status', 'pending');
        
      if (requestsError) throw requestsError;

      // Get branches count
      const { data: branchesData, error: branchesError } = await supabase
        .from('branches')
        .select('*');
        
      if (branchesError) throw branchesError;

      // Get closed branches count
      const { data: closedBranchesData, error: closedBranchesError } = await supabase
        .from('branches')
        .select('*')
        .eq('is_open', false);
        
      if (closedBranchesError) throw closedBranchesError;

      // Use RPC for missing checks count
      type MissingChecksResponse = { count_missing_checks: number };
      const { data: missingChecksData, error: missingChecksError } = await supabase
        .rpc<MissingChecksResponse>('count_missing_checks');
        
      if (missingChecksError) {
        console.error('Error fetching missing checks:', missingChecksError);
        // Fallback: Just set a default value
        setMetrics({
          lowStockCount: lowStockData?.length || 0,
          pendingRequestsCount: requestsData?.length || 0,
          missingChecksCount: 0,
          totalBranchesCount: branchesData?.length || 0,
          closedBranchesCount: closedBranchesData?.length || 0
        });
        return;
      }
      
      setMetrics({
        lowStockCount: lowStockData?.length || 0,
        pendingRequestsCount: requestsData?.length || 0,
        missingChecksCount: missingChecksData?.count_missing_checks || 0,
        totalBranchesCount: branchesData?.length || 0,
        closedBranchesCount: closedBranchesData?.length || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    // Subscribe to changes
    const channel = supabase
      .channel('dashboard_metrics')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'branch_inventory' 
      }, () => fetchMetrics())
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'requests' 
      }, () => fetchMetrics())
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'branches' 
      }, () => fetchMetrics())
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'stock_checks' 
      }, () => fetchMetrics())
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { metrics, isLoading, refetch: fetchMetrics };
};
