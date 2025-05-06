
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
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

      // Fetch low stock items count - using a temporary direct count instead of RPC
      // until the database function is created
      const { count: lowStockCount, error: lowStockError } = await supabase
        .from('branch_inventory')
        .select('*', { count: 'exact', head: true })
        .lt('on_hand_qty', 10); // Simplified low stock check
        
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

      // Fetch missing stock checks count - simplified version
      // until the database function is created
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - 7); // Consider checks missing if not done in last 7 days
      
      const { count: missingChecksCount, error: stockChecksError } = await supabase
        .from('branches')
        .select('id', { count: 'exact', head: true })
        .not('id', 'in', supabase
          .from('stock_checks')
          .select('branch_id')
          .gte('checked_at', currentDate.toISOString())
        );
        
      if (stockChecksError) {
        console.error('Error fetching missing checks count:', stockChecksError);
      }

      setMetrics({
        totalBranches: branchesCount || 0,
        lowStockItems: lowStockCount || 0,
        pendingRequests: requestsCount || 0,
        missingStockChecks: missingChecksCount || 0
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

  return { metrics, isLoading, refetch: fetchMetrics };
};
