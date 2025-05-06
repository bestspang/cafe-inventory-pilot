
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
          last_checked: new Date().toISOString()
        }));
      
      if (itemsToUpdate.length === 0) {
        toast({
          title: "No changes to save",
          description: "You haven't made any changes to the inventory"
        });
        return;
      }
      
      // Use correct format for onConflict parameter
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

  return {
    handleSave
  };
};
