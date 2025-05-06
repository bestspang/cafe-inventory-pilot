
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Branch } from '@/types/branch';

export const useBranchCreate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const createBranch = async (branch: Partial<Branch>) => {
    if (!user) return null;
    
    setIsLoading(true);
    
    try {
      console.log('Creating new branch:', branch);
      
      // Insert branch
      const { data: branchData, error: branchError } = await supabase
        .from('branches')
        .insert({
          name: branch.name,
          address: branch.address,
          timezone: branch.timezone || 'UTC',
          is_open: branch.is_open !== undefined ? branch.is_open : true
        })
        .select()
        .single();
        
      if (branchError) {
        console.error('Branch creation error:', branchError);
        toast.error(`Failed to create branch: ${branchError.message}`);
        return null;
      }
      
      console.log('Branch created successfully:', branchData);
      
      // Log activity
      await supabase
        .from('branch_activity')
        .insert({
          branch_id: branchData.id,
          action: 'created',
          performed_by: user.id
        });
        
      toast.success('Branch created successfully');
      return branchData;
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
