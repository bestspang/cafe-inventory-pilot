
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { Branch } from '@/types';

export const useBranchesData = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBranches = useCallback(async () => {
    try {
      setIsLoading(true);
      console.group('Fetching branches data');
      
      const { data, error, status } = await supabase
        .from('branches')
        .select('id, name, address, timezone, is_open, created_at, updated_at')
        .order('name');
        
      console.log('Branches fetch response:', { status, count: data?.length });
      
      if (error) {
        console.error('Error fetching branches:', error);
        toast.error(`Failed to load branches: ${error.message}`);
        return;
      }
      
      console.log('Branches fetched successfully, count:', data?.length);
      console.log('Branch data sample:', data?.slice(0, 2));
      
      setBranches(data as Branch[]);
    } catch (error: any) {
      console.error('Error fetching branches:', error);
      toast.error(`Failed to load branches: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      console.groupEnd();
    }
  }, []);

  useEffect(() => {
    console.log('useBranchesData hook initialized, fetching initial data...');
    fetchBranches();
    
    // Subscribe to changes
    const channel = supabase
      .channel('branches_changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'branches' },
          (payload) => {
            console.group('Branch change detected');
            console.log('Change type:', payload.eventType);
            console.log('Changed data:', payload.new);
            console.log('Refreshing branch list...');
            console.groupEnd();
            fetchBranches();
          }
      )
      .subscribe();
      
    console.log('Branches realtime subscription activated');
      
    return () => {
      console.log('Cleaning up branches subscription');
      supabase.removeChannel(channel);
    };
  }, [fetchBranches]);

  return { branches, isLoading, refetch: fetchBranches };
};
