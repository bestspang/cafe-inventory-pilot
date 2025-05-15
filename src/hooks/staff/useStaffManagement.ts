
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Branch, StaffMember } from '@/types';

export const useStaffManagement = (initialBranchId?: string) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [newStaff, setNewStaff] = useState<{
    staff_name: string;
    branch_id: string;
  }>({
    staff_name: '',
    branch_id: initialBranchId || '',
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const { data, error } = await supabase
          .from('stores')  // Updated to use 'stores' instead of 'branches'
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        // Make sure each branch has an owner_id property
        const processedBranches: Branch[] = data?.map(branch => ({
          ...branch,
          owner_id: branch.owner_id || ''  // Ensure owner_id exists
        })) || [];
        
        setBranches(processedBranches);
        
        if (processedBranches.length > 0 && !newStaff.branch_id) {
          setNewStaff(prev => ({ ...prev, branch_id: processedBranches[0].id }));
        }
      } catch (error: any) {
        console.error('Error fetching branches:', error);
        toast({
          title: 'Failed to load branches',
          description: error.message || 'An unexpected error occurred',
          variant: 'destructive'
        });
      }
    };

    fetchBranches();
  }, [toast]);

  // Fetch staff for all branches
  useEffect(() => {
    const fetchStaff = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('store_staff')
          .select(`
            id,
            staff_name,
            branch_id,
            created_at,
            branches:branch_id (
              id,
              name
            )
          `)
          .order('staff_name');

        if (error) throw error;

        // Format the data to match our StaffMember type
        const mappedStaff: StaffMember[] = data.map((item: any) => ({
          id: item.id,
          staff_name: item.staff_name,
          branch_id: item.branch_id,
          created_at: item.created_at,
          branchName: item.branches?.name || 'Unknown Branch'
        }));

        setStaff(mappedStaff);
      } catch (error: any) {
        console.error('Error fetching staff:', error);
        toast({
          title: 'Failed to load staff members',
          description: error.message || 'An unexpected error occurred',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (branches.length > 0) {
      fetchStaff();
    }
  }, [branches, toast]);

  // Add a new staff member
  const handleAddStaff = async () => {
    if (!newStaff.staff_name || !newStaff.branch_id) {
      toast({
        title: 'Missing information',
        description: 'Please enter a name and select a branch',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('store_staff')
        .insert({
          staff_name: newStaff.staff_name,
          branch_id: newStaff.branch_id
        })
        .select('*, branches:branch_id (id, name)')
        .single();

      if (error) throw error;

      // Add the new staff member to the list
      const newStaffMember: StaffMember = {
        id: data.id,
        staff_name: data.staff_name,
        branch_id: data.branch_id,
        created_at: data.created_at,
        branchName: data.branches?.name || 'Unknown Branch'
      };

      setStaff(prev => [...prev, newStaffMember]);

      // Reset form
      setNewStaff(prev => ({ ...prev, staff_name: '' }));

      toast({
        title: 'Staff added',
        description: `${newStaff.staff_name} has been added successfully`
      });
    } catch (error: any) {
      console.error('Error adding staff:', error);
      toast({
        title: 'Failed to add staff member',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete staff member
  const handleDeleteStaff = async (staffId: string) => {
    if (!staffId) return;

    try {
      const { error } = await supabase
        .from('store_staff')
        .delete()
        .eq('id', staffId);

      if (error) throw error;

      // Remove the deleted staff member from the list
      setStaff(prev => prev.filter(s => s.id !== staffId));

      toast({
        title: 'Staff removed',
        description: 'Staff member has been removed successfully'
      });
    } catch (error: any) {
      console.error('Error deleting staff:', error);
      toast({
        title: 'Failed to remove staff member',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };

  return {
    branches,
    staff,
    newStaff,
    setNewStaff,
    isLoading,
    isSubmitting,
    handleAddStaff,
    handleDeleteStaff
  };
};
