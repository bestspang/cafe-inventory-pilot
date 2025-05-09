
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
        
        console.log('Fetching branches for stock check, user ID:', user.id);
        
        // When storeId is provided, fetch this specific store
        if (storeId) {
          const { data, error } = await supabase
            .from('stores')
            .select('*')
            .eq('id', storeId);
          
          if (error) {
            console.error('Error fetching specific store:', error);
            throw error;
          }
          
          if (data && data.length > 0) {
            console.log('Found specific store:', data);
            setBranches(data as Branch[]);
            setSelectedBranch(data[0].id);
          } else {
            console.log('No store found with ID:', storeId);
          }
        } else {
          // Otherwise fetch all branches for the current user
          const { data, error } = await supabase
            .from('stores')
            .select('*')
            .eq('owner_id', user.id)
            .order('name');
            
          if (error) {
            console.error('Error fetching stores for user:', error);
            throw error;
          }
          
          if (data && data.length > 0) {
            console.log('Found stores for user:', data);
            setBranches(data as Branch[]);
            setSelectedBranch(data[0].id);
          } else {
            console.log('No stores found for user:', user.id);
          }
        }
      } catch (error) {
        console.error('Error in useStockCheckBranches:', error);
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
