
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
      // Query branches owned by the current user
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('owner_id', user.id)
        .order('name');
      
      if (error) throw error;
      
      setBranches(data || []);
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

    const channel = supabase
      .channel('branches_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'branches',
        filter: `owner_id=eq.${user.id}`
      }, () => {
        fetchBranches();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    branches,
    isLoading,
    refetch: fetchBranches
  };
}
