
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Branch } from '@/types/branch';
import { handleUpdate } from '@/utils/updateHandler';
import { toast } from '@/components/ui/sonner';

export const useBranchUpdate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const updateBranch = async (branch: Partial<Branch> & { id: string }, refreshFn?: () => Promise<void>) => {
    if (!user) {
      console.error('Update failed: Missing user');
      toast.error('Authentication required to update branch');
      return false;
    }

    if (!branch.id) {
      console.error('Update failed: Missing branch ID');
      toast.error('Branch ID is required for updates');
      return false;
    }
    
    setIsLoading(true);
    console.log('Updating branch with data:', branch);
    
    try {
      // Prepare update payload - only include fields that are provided
      const updatePayload: Partial<Branch> = {};
      
      if (branch.name !== undefined) updatePayload.name = branch.name;
      if (branch.address !== undefined) updatePayload.address = branch.address;
      if (branch.timezone !== undefined) updatePayload.timezone = branch.timezone;
      if (branch.is_open !== undefined) updatePayload.is_open = branch.is_open;
      
      // Use our generic update handler
      const { success, data, error } = await handleUpdate(
        'branches', 
        branch.id,
        updatePayload,
        refreshFn
      );
      
      if (!success) {
        throw error || new Error('Unknown error updating branch');
      }
      
      // Only log activity if update was successful
      if (success && data) {
        try {
          // Log activity on successful update
          await supabase
            .from('branch_activity')
            .insert({
              branch_id: branch.id,
              action: 'updated',
              performed_by: user.id
            });
        } catch (activityError) {
          // Don't fail the overall operation if activity logging fails
          console.error('Error logging branch activity:', activityError);
        }
      }
        
      return success;
    } catch (error) {
      console.error('Error updating branch:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    updateBranch
  };
};
