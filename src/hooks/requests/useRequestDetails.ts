
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
      // Check if all items are marked as fulfilled
      const allFulfilled = detailedItems.every(item => item.fulfilled);
      if (!allFulfilled) {
        toast({
          title: 'Cannot save fulfillment',
          description: 'All items must be marked as fulfilled',
          variant: 'destructive'
        });
        return;
      }

      // Prepare updates for each item
      const updates = detailedItems.map(item => ({
        id: item.id,
        ingredient_id: item.ingredientId,
        quantity: item.quantity,
        fulfilled: item.fulfilled
      }));
      
      // Update each item individually
      for (const item of updates) {
        const { error } = await supabase
          .from('request_items')
          .update({
            quantity: item.quantity,
            fulfilled: item.fulfilled
          })
          .eq('id', item.id);
        
        if (error) {
          throw error;
        }
        
        // Update branch inventory with the fulfilled quantity
        if (item.fulfilled && branchId) {
          const { error: inventoryError } = await supabase
            .from('branch_inventory')
            .update({
              on_hand_qty: supabase.rpc('increment', { x: item.quantity }),
              last_checked: new Date().toISOString()
            })
            .eq('branch_id', branchId)
            .eq('ingredient_id', item.ingredient_id);

          if (inventoryError) {
            console.error('Error updating inventory:', inventoryError);
            throw inventoryError;
          }
        }
      }
      
      // If all items are fulfilled, update the request status
      if (allFulfilled && requestId) {
        await handleUpdate('requests', requestId, { status: 'fulfilled' });
      }
      
      toast({
        title: 'Fulfillment saved',
        description: 'The request fulfillment details have been updated and inventory has been adjusted.',
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
    fetchDetailedItems
  };
};
