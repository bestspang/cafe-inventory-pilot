
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useStores } from '@/context/StoresContext';

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
  const { stores } = useStores();
  const { toast } = useToast();

  useEffect(() => {
    const fetchBranchSnapshots = async () => {
      try {
        setIsLoading(true);
        
        if (!stores || stores.length === 0) {
          setIsLoading(false);
          setBranches([]);
          return;
        }
        
        // Process store data from context
        const snapshots = await Promise.all(stores.map(async store => {
          // Get inventory health
          const { data: inventoryData, error: inventoryError } = await supabase
            .from('branch_inventory')
            .select('on_hand_qty, reorder_pt')
            .eq('branch_id', store.id);
          
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
            .eq('branch_id', store.id)
            .eq('status', 'pending');
          
          if (requestsError) throw requestsError;
          
          // Get latest stock check date
          const { data: checksData, error: checksError } = await supabase
            .from('stock_checks')
            .select('checked_at')
            .eq('branch_id', store.id)
            .order('checked_at', { ascending: false })
            .limit(1);
          
          if (checksError) throw checksError;
          
          return {
            id: store.id,
            name: store.name,
            stockHealth,
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

    if (user && stores.length > 0) {
      fetchBranchSnapshots();
    }
    
    // Set up realtime subscriptions for branch snapshot updates
    const channels = stores.map(store => {
      return supabase
        .channel(`branch_inventory_updates_${store.id}`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'branch_inventory',
            filter: `branch_id=eq.${store.id}`
          }, 
          () => {
            fetchBranchSnapshots();
          }
        )
        .subscribe();
    });
      
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [user, stores, branchFilter, toast]);
  
  return { branches, isLoading };
};
