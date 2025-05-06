
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface DashboardMetrics {
  totalBranches: number;
  lowStockItems: number;
  pendingRequests: number;
  missingStockChecks: number;
  isLoading: boolean;
}

// Define the correct response type for the missing checks RPC call
interface MissingChecksResponse {
  missing: number;
}

export const useDashboardMetrics = (): DashboardMetrics => {
  const [totalBranches, setTotalBranches] = useState(0);
  const [lowStockItems, setLowStockItems] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [missingStockChecks, setMissingStockChecks] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        setIsLoading(true);
        
        // Fetch total branches
        const { count: branchCount, error: branchError } = await supabase
          .from('branches')
          .select('*', { count: 'exact', head: true });

        if (branchError) throw branchError;
        setTotalBranches(branchCount || 0);
        
        // Fetch low stock items
        const { count: lowStockCount, error: lowStockError } = await supabase
          .from('branch_inventory')
          .select('*', { count: 'exact', head: true })
          .lt('on_hand_qty', 'reorder_pt');

        if (lowStockError) throw lowStockError;
        setLowStockItems(lowStockCount || 0);
        
        // Fetch pending requests
        const { count: pendingCount, error: pendingError } = await supabase
          .from('requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        if (pendingError) throw pendingError;
        setPendingRequests(pendingCount || 0);
        
        // Fetch missing stock checks - Fix by providing both type parameters
        const { data: missingChecksData, error: missingChecksError } = await supabase
          .rpc<MissingChecksResponse, {}>('count_missing_checks', {});

        if (missingChecksError) throw missingChecksError;
        if (missingChecksData) {
          setMissingStockChecks(missingChecksData.missing || 0);
        }
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        toast({
          title: "Failed to load dashboard metrics",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardMetrics();
    }

    // Set up realtime subscriptions for metrics updates
    const branchInventoryChannel = supabase
      .channel('branch_inventory_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'branch_inventory' }, 
        () => {
          fetchDashboardMetrics();
        }
      )
      .subscribe();
      
    const requestsChannel = supabase
      .channel('requests_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'requests' }, 
        () => {
          fetchDashboardMetrics();
        }
      )
      .subscribe();
      
    const stockChecksChannel = supabase
      .channel('stock_checks_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'stock_checks' }, 
        () => {
          fetchDashboardMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(branchInventoryChannel);
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(stockChecksChannel);
    };
  }, [user, toast]);
  
  return {
    totalBranches,
    lowStockItems,
    pendingRequests,
    missingStockChecks,
    isLoading
  };
};
