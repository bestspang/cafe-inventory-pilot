
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useBranchDelete = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

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

  return {
    isLoading,
    deleteBranch
  };
};
