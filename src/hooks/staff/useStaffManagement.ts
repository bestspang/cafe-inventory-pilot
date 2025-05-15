
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Branch, StaffMember } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useStaffManagement() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const [newStaff, setNewStaff] = useState<{
    staff_name: string;
    branch_id: string;
  }>({
    staff_name: '',
    branch_id: '',
  });
  
  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      // Ensure we properly cast the result to the Branch type
      const branchesWithOwner = data?.map(branch => ({
        ...branch,
        owner_id: branch.owner_id || '' // Add owner_id if missing
      })) || [];
      
      setBranches(branchesWithOwner as Branch[]);
      
      if (data && data.length > 0 && !newStaff.branch_id) {
        setNewStaff(prev => ({ ...prev, branch_id: data[0].id }));
      }
    } catch (error: any) {
      console.error('Error fetching branches:', error);
      toast({
        title: 'Error',
        description: 'Failed to load branches',
        variant: 'destructive',
      });
    }
  };
  
  const fetchAllStaff = async () => {
    try {
      setIsLoading(true);
      
      // Get all staff members with branch details
      const { data, error } = await supabase
        .from('store_staff')
        .select(`
          *,
          branches:branch_id (
            name
          )
        `);
        
      if (error) throw error;
      
      const formattedStaff: StaffMember[] = data.map(staff => ({
        id: staff.id,
        staff_name: staff.staff_name,
        branch_id: staff.branch_id,
        created_at: staff.created_at,
        branchName: staff.branches?.name
      }));
      
      setStaffMembers(formattedStaff);
    } catch (error: any) {
      console.error('Error fetching staff:', error);
      toast({
        title: 'Error',
        description: 'Failed to load staff members',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddStaff = async (staffData: {
    staff_name: string;
    branch_id: string;
  }) => {
    try {
      if (!staffData.staff_name || !staffData.branch_id) {
        toast({
          title: 'Missing information',
          description: 'Please provide a name and select a branch',
          variant: 'destructive',
        });
        return;
      }
      
      const { error } = await supabase
        .from('store_staff')
        .insert([{
          staff_name: staffData.staff_name,
          branch_id: staffData.branch_id
        }]);
        
      if (error) throw error;
      
      toast({
        title: 'Staff added',
        description: `${staffData.staff_name} has been added successfully`,
      });
      
      setNewStaff({
        staff_name: '',
        branch_id: staffData.branch_id,
      });
      
      fetchAllStaff();
    } catch (error: any) {
      console.error('Error adding staff:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add staff member',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteStaff = async (staffId: string) => {
    try {
      const { error } = await supabase
        .from('store_staff')
        .delete()
        .eq('id', staffId);
        
      if (error) throw error;
      
      toast({
        title: 'Staff removed',
        description: 'Staff member has been removed successfully',
      });
      
      fetchAllStaff();
    } catch (error: any) {
      console.error('Error deleting staff:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove staff member',
        variant: 'destructive',
      });
    }
  };
  
  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch?.name || 'Unknown branch';
  };
  
  useEffect(() => {
    fetchBranches();
    fetchAllStaff();
  }, []);
  
  return {
    branches,
    staffMembers,
    isLoading,
    newStaff,
    setNewStaff,
    handleAddStaff,
    handleDeleteStaff,
    getBranchName
  };
}
