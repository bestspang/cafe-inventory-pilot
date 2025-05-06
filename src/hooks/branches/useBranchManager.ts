
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Branch } from '@/types/branch';

export const useBranchManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const createBranch = async (branch: Partial<Branch>) => {
    if (!user) return null;
    
    setIsLoading(true);
    
    try {
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
        
      if (branchError) throw branchError;
      
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

  const updateBranch = async (branch: Partial<Branch>) => {
    if (!user || !branch.id) return false;
    
    setIsLoading(true);
    
    try {
      // Update branch
      const { error: branchError } = await supabase
        .from('branches')
        .update({
          name: branch.name,
          address: branch.address,
          timezone: branch.timezone
        })
        .eq('id', branch.id);
        
      if (branchError) throw branchError;
      
      // Log activity
      await supabase
        .from('branch_activity')
        .insert({
          branch_id: branch.id,
          action: 'updated',
          performed_by: user.id
        });
        
      toast.success('Branch updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating branch:', error);
      toast.error('Failed to update branch');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBranch = async (branchId: string) => {
    if (!user) return false;
    
    setIsLoading(true);
    
    try {
      // Log activity before deletion (otherwise we can't relate to the branch)
      await supabase
        .from('branch_activity')
        .insert({
          branch_id: branchId,
          action: 'deleted',
          performed_by: user.id
        });
      
      // Delete branch (cascade will handle related records)
      const { error: branchError } = await supabase
        .from('branches')
        .delete()
        .eq('id', branchId);
        
      if (branchError) throw branchError;
      
      toast.success('Branch deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting branch:', error);
      toast.error('Failed to delete branch');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBranchStatus = async (branch: Branch) => {
    if (!user) return false;
    
    setIsLoading(true);
    const newStatus = !branch.is_open;
    const action = newStatus ? 'reopened' : 'closed';
    
    try {
      // Update status
      const { error: statusError } = await supabase
        .from('branches')
        .update({ is_open: newStatus })
        .eq('id', branch.id);
        
      if (statusError) throw statusError;
      
      // Log activity
      await supabase
        .from('branch_activity')
        .insert({
          branch_id: branch.id,
          action,
          performed_by: user.id
        });
        
      toast.success(`Branch ${action} successfully`);
      return true;
    } catch (error) {
      console.error(`Error ${action} branch:`, error);
      toast.error(`Failed to ${action} branch`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createBranch,
    updateBranch,
    deleteBranch,
    toggleBranchStatus
  };
};
