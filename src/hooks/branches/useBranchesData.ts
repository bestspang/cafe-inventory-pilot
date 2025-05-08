
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
      
      // Only fetch from stores table with owner_id filter
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('id, name, owner_id, address, timezone, is_open, created_at, updated_at')
        .eq('owner_id', user.id)
        .order('name');
      
      if (storesError) {
        console.error('Error fetching stores:', storesError);
        throw storesError;
      }
      
      console.log('Fetched stores:', storesData || []);
      setBranches(storesData || [] as Branch[]);
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

    // Only listen for changes to the stores table
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
      supabase.removeChannel(storesChannel);
    };
  }, [user]);

  return {
    branches,
    isLoading,
    refetch: fetchBranches
  };
}
