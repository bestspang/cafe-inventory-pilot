
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { StockItem } from '@/types/stock-check';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useStockCheck = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatedItems, setUpdatedItems] = useState<Record<string, boolean>>({});
  const [branches, setBranches] = useState<{id: string, name: string}[]>([]);

  // Fetch available branches based on user role
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        let query = supabase.from('branches').select('id, name');
        
        // If user is not an owner, filter by their branch
        if (user?.role !== 'owner' && user?.branchId) {
          query = query.eq('id', user.branchId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setBranches(data);
          // If no branch is selected or the user doesn't have access to the selected branch,
          // set the first available branch as selected
          if (!selectedBranch || (user?.role !== 'owner' && selectedBranch !== user.branchId)) {
            setSelectedBranch(data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
        toast({
          title: "Failed to load branches",
          description: "Please try again later",
          variant: "destructive"
        });
      }
    };
    
    if (user) {
      fetchBranches();
    }
  }, [user, selectedBranch]);

  // Fetch stock items for the selected branch
  useEffect(() => {
    const fetchStockItems = async () => {
      if (!selectedBranch) return;
      
      setIsLoading(true);
      try {
        // First, get all ingredients
        const { data: ingredients, error: ingredientsError } = await supabase
          .from('ingredients')
          .select(`
            id, 
            name, 
            unit, 
            categoryId:category_id, 
            defaultReorderPoint:default_reorder_point,
            categories(id, name)
          `);
        
        if (ingredientsError) throw ingredientsError;
        
        // Then, get branch inventory data for the selected branch
        const { data: branchInventory, error: inventoryError } = await supabase
          .from('branch_inventory')
          .select('ingredient_id, on_hand_qty, last_checked')
          .eq('branch_id', selectedBranch);
        
        if (inventoryError) throw inventoryError;
        
        // Map inventory data to ingredients
        const inventoryMap = new Map();
        branchInventory?.forEach(item => {
          inventoryMap.set(item.ingredient_id, item.on_hand_qty);
        });
        
        // Create stock items
        const items = ingredients.map((ingredient: any) => ({
          id: ingredient.id,
          name: ingredient.name,
          categoryId: ingredient.categoryId,
          categoryName: ingredient.categories?.name || 'Uncategorized',
          unit: ingredient.unit,
          defaultReorderPoint: ingredient.defaultReorderPoint,
          onHandQty: inventoryMap.has(ingredient.id) ? 
            Number(inventoryMap.get(ingredient.id)) : 0
        }));
        
        setStockItems(items);
      } catch (error) {
        console.error('Error fetching stock items:', error);
        toast({
          title: "Failed to load inventory",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (selectedBranch) {
      fetchStockItems();
      // Subscribe to realtime updates
      const channel = supabase
        .channel('branch_inventory_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'branch_inventory',
            filter: `branch_id=eq.${selectedBranch}`
          },
          (payload) => {
            console.log('Realtime update:', payload);
            // Refresh the stock items on changes
            fetchStockItems();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedBranch]);

  // Filter ingredients based on search
  const filteredItems = stockItems.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.categoryName.toLowerCase().includes(search.toLowerCase())
  );

  const handleQuantityChange = (id: string, quantity: number) => {
    setStockItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, onHandQty: quantity } : item
      )
    );
    setUpdatedItems(prev => ({ ...prev, [id]: true }));
  };

  const handleSave = async () => {
    if (!selectedBranch) {
      toast({
        title: "No branch selected",
        description: "Please select a branch to save inventory",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Find the branch name for the toast
      const branchName = branches.find(b => b.id === selectedBranch)?.name || 'selected branch';
      
      // Prepare the data for upsert - only include changed items
      const itemsToUpdate = stockItems
        .filter(item => updatedItems[item.id])
        .map(item => ({
          branch_id: selectedBranch,
          ingredient_id: item.id,
          on_hand_qty: item.onHandQty,
          last_checked: new Date().toISOString()
        }));
      
      if (itemsToUpdate.length === 0) {
        toast({
          title: "No changes to save",
          description: "You haven't made any changes to the inventory"
        });
        return;
      }
      
      const { error } = await supabase
        .from('branch_inventory')
        .upsert(itemsToUpdate, { onConflict: ['branch_id', 'ingredient_id'] });
      
      if (error) throw error;
      
      toast({
        title: "Stock check saved",
        description: `Inventory counts for ${branchName} have been updated successfully.`
      });
      
      setUpdatedItems({});
    } catch (error: any) {
      console.error('Error saving stock check:', error);
      toast({
        title: "Failed to save stock check",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    }
  };

  return {
    search,
    setSearch,
    selectedBranch,
    setSelectedBranch,
    stockItems,
    filteredItems,
    updatedItems,
    branches,
    isLoading,
    handleQuantityChange,
    handleSave
  };
};
