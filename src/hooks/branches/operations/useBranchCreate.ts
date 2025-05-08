
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
    if (!user) return null;
    
    setIsLoading(true);
    
    try {
      console.log('Creating new branch:', branch);
      console.log('Current user ID:', user.id);
      
      // Try creating in stores table first (with owner_id)
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .insert({
          name: branch.name,
          address: branch.address || null,
          timezone: branch.timezone || 'Asia/Bangkok',
          is_open: branch.is_open !== undefined ? branch.is_open : true,
          owner_id: user.id
        })
        .select()
        .single();
      
      if (!storeError && storeData) {
        console.log('Store created successfully:', storeData);
        
        // Log activity
        await supabase
          .from('branch_activity')
          .insert({
            branch_id: storeData.id,
            action: 'created',
            performed_by: user.id
          });
        
        addStore(storeData as Branch);
        refetch();
        toast.success('Branch created successfully');
        return storeData as Branch;
      }
      
      console.log('Failed to create in stores table, trying branches table');
      console.log('Store error:', storeError);
      
      // Fallback to branches table
      const { data: branchData, error: branchError } = await supabase
        .from('branches')
        .insert({
          name: branch.name,
          address: branch.address || null,
          timezone: branch.timezone || 'Asia/Bangkok', 
          is_open: branch.is_open !== undefined ? branch.is_open : true,
          // Note: branches table might not have owner_id column
        })
        .select()
        .single();
        
      if (branchError) {
        console.error('Branch creation error:', branchError);
        toast.error(`Failed to create branch: ${branchError.message}`);
        return null;
      }
      
      console.log('Branch created successfully:', branchData);
      
      // Add owner_id to match Branch type
      const branchWithOwnerId = {
        ...branchData,
        owner_id: user.id
      };
      
      // Log activity
      await supabase
        .from('branch_activity')
        .insert({
          branch_id: branchData.id,
          action: 'created',
          performed_by: user.id
        });
      
      // Add the new branch to the StoresContext
      addStore(branchWithOwnerId as Branch);
      
      // Explicitly refresh the branches list to ensure immediate UI update
      refetch();
        
      toast.success('Branch created successfully');
      return branchWithOwnerId as Branch;
    } catch (error) {
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
