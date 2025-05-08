
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Branch } from '@/types/branch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export function useBranchesData() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchBranches = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log('Fetching branches for user:', user.id);
      
      // Try fetching from stores table first (with owner_id)
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user.id)
        .order('name');
      
      if (!storesError && storesData && storesData.length > 0) {
        console.log('Fetched stores:', storesData);
        setBranches(storesData as Branch[]);
      } else {
        // Fallback to branches table
        const { data: branchesData, error: branchesError } = await supabase
          .from('branches')
          .select('id, name, address, timezone, is_open, created_at, updated_at')
          .order('name');
        
        if (branchesError) {
          console.error('Error fetching branches:', branchesError);
          throw branchesError;
        }
        
        // Add owner_id to match Branch type
        const branchesWithOwnerId = (branchesData || []).map(branch => ({
          ...branch,
          owner_id: user.id // Set current user as owner for all branches
        }));
        
        console.log('Fetched branches with added owner_id:', branchesWithOwnerId);
        setBranches(branchesWithOwnerId as Branch[]);
      }
    } catch (error: any) {
      console.error('Error fetching branches:', error);
      toast({
        title: 'Failed to load branches',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBranches();
    }
  }, [user]);

  // Listen for realtime updates
  useEffect(() => {
    if (!user) return;

    const branchesChannel = supabase
      .channel('branches_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'branches'
      }, () => {
        fetchBranches();
      })
      .subscribe();
      
    const storesChannel = supabase
      .channel('stores_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'stores'
      }, () => {
        fetchBranches();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(branchesChannel);
      supabase.removeChannel(storesChannel);
    };
  }, [user]);

  return {
    branches,
    isLoading,
    refetch: fetchBranches
  };
}
