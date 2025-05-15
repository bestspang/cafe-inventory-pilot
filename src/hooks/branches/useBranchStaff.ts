
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StaffMember } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useBranchStaff(branchId: string) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('store_staff')
        .select('*')
        .eq('branch_id', branchId);

      if (error) throw error;
      
      // Convert data to match StaffMember interface
      const formattedData: StaffMember[] = data.map(item => ({
        id: item.id,
        staff_name: item.staff_name,
        branch_id: item.branch_id,
        created_at: item.created_at
      }));
      
      setStaff(formattedData);
    } catch (error: any) {
      console.error('Error fetching staff members:', error);
      toast({
        title: 'Error fetching staff',
        description: error.message || 'Failed to load staff members',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addStaffMember = async (staffName: string) => {
    try {
      const { data, error } = await supabase
        .from('store_staff')
        .insert([{
          staff_name: staffName,
          branch_id: branchId
        }])
        .select('*')
        .single();

      if (error) throw error;
      
      toast({
        title: 'Staff member added',
        description: `${staffName} has been added to this branch`,
      });
      
      return true;
    } catch (error: any) {
      console.error('Error adding staff member:', error);
      toast({
        title: 'Error adding staff',
        description: error.message || 'Failed to add staff member',
        variant: 'destructive',
      });
      return false;
    }
  };
  
  const deleteStaffMember = async (staffId: string) => {
    try {
      const { error } = await supabase
        .from('store_staff')
        .delete()
        .eq('id', staffId);
      
      if (error) throw error;
      
      toast({
        title: 'Staff member removed',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error removing staff member:', error);
      toast({
        title: 'Error removing staff',
        description: error.message || 'Failed to remove staff member',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    if (branchId) {
      fetchStaff();
    }
  }, [branchId]);

  return {
    staff,
    isLoading,
    addStaffMember,
    deleteStaffMember,
    fetchStaff
  };
}
