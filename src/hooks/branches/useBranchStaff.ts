
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { StaffMember } from '@/types/branch';
import { useAuth } from '@/context/AuthContext';

export const useBranchStaff = (branchId: string) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  
  const fetchStaff = useCallback(async () => {
    if (!branchId) {
      console.warn('Cannot fetch staff: No branch ID provided');
      setStaff([]);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      console.log(`Fetching staff for branch ${branchId}`);
      
      const { data, error } = await supabase
        .from('store_staff')
        .select('*')
        .eq('branch_id', branchId)
        .order('staff_name');
      
      if (error) {
        console.error('Error fetching branch staff:', error);
        toast.error(`Failed to load staff: ${error.message}`);
        return;
      }
      
      // Transform the data to match our StaffMember type
      const transformedData: StaffMember[] = data.map(item => ({
        id: item.id,
        branchId: item.branch_id,
        staffName: item.staff_name,
        createdAt: item.created_at
      }));
      
      console.log(`Found ${transformedData.length} staff members`);
      setStaff(transformedData);
    } catch (error: any) {
      console.error('Error in fetchStaff:', error);
      toast.error(`Error loading staff: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [branchId]);
  
  // Fetch staff on mount and when branchId changes
  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);
  
  const addStaffMember = async (staffName: string): Promise<boolean> => {
    if (!branchId) {
      toast.error('Cannot add staff: No branch selected');
      return false;
    }
    
    if (!staffName.trim()) {
      toast.error('Staff name is required');
      return false;
    }
    
    if (!user) {
      toast.error('You must be logged in to add staff');
      return false;
    }
    
    try {
      setIsAdding(true);
      console.log(`Adding staff "${staffName}" to branch ${branchId}`);
      
      const { data, error } = await supabase
        .from('store_staff')
        .insert({
          branch_id: branchId,
          staff_name: staffName.trim()
        })
        .select();
      
      if (error) {
        console.error('Error adding staff member:', error);
        toast.error(`Failed to add staff: ${error.message}`);
        return false;
      }
      
      console.log('Staff member added successfully:', data);
      toast.success(`${staffName} added successfully`);
      
      // Refresh staff list
      await fetchStaff();
      
      return true;
    } catch (error: any) {
      console.error('Error in addStaffMember:', error);
      toast.error(`Error adding staff: ${error?.message || 'Unknown error'}`);
      return false;
    } finally {
      setIsAdding(false);
    }
  };
  
  const deleteStaffMember = async (staffId: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to delete staff');
      return false;
    }
    
    if (!staffId) {
      toast.error('No staff member selected to delete');
      return false;
    }
    
    try {
      setIsDeleting(true);
      console.log(`Deleting staff with ID ${staffId}`);
      
      const { error } = await supabase
        .from('store_staff')
        .delete()
        .eq('id', staffId);
      
      if (error) {
        console.error('Error deleting staff member:', error);
        toast.error(`Failed to delete staff: ${error.message}`);
        return false;
      }
      
      console.log('Staff member deleted successfully');
      toast.success('Staff member removed');
      
      // Refresh staff list
      await fetchStaff();
      
      return true;
    } catch (error: any) {
      console.error('Error in deleteStaffMember:', error);
      toast.error(`Error deleting staff: ${error?.message || 'Unknown error'}`);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };
  
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
