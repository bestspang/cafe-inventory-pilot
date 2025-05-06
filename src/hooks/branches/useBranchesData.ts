
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { Branch } from '@/types/branch';

export const useBranchesData = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching branches data...');
      
      const { data, error, status } = await supabase
        .from('branches')
        .select('*')
        .order('name');
        
      console.log('Branches fetch response:', { status, count: data?.length });
      
      if (error) {
        console.error('Error fetching branches:', error);
        toast.error(`Failed to load branches: ${error.message}`);
        return;
      }
      
      console.log('Branches fetched successfully:', data);
      setBranches(data as Branch[]);
    } catch (error: any) {
      console.error('Error fetching branches:', error);
      toast.error(`Failed to load branches: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    
    // Subscribe to changes
    const channel = supabase
      .channel('branches_changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'branches' },
          (payload) => {
            console.log('Branch change detected:', payload);
            fetchBranches();
          }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { branches, isLoading, refetch: fetchBranches };
};
