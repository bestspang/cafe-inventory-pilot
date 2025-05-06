
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Branch } from '@/types';
import { StaffMember, QuickRequestIngredient } from '@/types/quick-request';

export const useQuickRequestData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [ingredients, setIngredients] = useState<QuickRequestIngredient[]>([]);

  // Fetch branches
  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('branches')
        .select('id, name');
      
      if (error) throw error;
      
      if (data) {
        console.log('Branches loaded:', data);
        setBranches(data);
        return data;
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch store locations',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
    return [];
  };
  
  // Fetch ingredients
  const fetchIngredients = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ingredients')
        .select('id, name, unit');
      
      if (error) throw error;
      
      if (data) {
        console.log('Ingredients loaded:', data.length);
        const ingredientsWithQuantity = data.map(ingredient => ({
          ...ingredient,
          quantity: 0
        }));
        
        setIngredients(ingredientsWithQuantity);
        return ingredientsWithQuantity;
      }
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch ingredients',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
    return [];
  };
  
  // Fetch staff members for a specific branch
  const fetchStaffMembers = async (branchId: string) => {
    if (!branchId) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('store_staff')
        .select('id, branch_id, staff_name, created_at')
        .eq('branch_id', branchId);
      
      if (error) throw error;
      
      if (data) {
        console.log('Staff members loaded:', data.length, 'for branch:', branchId);
        const staff = data.map(item => ({
          id: item.id,
          branchId: item.branch_id,
          staffName: item.staff_name,
          createdAt: item.created_at
        }));
        setStaffMembers(staff);
        return staff;
      }
    } catch (error) {
      console.error('Error fetching staff members:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch staff members',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
    return [];
  };

  // Load initial data on component mount
  useEffect(() => {
    fetchBranches();
    fetchIngredients();
  }, []);

  return {
    isLoading,
    setIsLoading,
    branches,
    staffMembers,
    ingredients,
    fetchBranches,
    fetchIngredients,
    fetchStaffMembers
  };
};
