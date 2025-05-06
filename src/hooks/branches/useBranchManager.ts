
import { useState } from 'react';
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

  const updateBranch = async (branch: Partial<Branch>) => {
    if (!user || !branch.id) {
      console.error('Update failed: Missing user or branch ID');
      return false;
    }
    
    setIsLoading(true);
    console.log('Updating branch with data:', branch);
    
    try {
      // Prepare update payload - only include fields that are provided
      const updatePayload: Record<string, any> = {};
      
      if (branch.name !== undefined) updatePayload.name = branch.name;
      if (branch.address !== undefined) updatePayload.address = branch.address;
      if (branch.timezone !== undefined) updatePayload.timezone = branch.timezone;
      if (branch.is_open !== undefined) updatePayload.is_open = branch.is_open;
      
      // Always include updated_at timestamp
      updatePayload.updated_at = new Date().toISOString();
      
      console.group('Supabase Update Request');
      console.log('Branch ID:', branch.id);
      console.log('Update payload:', updatePayload);
      
      // Update branch with explicit fields
      const { data, error: branchError, status, statusText } = await supabase
        .from('branches')
        .update(updatePayload)
        .eq('id', branch.id)
        .select();
        
      // Log everything about the response
      console.log('Status:', status, statusText);
      console.log('Response data:', data);
      console.log('Error:', branchError);
      console.groupEnd();
      
      if (branchError) {
        console.error('Branch update error:', branchError);
        toast.error(`Failed to update branch: ${branchError.message}`);
        return false;
      }
      
      if (!data || data.length === 0) {
        console.warn('Update succeeded but no data returned - possible RLS issue');
      }
      
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
    console.log('Deleting branch:', branchId);
    
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
        
      if (branchError) {
        console.error('Branch delete error:', branchError);
        throw branchError;
      }
      
      console.log('Branch deleted successfully');
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
      console.log(`Toggling branch status to ${newStatus ? 'open' : 'closed'}:`, branch.id);
      
      // Update status
      const { error: statusError } = await supabase
        .from('branches')
        .update({ 
          is_open: newStatus,
          updated_at: new Date().toISOString() 
        })
        .eq('id', branch.id);
        
      if (statusError) {
        console.error('Branch status update error:', statusError);
        throw statusError;
      }
      
      // Log activity
      await supabase
        .from('branch_activity')
        .insert({
          branch_id: branch.id,
          action,
          performed_by: user.id
        });
        
      console.log(`Branch ${action} successfully`);
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
