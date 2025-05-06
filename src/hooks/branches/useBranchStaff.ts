
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
      
      console.log('Fetching staff for branch:', branchId);
      
      const { data, error } = await supabase
        .from('store_staff')
        .select('*')
        .eq('branch_id', branchId)
        .order('staff_name');
        
      if (error) {
        console.error('Error fetching branch staff:', error);
        throw error;
      }
      
      console.log('Staff data received:', data);
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
    if (!user || !branchId || !staffName.trim()) {
      console.error('Cannot add staff: missing user, branch ID, or staff name');
      return false;
    }
    
    setIsAdding(true);
    console.group('Adding staff member');
    console.log('Branch ID:', branchId);
    console.log('Staff name:', staffName);
    
    try {
      // First, check if the user has permission to update this branch
      // This helps debug RLS issues
      const { data: branchCheck, error: branchError } = await supabase
        .from('branches')
        .select('id')
        .eq('id', branchId)
        .single();
        
      if (branchError) {
        console.error('User lacks permission to access this branch:', branchError);
        toast.error('Permission denied: You cannot modify this branch');
        return false;
      }
      
      // Now insert the staff member
      const { data, error } = await supabase
        .from('store_staff')
        .insert({
          branch_id: branchId,
          staff_name: staffName.trim()
        })
        .select();
        
      console.log('Insert response:', { data, error });
        
      if (error) {
        console.error('Database error adding staff member:', error);
        toast.error(`Failed to add staff member: ${error.message}`);
        return false;
      }
      
      if (data && data.length > 0) {
        console.log('Staff member added successfully:', data[0]);
        await fetchStaff(); // Refresh the staff list
        toast.success('Staff member added successfully');
        return true;
      } else {
        console.warn('No error but no data returned - possible RLS issue');
        toast.error('Failed to add staff member: Permission denied');
        return false;
      }
    } catch (error: any) {
      console.error('Unexpected error adding staff member:', error);
      toast.error(`Failed to add staff member: ${error?.message || 'Unknown error'}`);
      return false;
    } finally {
      setIsAdding(false);
      console.groupEnd();
    }
  };

  const deleteStaffMember = async (staffId: string) => {
    if (!user) return false;
    
    setIsDeleting(true);
    console.group('Deleting staff member');
    console.log('Staff ID:', staffId);
    
    try {
      const { error } = await supabase
        .from('store_staff')
        .delete()
        .eq('id', staffId);
        
      if (error) {
        console.error('Error removing staff member:', error);
        toast.error(`Failed to remove staff member: ${error.message}`);
        return false;
      }
      
      console.log('Staff member deleted successfully');
      await fetchStaff(); // Refresh staff list
      toast.success('Staff member removed');
      return true;
    } catch (error: any) {
      console.error('Error removing staff member:', error);
      toast.error(`Failed to remove staff member: ${error?.message || 'Unknown error'}`);
      return false;
    } finally {
      setIsDeleting(false);
      console.groupEnd();
    }
  };

  useEffect(() => {
    if (branchId) {
      console.log('useBranchStaff initialized with branch ID:', branchId);
      fetchStaff();
      
      // Subscribe to staff changes
      const channel = supabase
        .channel('branch_staff_changes')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'store_staff', filter: `branch_id=eq.${branchId}` },
            (payload) => {
              console.log('Store staff change detected:', payload);
              fetchStaff();
            }
        )
        .subscribe();
        
      return () => {
        console.log('Cleaning up staff subscription for branch:', branchId);
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
    deleteStaffMember,
    fetchStaff
  };
};
