
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useStores } from '@/context/StoresContext';

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
  const { currentStoreId } = useStores();
  const [metrics, setMetrics] = useState<DashboardMetrics>(defaultMetrics);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      
      if (!currentStoreId) {
        // If no store is selected, return default metrics
        return;
      }
      
      // Fetch branch count - if currentStoreId is provided, we just count 1
      const totalBranches = currentStoreId ? 1 : 0;
        
      // Fetch low stock items count - using branch_id filter
      const { count: lowStockCount, error: lowStockError } = await supabase
        .from('branch_inventory')
        .select('*', { count: 'exact', head: true })
        .eq('branch_id', currentStoreId)
        .lt('on_hand_qty', 10); // Simplified low stock check
        
      if (lowStockError) {
        console.error('Error fetching low stock count:', lowStockError);
      }

      // Fetch pending requests count - filtered by branch_id
      const { count: requestsCount, error: requestsError } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('branch_id', currentStoreId)
        .eq('status', 'pending');
        
      if (requestsError) {
        console.error('Error fetching requests count:', requestsError);
      }

      // Fetch missing stock checks count - filtered by branch_id
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - 7); // Consider checks missing if not done in last 7 days
      
      const { count: missingChecksCount, error: stockChecksError } = await supabase
        .from('stock_checks')
        .select('id', { count: 'exact', head: true })
        .eq('branch_id', currentStoreId)
        .lt('checked_at', currentDate.toISOString());
        
      if (stockChecksError) {
        console.error('Error fetching missing checks count:', stockChecksError);
      }
      
      // If we have a store selected but no stock check at all (not just old ones),
      // count that as 1 missing check
      let finalMissingChecksCount = missingChecksCount || 0;
      if (currentStoreId) {
        const { count: anyCheckExists, error: checkExistsError } = await supabase
          .from('stock_checks')
          .select('id', { count: 'exact', head: true })
          .eq('branch_id', currentStoreId);
          
        if (!anyCheckExists) {
          finalMissingChecksCount = 1;
        }
      }

      setMetrics({
        totalBranches,
        lowStockItems: lowStockCount || 0,
        pendingRequests: requestsCount || 0,
        missingStockChecks: finalMissingChecksCount
      });
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentStoreId) {
      fetchMetrics();
      
      // Subscribe to changes on relevant tables that would affect metrics
      const channel = supabase
        .channel('dashboard-metrics-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'branch_inventory',
          filter: `branch_id=eq.${currentStoreId}`
        }, () => {
          fetchMetrics();
        })
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'stock_check_items',
          filter: `branch_id=eq.${currentStoreId}`
        }, () => {
          fetchMetrics();
        })
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'requests',
          filter: `branch_id=eq.${currentStoreId}`
        }, () => {
          fetchMetrics();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentStoreId]);

  return { metrics, isLoading, refetch: fetchMetrics };
};
