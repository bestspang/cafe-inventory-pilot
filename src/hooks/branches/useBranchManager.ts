
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Branch } from '@/types/branch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useBranchesData } from './useBranchesData';

interface BranchCreateValues {
  name: string;
  address?: string;
  timezone?: string;
}

interface BranchUpdateValues extends BranchCreateValues {
  id: string;
}

export function useBranchManager() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const createBranch = async (values: BranchCreateValues): Promise<Branch | null> => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to create a branch',
        variant: 'destructive'
      });
      return null;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('branches')
        .insert({
          name: values.name,
          address: values.address || null,
          timezone: values.timezone || 'UTC'
          // We don't set owner_id as it might not exist in DB
        })
        .select('*')
        .single();
      
      if (error) throw error;

      toast({
        title: 'Branch created',
        description: `${values.name} has been created successfully`
      });
      
      return data as Branch;
    } catch (error: any) {
      console.error('Error creating branch:', error);
      toast({
        title: 'Failed to create branch',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBranch = async (values: BranchUpdateValues): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('branches')
        .update({
          name: values.name,
          address: values.address || null,
          timezone: values.timezone || 'UTC'
        })
        .eq('id', values.id);
      
      if (error) throw error;

      toast({
        title: 'Branch updated',
        description: `${values.name} has been updated successfully`
      });
      return true;
    } catch (error: any) {
      console.error('Error updating branch:', error);
      toast({
        title: 'Failed to update branch',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBranch = async (id: string, branchName: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      toast({
        title: 'Branch deleted',
        description: `${branchName} has been deleted successfully`
      });
      return true;
    } catch (error: any) {
      console.error('Error deleting branch:', error);
      toast({
        title: 'Failed to delete branch',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBranchStatus = async (branch: Branch): Promise<boolean> => {
    setIsLoading(true);
    try {
      const newStatus = !branch.is_open;
      const { error } = await supabase
        .from('branches')
        .update({
          is_open: newStatus
        })
        .eq('id', branch.id);
      
      if (error) throw error;

      toast({
        title: branch.is_open ? 'Branch closed' : 'Branch opened',
        description: `${branch.name} has been ${branch.is_open ? 'closed' : 'opened'} successfully`
      });
      return true;
    } catch (error: any) {
      console.error('Error updating branch status:', error);
      toast({
        title: 'Failed to update branch status',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createBranch,
    updateBranch,
    deleteBranch,
    toggleBranchStatus,
    isLoading
  };
}
