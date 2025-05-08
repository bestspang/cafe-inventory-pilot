
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
      
      // With RLS enabled, this will automatically filter to branches owned by the current user
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      console.log('Fetched branches:', data);
      setBranches(data as Branch[] || []);
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
        table: 'branches'
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
