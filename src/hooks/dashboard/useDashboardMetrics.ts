
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

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
  const [metrics, setMetrics] = useState<DashboardMetrics>(defaultMetrics);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      
      // Fetch branch count - Get total count of all branches
      const { count: branchCount, error: branchError } = await supabase
        .from('branches')
        .select('*', { count: 'exact', head: true });
        
      if (branchError) {
        console.error('Error fetching branch count:', branchError);
      }
      
      // Fetch low stock items count - don't filter by branch_id
      const { count: lowStockCount, error: lowStockError } = await supabase
        .from('branch_inventory')
        .select('*', { count: 'exact', head: true })
        .lt('on_hand_qty', 10); // Simplified low stock check
        
      if (lowStockError) {
        console.error('Error fetching low stock count:', lowStockError);
      }

      // Fetch pending requests count - don't filter by branch_id
      const { count: requestsCount, error: requestsError } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
        
      if (requestsError) {
        console.error('Error fetching requests count:', requestsError);
      }

      // Fetch missing stock checks count - don't filter by branch_id
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - 7); // Consider checks missing if not done in last 7 days
      
      const { count: missingChecksCount, error: stockChecksError } = await supabase
        .from('stock_checks')
        .select('id', { count: 'exact', head: true })
        .lt('checked_at', currentDate.toISOString());
        
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
    fetchMetrics();
    
    // Subscribe to changes on relevant tables that would affect metrics
    const channel = supabase
      .channel('dashboard-metrics-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'branch_inventory'
      }, () => {
        fetchMetrics();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'stock_checks'
      }, () => {
        fetchMetrics();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'requests'
      }, () => {
        fetchMetrics();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { metrics, isLoading, refetch: fetchMetrics };
};
