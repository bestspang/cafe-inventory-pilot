
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
      console.log('Fetching branches from stores table for user:', user.id);
      
      // Make sure we're querying the stores table with owner_id filter
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user.id)
        .order('name');
      
      if (error) {
        console.error('Error fetching stores:', error);
        throw error;
      }
      
      console.log('Fetched stores data:', data || []);
      setBranches(data || [] as Branch[]);
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
    } else {
      setBranches([]);
    }
  }, [user]);

  // Listen for realtime updates on the stores table
  useEffect(() => {
    if (!user) return;

    console.log('Setting up realtime subscription for stores table changes');
    const storesChannel = supabase
      .channel('stores_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'stores',
        filter: `owner_id=eq.${user.id}`
      }, (payload) => {
        console.log('Realtime update received for stores:', payload);
        fetchBranches();
      })
      .subscribe();

    return () => {
      console.log('Cleaning up stores subscription');
      supabase.removeChannel(storesChannel);
    };
  }, [user]);

  return {
    branches,
    isLoading,
    refetch: fetchBranches
  };
}
