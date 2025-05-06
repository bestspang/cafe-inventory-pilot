import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface BranchSnapshot {
  id: string;
  name: string;
  stockHealth: number;
  pendingRequests: number;
  lastCheckDate?: string;
}

interface UseBranchSnapshotsProps {
  branchFilter?: 'all' | 'healthy' | 'at-risk';
}

interface UseBranchSnapshotsResult {
  branches: BranchSnapshot[];
  isLoading: boolean;
}

export const useBranchSnapshots = ({ 
  branchFilter = 'all' 
}: UseBranchSnapshotsProps = {}): UseBranchSnapshotsResult => {
  const [branches, setBranches] = useState<BranchSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchBranchSnapshots = async () => {
      try {
        setIsLoading(true);
        
        // First fetch branches
        let query = supabase
          .from('branches')
          .select(`
            id, 
            name
          `);
        
        // If user is not an owner, filter to show only their branch
        if (user?.role !== 'owner' && user?.branchId) {
          query = query.eq('id', user.branchId);
        }
        
        const { data: branchData, error: branchError } = await query;
        
        if (branchError) throw branchError;
        if (!branchData) throw new Error("No branch data returned");
        
        // For each branch, fetch inventory, requests, and last check data
        const snapshots = await Promise.all(branchData.map(async branch => {
          // Get inventory health
          const { data: inventoryData, error: inventoryError } = await supabase
            .from('branch_inventory')
            .select('on_hand_qty, reorder_pt')
            .eq('branch_id', branch.id);
          
          if (inventoryError) throw inventoryError;
          
          // Calculate stock health percentage
          const totalItems = inventoryData?.length || 0;
          const lowItems = inventoryData?.filter(i => i.on_hand_qty < i.reorder_pt).length || 0;
          
          // Health is 100% if no items, or calculated percentage
          const stockHealth = totalItems === 0 
            ? 100 
            : Math.round(((totalItems - lowItems) / totalItems) * 100);
          
          // Get pending requests count
          const { count: pendingRequests, error: requestsError } = await supabase
            .from('requests')
            .select('*', { count: 'exact', head: true })
            .eq('branch_id', branch.id)
            .eq('status', 'pending');
          
          if (requestsError) throw requestsError;
          
          // Get latest stock check date
          const { data: checksData, error: checksError } = await supabase
            .from('stock_checks')
            .select('checked_at')
            .eq('branch_id', branch.id)
            .order('checked_at', { ascending: false })
            .limit(1);
          
          if (checksError) throw checksError;
          
          return {
            id: branch.id,
            name: branch.name,
            stockHealth: stockHealth,
            pendingRequests: pendingRequests || 0,
            lastCheckDate: checksData && checksData.length > 0 ? checksData[0].checked_at : undefined
          };
        }));
        
        // Apply branch filter
        let filteredBranches = snapshots;
        
        if (branchFilter === 'healthy') {
          filteredBranches = snapshots.filter(branch => branch.stockHealth >= 70);
        } else if (branchFilter === 'at-risk') {
          filteredBranches = snapshots.filter(branch => branch.stockHealth < 70);
        }
        
        setBranches(filteredBranches);
      } catch (error) {
        console.error('Error fetching branch snapshots:', error);
        toast({
          title: "Failed to load branch data",
          description: "Please try again later",
          variant: "destructive"
        });
        setBranches([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchBranchSnapshots();
    }
    
    // Set up realtime subscriptions for branch snapshot updates
    const inventoryChannel = supabase
      .channel('branch_inventory_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'branch_inventory' }, 
        () => {
          fetchBranchSnapshots();
        }
      )
      .subscribe();
      
    const requestsChannel = supabase
      .channel('branch_requests_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'requests' }, 
        () => {
          fetchBranchSnapshots();
        }
      )
      .subscribe();
      
    const checksChannel = supabase
      .channel('branch_checks_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'stock_checks' }, 
        () => {
          fetchBranchSnapshots();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(inventoryChannel);
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(checksChannel);
    };
  }, [user, branchFilter, toast]);
  
  return { branches, isLoading };
};
