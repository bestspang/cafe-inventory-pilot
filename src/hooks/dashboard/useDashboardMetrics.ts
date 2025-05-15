
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
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
  const { user } = useAuth();
  const { stores } = useStores();
  const [metrics, setMetrics] = useState<DashboardMetrics>(defaultMetrics);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      
      if (!user || stores.length === 0) {
        setMetrics(defaultMetrics);
        return;
      }

      // Use the store IDs from context to filter data
      const storeIds = stores.map(store => store.id);
      
      // Fetch branch count - RLS will automatically filter to user's branches
      const branchCount = stores.length;
      
      // Fetch low stock items count - filtered by user's branches
      const { count: lowStockCount, error: lowStockError } = await supabase
        .from('branch_inventory')
        .select('*', { count: 'exact', head: true })
        .lt('on_hand_qty', 10) // Simplified low stock check
        .in('branch_id', storeIds);
        
      if (lowStockError) {
        console.error('Error fetching low stock count:', lowStockError);
      }

      // Fetch pending requests count - filtered by user's branches
      const { count: requestsCount, error: requestsError } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .in('branch_id', storeIds);
        
      if (requestsError) {
        console.error('Error fetching requests count:', requestsError);
      }

      // Fetch missing stock checks count - filtered by user's branches
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - 7); // Consider checks missing if not done in last 7 days
      
      const { count: missingChecksCount, error: stockChecksError } = await supabase
        .from('stock_checks')
        .select('id', { count: 'exact', head: true })
        .lt('checked_at', currentDate.toISOString())
        .in('branch_id', storeIds);
        
      if (stockChecksError) {
        console.error('Error fetching missing checks count:', stockChecksError);
      }

      setMetrics({
        totalBranches: branchCount || 0,
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
    if (user && stores.length > 0) {
      fetchMetrics();
    } else {
      setMetrics(defaultMetrics);
      setIsLoading(false);
    }
    
    // Subscribe to changes on relevant tables that would affect metrics
    if (!user || stores.length === 0) return;
    
    const storeIds = stores.map(store => store.id);
    
    const channels = [];
    
    // Add channel for branch_inventory changes
    const inventoryChannel = supabase
      .channel('dashboard-metrics-inventory')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'branch_inventory',
        filter: `branch_id=in.(${storeIds.join(',')})` 
      }, () => {
        fetchMetrics();
      })
      .subscribe();
    channels.push(inventoryChannel);
    
    // Add channel for stock_checks changes
    const checksChannel = supabase
      .channel('dashboard-metrics-checks')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'stock_checks',
        filter: `branch_id=in.(${storeIds.join(',')})` 
      }, () => {
        fetchMetrics();
      })
      .subscribe();
    channels.push(checksChannel);
    
    // Add channel for requests changes
    const requestsChannel = supabase
      .channel('dashboard-metrics-requests')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'requests',
        filter: `branch_id=in.(${storeIds.join(',')})` 
      }, () => {
        fetchMetrics();
      })
      .subscribe();
    channels.push(requestsChannel);
      
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [user, stores]);

  return { metrics, isLoading, refetch: fetchMetrics };
};
