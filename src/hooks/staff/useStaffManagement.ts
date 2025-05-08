import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Branch, StaffMember } from '@/types';
import { toast } from '@/hooks/use-toast';

export function useStaffManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [newStaff, setNewStaff] = useState({
    branchId: '',
    staffName: ''
  });
  
  // Fetch branches on component mount
  useEffect(() => {
    fetchBranches();
  }, []);
  
  // Fetch all staff members
  useEffect(() => {
    fetchAllStaff();
  }, []);
  
  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name, address, timezone, is_open, created_at, updated_at');
      
      if (error) throw error;
      
      if (data) {
        setBranches(data as Branch[]);
        if (data.length > 0) {
          setNewStaff(prev => ({ ...prev, branchId: data[0].id }));
        }
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch store locations',
        variant: 'destructive'
      });
    }
  };
  
  const fetchAllStaff = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('store_staff')
        .select('id, branch_id, staff_name, created_at, branches(name)')
        .order('staff_name', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        const formattedStaff = data.map(item => ({
          id: item.id,
          branchId: item.branch_id,
          staffName: item.staff_name,
          createdAt: item.created_at,
          branchName: item.branches?.name
        }));
        setStaffMembers(formattedStaff);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch staff members',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddStaff = async (staffData: { branchId: string; staffName: string }) => {
    if (!staffData.branchId || !staffData.staffName.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both branch and staff name',
        variant: 'destructive'
      });
      return false;
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('store_staff')
        .insert({
          branch_id: staffData.branchId,
          staff_name: staffData.staffName.trim()
        });
      
      if (error) throw error;
      
      toast({
        title: 'Staff Added',
        description: `${staffData.staffName} has been added successfully`
      });
      
      setNewStaff({
        branchId: staffData.branchId,
        staffName: ''
      });
      
      // Refresh staff list
      await fetchAllStaff();
      return true;
      
    } catch (error: any) {
      console.error('Error adding staff:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add staff member',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteStaff = async (staffId: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('store_staff')
        .delete()
        .eq('id', staffId);
      
      if (error) throw error;
      
      toast({
        title: 'Staff Removed',
        description: 'Staff member has been removed successfully'
      });
      
      // Refresh staff list
      await fetchAllStaff();
      return true;
      
    } catch (error: any) {
      console.error('Error removing staff:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove staff member',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch?.name || 'Unknown Branch';
  };
  
  return {
    isLoading,
    branches,
    staffMembers,
    newStaff,
    setNewStaff,
    fetchAllStaff,
    handleAddStaff,
    handleDeleteStaff,
    getBranchName
  };
}
