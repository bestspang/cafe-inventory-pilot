import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { StockItem } from '@/types/stock-check';
import { useAuth } from '@/context/AuthContext';

export const useStockCheckActions = (
  selectedBranch: string,
  stockItems: StockItem[],
  updatedItems: Record<string, boolean>,
  setUpdatedItems: (items: Record<string, boolean>) => void,
  branches: {id: string, name: string}[]
) => {
  const { toast } = useToast();
  const { user } = useAuth();

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
      
      // First, get current inventory quantities to calculate changes
      const itemIds = stockItems.filter(item => updatedItems[item.id]).map(item => item.id);
      
      if (itemIds.length === 0) {
        toast({
          title: "No changes to save",
          description: "You haven't made any changes to the inventory"
        });
        return;
      }
      
      const { data: currentInventory } = await supabase
        .from('branch_inventory')
        .select('ingredient_id, on_hand_qty')
        .eq('branch_id', selectedBranch)
        .in('ingredient_id', itemIds);
      
      // Create a map of current inventory quantities
      const currentQtyMap = Object.fromEntries(
        (currentInventory || []).map(item => [item.ingredient_id, item.on_hand_qty])
      );
      
      // Create a new stock check record with user information and username
      const currentTime = new Date().toISOString();
      
      // Get username from email if user exists
      let username = null;
      if (user?.email) {
        username = user.email.split('@')[0];
      }
      
      const { data: stockCheck, error: stockCheckError } = await supabase
        .from('stock_checks')
        .insert({
          branch_id: selectedBranch,
          user_id: user?.id || null,
          username: username, // Store the username derived from email
          checked_at: currentTime
        })
        .select('id')
        .single();
        
      if (stockCheckError) throw stockCheckError;
      
      // Prepare stock check items for the new stock check
      const stockCheckItems = stockItems
        .filter(item => updatedItems[item.id])
        .map(item => ({
          stock_check_id: stockCheck.id,
          ingredient_id: item.id,
          on_hand_qty: item.onHandQty
        }));
        
      // Insert the stock check items
      const { error: itemsError } = await supabase
        .from('stock_check_items')
        .insert(stockCheckItems);
        
      if (itemsError) throw itemsError;
      
      // Update the branch inventory as well
      // Prepare the data for upsert - only include changed items
      const itemsToUpdate = stockItems
        .filter(item => updatedItems[item.id])
        .map(item => {
          const oldQty = currentQtyMap[item.id] || 0;
          const newQty = item.onHandQty;
          
          return {
            branch_id: selectedBranch,
            ingredient_id: item.id,
            on_hand_qty: newQty,
            reorder_pt: item.reorderPt,
            last_change: newQty - oldQty,
            last_checked: currentTime
          };
        });
      
      // Fix the type issue by explicitly passing the array and proper onConflict option
      const { error } = await supabase
        .from('branch_inventory')
        .upsert(
          itemsToUpdate, 
          { onConflict: 'branch_id,ingredient_id' }
        );
      
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
          on_hand_qty: stockItems.find(item => item.id === ingredientId)?.onHandQty || 0,
          last_checked: new Date().toISOString()
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
