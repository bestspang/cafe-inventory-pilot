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
      console.log('Fetching branches...');
      
      // Try fetching from 'branches' table first
      const { data: branchesData, error: branchesError } = await supabase
        .from('branches')
        .select('id, name')
        .order('name');
      
      if (branchesError) {
        console.error('Error fetching from branches table:', branchesError);
        
        // Fall back to 'stores' table if there was an error
        const { data: storesData, error: storesError } = await supabase
          .from('stores')
          .select('id, name')
          .order('name');
        
        if (storesError) {
          console.error('Error fetching from stores table:', storesError);
          throw storesError;
        }
        
        if (storesData && storesData.length > 0) {
          console.log('Stores loaded:', storesData);
          setBranches(storesData);
          return storesData;
        }
      } else if (branchesData && branchesData.length > 0) {
        console.log('Branches loaded:', branchesData);
        setBranches(branchesData);
        return branchesData;
      } else {
        console.log('No branches found in branches table, trying stores table');
        
        // If no branches found, try stores table
        const { data: storesData, error: storesError } = await supabase
          .from('stores')
          .select('id, name')
          .order('name');
        
        if (storesError) {
          console.error('Error fetching from stores table:', storesError);
          throw storesError;
        }
        
        console.log('Stores loaded:', storesData);
        setBranches(storesData || []);
        return storesData || [];
      }
    } catch (error) {
      console.error('Error fetching branches/stores:', error);
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
      const targetBranchId = branchId || selectedBranchId;
      
      if (!targetBranchId) {
        console.warn('No branch ID provided for ingredient fetch');
        return [];
      }
      
      console.log(`Fetching ingredients for branch ${targetBranchId}...`);
      
      // Get ALL ingredients first - not filtered by branch
      const { data: allIngredientsData, error: allIngredientsError } = await supabase
        .from('ingredients')
        .select('id, name, unit')
        .eq('is_active', true);
      
      if (allIngredientsError) {
        console.error('Error fetching ingredients:', allIngredientsError);
        throw allIngredientsError;
      }
      
      console.log('All ingredients loaded:', allIngredientsData?.length || 0);
      
      let ingredientsWithQuantity: QuickRequestIngredient[] = (allIngredientsData || []).map(ingredient => ({
        ...ingredient,
        quantity: 0
      }));
      
      // If branch is selected, fetch stock levels
      if (targetBranchId) {
        const { data: stockData, error: stockError } = await supabase
          .from('branch_inventory')
          .select('ingredient_id, on_hand_qty, reorder_pt')
          .eq('branch_id', targetBranchId);
        
        if (stockError) {
          console.error('Error fetching stock levels:', stockError);
        } else if (stockData) {
          console.log('Stock data loaded:', stockData.length);
          
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
      
      console.log('Setting ingredients state with:', ingredientsWithQuantity.length, 'items');
      setIngredients(ingredientsWithQuantity);
      if (branchId) setSelectedBranchId(branchId);
      return ingredientsWithQuantity;
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
    if (!branchId) {
      console.warn('No branch ID provided for staff fetch');
      return [];
    }
    
    try {
      setIsLoading(true);
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
    console.log('Initial loading of branch data');
    fetchBranches();
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
