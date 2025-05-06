
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { handleUpdate } from '@/utils/updateHandler';
import { DetailedRequestItem } from '@/types/requests';

export const useRequestDetails = (
  requestId: string,
  branchId?: string,
  isExpanded: boolean = false,
  onRefresh?: () => Promise<void>
) => {
  const { toast } = useToast();
  const [detailedItems, setDetailedItems] = useState<DetailedRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Calculate if all items are checked
  const allItemsChecked = detailedItems.length > 0 && detailedItems.every(item => item.fulfilled);

  useEffect(() => {
    if (isExpanded) {
      fetchDetailedItems();
    }
  }, [isExpanded, requestId, branchId]);

  const fetchDetailedItems = async () => {
    if (!isExpanded || !branchId) return;
    
    setIsLoading(true);
    try {
      // 1. Fetch request items with ingredient info
      const { data: items, error } = await supabase
        .from('request_items')
        .select(`
          id,
          ingredient_id,
          quantity,
          note,
          recommended_qty,
          current_qty,
          fulfilled,
          ingredients (
            id,
            name
          )
        `)
        .eq('request_id', requestId);

      if (error) throw error;
      
      if (!items || items.length === 0) {
        setDetailedItems([]);
        return;
      }

      // 2. Fetch branch-specific inventory data with reorder points
      const { data: inventory, error: invError } = await supabase
        .from('branch_inventory')
        .select('ingredient_id, on_hand_qty, reorder_pt')
        .eq('branch_id', branchId)
        .in('ingredient_id', items.map(i => i.ingredient_id));

      if (invError) throw invError;

      // Create a map of inventory data for quick lookups
      const inventoryMap = Object.fromEntries(
        (inventory || []).map(item => [
          item.ingredient_id, 
          { onHandQty: item.on_hand_qty, reorderPt: item.reorder_pt }
        ])
      );

      // 3. Combine the data
      const detailed = items.map(item => ({
        id: item.id,
        ingredientId: item.ingredient_id,
        ingredientName: item.ingredients.name,
        quantity: item.quantity,
        note: item.note,
        recommendedQty: item.recommended_qty,
        currentQty: inventoryMap[item.ingredient_id]?.onHandQty || item.current_qty || 0,
        fulfilled: item.fulfilled || false,
        reorderPoint: inventoryMap[item.ingredient_id]?.reorderPt
      }));

      setDetailedItems(detailed);
    } catch (error: any) {
      console.error('Error fetching request details:', error);
      toast({
        title: 'Error loading request details',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (id: string, value: number) => {
    setDetailedItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity: value } : item
      )
    );
  };

  const handleToggleFulfilled = (id: string, checked: boolean) => {
    setDetailedItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, fulfilled: checked } : item
      )
    );
  };

  const handleSaveFulfillment = async () => {
    try {
      // Save the current state of request items
      for (const item of detailedItems) {
        // Update request items with current values
        const { error: itemUpdateError } = await supabase
          .from('request_items')
          .update({
            quantity: item.quantity,
            fulfilled: item.fulfilled
          })
          .eq('id', item.id);
        
        if (itemUpdateError) {
          throw itemUpdateError;
        }
      }
      
      toast({
        title: 'Fulfillment saved',
        description: 'The request details have been saved.'
      });
      
      // Refresh the data if callback provided
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error: any) {
      console.error('Error saving fulfillment:', error);
      toast({
        title: 'Error saving fulfillment',
        description: error.message || 'Failed to save fulfillment details',
        variant: 'destructive'
      });
    }
  };

  return {
    detailedItems,
    isLoading,
    handleQuantityChange,
    handleToggleFulfilled,
    handleSaveFulfillment,
    fetchDetailedItems,
    allItemsChecked
  };
};
