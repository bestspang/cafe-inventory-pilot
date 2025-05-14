
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Branch } from '@/types/branch';
import { useStores } from '@/context/StoresContext';
import { useBranchesData } from '@/hooks/branches/useBranchesData';

export const useBranchCreate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { addStore } = useStores(); 
  const { refetch } = useBranchesData();

  const createBranch = async (branch: Partial<Branch>) => {
    if (!user) {
      toast.error('Authentication required to create a branch');
      return null;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Creating new branch with data:', branch);
      console.log('Current user ID:', user.id);
      
      const branchData = {
        name: branch.name,
        address: branch.address || null,
        timezone: branch.timezone || 'Asia/Bangkok',
        is_open: branch.is_open !== undefined ? branch.is_open : true,
        owner_id: user.id // Critical for RLS
      };
      
      console.log('Full branch data being sent:', branchData);
      
      // Make sure we're inserting into stores table with owner_id set
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .insert(branchData)
        .select('*')
        .single();
      
      if (storeError) {
        console.error('Store creation error:', storeError);
        toast.error(`Failed to create branch: ${storeError.message}`);
        return null;
      }
      
      console.log('Store created successfully:', storeData);
      
      // Add store to local state
      if (storeData) {
        addStore(storeData as Branch);
      }
      
      // Explicitly refresh the branches list
      await refetch();
        
      toast.success('Branch created successfully');
      return storeData as Branch;
    } catch (error: any) {
      console.error('Error creating branch:', error);
      toast.error('Failed to create branch');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createBranch
  };
};
