
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Branch } from '@/types/branch';

export const useBranchesData = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      setBranches(data as Branch[]);
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast({
        title: 'Error',
        description: 'Failed to load branches',
        variant: 'destructive'
      });
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
