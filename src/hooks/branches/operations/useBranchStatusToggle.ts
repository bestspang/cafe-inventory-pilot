
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Branch } from '@/types/branch';

export const useBranchStatusToggle = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

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
    toggleBranchStatus
  };
};
