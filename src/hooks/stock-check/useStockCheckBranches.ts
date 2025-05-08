
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
        if (!storeId) {
          setIsLoading(false);
          return;
        }
        
        // When storeId is provided, we're using the store context
        // so just fetch this specific store
        const { data, error } = await supabase
          .from('stores')
          .select('id, name')
          .eq('id', storeId);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setBranches(data);
          setSelectedBranch(data[0].id);
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
  }, [user, storeId, toast]);

  return {
    branches,
    selectedBranch,
    setSelectedBranch,
    isLoading
  };
};
