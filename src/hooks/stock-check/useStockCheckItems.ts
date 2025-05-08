
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { StockItem } from '@/types/stock-check';
import { supabase } from '@/integrations/supabase/client';

export const useStockCheckItems = (selectedBranch: string) => {
  const { toast } = useToast();
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatedItems, setUpdatedItems] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');

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
            categories(id, name)
          `);
        
        if (ingredientsError) throw ingredientsError;
        
        // Then, get branch inventory data for the selected branch
        const { data: branchInventory, error: inventoryError } = await supabase
          .from('branch_inventory')
          .select('ingredient_id, on_hand_qty, reorder_pt, last_checked, last_change')
          .eq('branch_id', selectedBranch);
        
        if (inventoryError) throw inventoryError;
        
        // Map inventory data to ingredients
        const inventoryMap = new Map();
        branchInventory?.forEach(item => {
          inventoryMap.set(item.ingredient_id, { 
            onHandQty: item.on_hand_qty,
            reorderPt: item.reorder_pt,
            lastChange: item.last_change || 0
          });
        });
        
        // Create stock items
        const items = ingredients.map((ingredient: any) => {
          const inventoryData = inventoryMap.get(ingredient.id) || { 
            onHandQty: 0, 
            reorderPt: 10, 
            lastChange: 0 
          };
          
          return {
            id: ingredient.id,
            name: ingredient.name,
            categoryId: ingredient.categoryId,
            categoryName: ingredient.categories?.name || 'Uncategorized',
            unit: ingredient.unit,
            onHandQty: inventoryData.onHandQty,
            reorderPt: inventoryData.reorderPt,
            lastChange: inventoryData.lastChange
          };
        });
        
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
  }, [selectedBranch, toast]);

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
  
  // Add new function for updating reorder points
  const handleReorderPointChange = (id: string, reorderPt: number) => {
    setStockItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, reorderPt } : item
      )
    );
    setUpdatedItems(prev => ({ ...prev, [id]: true }));
  };

  return {
    stockItems,
    filteredItems,
    updatedItems,
    search,
    setSearch,
    isLoading,
    handleQuantityChange,
    handleReorderPointChange,
    setUpdatedItems
  };
};
