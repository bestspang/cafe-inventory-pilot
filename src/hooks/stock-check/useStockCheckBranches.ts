import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Branch } from '@/types';

export const useStockCheckBranches = (storeId?: string | null) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch available branches based on user role and current store
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        if (!user) {
          setIsLoading(false);
          return;
        }
        
        // When storeId is provided, fetch this specific branch
        if (storeId) {
          const { data, error } = await supabase
            .from('branches')
            .select('id, name, address, timezone, is_open, created_at, updated_at')
            .eq('id', storeId);
          
          if (error) throw error;
          
          if (data && data.length > 0) {
            // Create objects that satisfy the Branch interface
            const typedData = data.map(branch => ({ ...branch, owner_id: undefined } as Branch));
            setBranches(typedData);
            setSelectedBranch(typedData[0].id);
          }
        } else {
          // Otherwise fetch all branches 
          const { data, error } = await supabase
            .from('branches')
            .select('id, name, address, timezone, is_open, created_at, updated_at')
            .order('name');
            
          if (error) throw error;
          
          if (data && data.length > 0) {
            // Create objects that satisfy the Branch interface
            const typedData = data.map(branch => ({ ...branch, owner_id: undefined } as Branch));
            setBranches(typedData);
            setSelectedBranch(typedData[0].id);
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
  }, [user, storeId, toast]);

  return {
    branches,
    selectedBranch,
    setSelectedBranch,
    isLoading
  };
};
