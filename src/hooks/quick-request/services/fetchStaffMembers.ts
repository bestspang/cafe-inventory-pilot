
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { StaffMember } from '@/types/quick-request';

export const fetchStaffMembers = async (branchId: string): Promise<StaffMember[]> => {
  if (!branchId) {
    console.warn('No branch ID provided for staff fetch');
    return [];
  }
  
  try {
    console.log(`Fetching staff for branch ${branchId}...`);
    
    const { data, error } = await supabase
      .from('store_staff')
      .select('id, branch_id, staff_name, created_at')
      .eq('branch_id', branchId);
    
    if (error) {
      console.error('Error fetching staff members:', error);
      throw error;
    }
    
    if (data) {
      console.log('Staff members loaded:', data.length, 'for branch:', branchId);
      const staff = data.map(item => ({
        id: item.id,
        branchId: item.branch_id,
        staffName: item.staff_name,
        createdAt: item.created_at
      }));
      return staff;
    }
  } catch (error) {
    console.error('Error fetching staff members:', error);
    toast({
      title: 'Error',
      description: 'Failed to fetch staff members',
      variant: 'destructive'
    });
  }
  return [];
};
