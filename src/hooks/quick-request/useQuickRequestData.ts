
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
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');

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
  
  // Fetch ingredients with stock information if a branch is selected
  const fetchIngredients = async (branchId?: string) => {
    try {
      setIsLoading(true);
      
      // First get all ingredients
      const { data: ingredientsData, error: ingredientsError } = await supabase
        .from('ingredients')
        .select('id, name, unit');
      
      if (ingredientsError) throw ingredientsError;
      
      if (ingredientsData) {
        console.log('Ingredients loaded:', ingredientsData.length);
        
        let ingredientsWithQuantity: QuickRequestIngredient[] = ingredientsData.map(ingredient => ({
          ...ingredient,
          quantity: 0
        }));
        
        // If branch is selected, fetch stock levels
        if (branchId) {
          const { data: stockData, error: stockError } = await supabase
            .from('branch_inventory')
            .select('ingredient_id, on_hand_qty, reorder_pt')
            .eq('branch_id', branchId);
          
          if (stockError) {
            console.error('Error fetching stock levels:', stockError);
          } else if (stockData) {
            // Create map of stock data
            const stockMap = new Map();
            stockData.forEach(item => {
              stockMap.set(item.ingredient_id, {
                onHandQty: item.on_hand_qty,
                reorderPt: item.reorder_pt
              });
            });
            
            // Enrich ingredients with stock data
            ingredientsWithQuantity = ingredientsWithQuantity.map(ing => {
              const stockInfo = stockMap.get(ing.id);
              return {
                ...ing,
                onHandQty: stockInfo?.onHandQty,
                reorderPt: stockInfo?.reorderPt
              };
            });
          }
        }
        
        setIngredients(ingredientsWithQuantity);
        setSelectedBranchId(branchId || '');
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
    if (!branchId) return [];
    
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
    fetchStaffMembers,
    selectedBranchId
  };
};
