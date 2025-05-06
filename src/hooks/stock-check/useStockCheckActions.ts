import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { StockItem } from '@/types/stock-check';

export const useStockCheckActions = (
  selectedBranch: string,
  stockItems: StockItem[],
  updatedItems: Record<string, boolean>,
  setUpdatedItems: (items: Record<string, boolean>) => void,
  branches: {id: string, name: string}[]
) => {
  const { toast } = useToast();

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
          reorder_pt: item.reorderPt, // Include the branch-specific reorder point
          last_checked: new Date().toISOString()
        }));
      
      if (itemsToUpdate.length === 0) {
        toast({
          title: "No changes to save",
          description: "You haven't made any changes to the inventory"
        });
        return;
      }
      
      // Fix the onConflict parameter to use the correct format
      const { error } = await supabase
        .from('branch_inventory')
        .upsert(itemsToUpdate, { 
          onConflict: 'branch_id,ingredient_id' 
        });
      
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

  // Add a new function to handle reorder point updates
  const handleReorderPointSave = async (
    ingredientId: string, 
    reorderPt: number,
    originalValue: number
  ) => {
    if (!selectedBranch) {
      toast({
        title: "No branch selected",
        description: "Please select a branch to update reorder point",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('branch_inventory')
        .upsert({
          branch_id: selectedBranch,
          ingredient_id: ingredientId,
          reorder_pt: reorderPt,
          // Keep existing on_hand_qty, just update reorder_pt
          on_hand_qty: stockItems.find(item => item.id === ingredientId)?.onHandQty || 0
        }, {
          onConflict: 'branch_id,ingredient_id'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Reorder point updated",
        description: "Reorder threshold has been successfully saved."
      });

    } catch (error: any) {
      console.error('Error updating reorder point:', error);
      
      // Revert the change in the UI
      const updatedStockItems = stockItems.map(item => 
        item.id === ingredientId 
          ? { ...item, reorderPt: originalValue } 
          : item
      );
      
      toast({
        title: "Failed to update reorder point",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    }
  };

  return {
    handleSave,
    handleReorderPointSave
  };
};
