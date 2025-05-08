
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useStockCheckBranches = (storeId?: string | null) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [branches, setBranches] = useState<{id: string, name: string}[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch available branches based on user role and current store
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        let query = supabase.from('stores').select('id, name');
        
        // Filter by current store if provided
        if (storeId) {
          query = query.eq('id', storeId);
        }
        // If user is not an owner, filter by their branch
        else if (user?.role !== 'owner' && user?.branchId) {
          query = query.eq('id', user.branchId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setBranches(data);
          // If no branch is selected or the user doesn't have access to the selected branch,
          // set the first available branch as selected
          if (!selectedBranch || (user?.role !== 'owner' && selectedBranch !== user.branchId)) {
            setSelectedBranch(data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
        toast({
          title: "Failed to load branches",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchBranches();
    }
  }, [user, storeId, selectedBranch, toast]);

  return {
    branches,
    selectedBranch,
    setSelectedBranch,
    isLoading
  };
};
