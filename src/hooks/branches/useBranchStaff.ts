
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { StaffMember } from '@/types/branch';

export const useBranchStaff = (branchId?: string) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast: uiToast } = useToast();
  const { user } = useAuth();

  const fetchStaff = async () => {
    if (!branchId) {
      setStaff([]);
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('store_staff')
        .select('*')
        .eq('branch_id', branchId)
        .order('staff_name');
        
      if (error) throw error;
      
      setStaff(data as StaffMember[]);
    } catch (error) {
      console.error('Error fetching branch staff:', error);
      uiToast({
        title: 'Error',
        description: 'Failed to load staff members',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addStaffMember = async (staffName: string) => {
    if (!user || !branchId || !staffName.trim()) return false;
    
    setIsAdding(true);
    
    try {
      const { error } = await supabase
        .from('store_staff')
        .insert({
          branch_id: branchId,
          staff_name: staffName.trim()
        });
        
      if (error) throw error;
      
      toast.success('Staff member added successfully');
      return true;
    } catch (error) {
      console.error('Error adding staff member:', error);
      toast.error('Failed to add staff member');
      return false;
    } finally {
      setIsAdding(false);
    }
  };

  const deleteStaffMember = async (staffId: string) => {
    if (!user) return false;
    
    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from('store_staff')
        .delete()
        .eq('id', staffId);
        
      if (error) throw error;
      
      toast.success('Staff member removed');
      return true;
    } catch (error) {
      console.error('Error removing staff member:', error);
      toast.error('Failed to remove staff member');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (branchId) {
      fetchStaff();
      
      // Subscribe to staff changes
      const channel = supabase
        .channel('branch_staff_changes')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'store_staff', filter: `branch_id=eq.${branchId}` },
            () => {
              fetchStaff();
            }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [branchId]);

  return { 
    staff, 
    isLoading, 
    isAdding,
    isDeleting,
    addStaffMember,
    deleteStaffMember
  };
};
