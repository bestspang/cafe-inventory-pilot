
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { QuickRequestIngredient } from '@/types/quick-request';
import { supabase } from '@/integrations/supabase/client';

export const useQuickRequestSubmission = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form submission for both request and stock-update
  const handleSubmit = async (
    branchId: string,
    staffId: string,
    selectedIngredients: QuickRequestIngredient[],
    formAction: 'request' | 'stock-update'
  ): Promise<boolean> => {
    if (!branchId) {
      toast({
        title: "Store required",
        description: "Please select a store before submitting",
        variant: "destructive"
      });
      return false;
    }
    
    if (!staffId) {
      toast({
        title: "Staff name required",
        description: "Please select or enter a staff name",
        variant: "destructive"
      });
      return false;
    }
    
    // Filter ingredients that have a quantity > 0
    const itemsToSubmit = selectedIngredients.filter(ing => ing.quantity > 0);
    
    if (itemsToSubmit.length === 0) {
      toast({
        title: "No ingredients selected",
        description: "Please add quantities to at least one ingredient",
        variant: "destructive"
      });
      return false;
    }

    setIsSubmitting(true);
    
    try {
      if (formAction === 'request') {
        return await handleRequestSubmission(branchId, staffId, itemsToSubmit);
      } else {
        return await handleStockUpdateSubmission(branchId, staffId, itemsToSubmit);
      }
    } catch (error: any) {
      console.error(`Error submitting ${formAction}:`, error);
      toast({
        title: `Failed to submit ${formAction}`,
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle submitting an ingredient request
  const handleRequestSubmission = async (
    branchId: string,
    staffId: string,
    itemsToSubmit: QuickRequestIngredient[]
  ): Promise<boolean> => {
    // Create a new request with the selected ingredients
    const { data: request, error: requestError } = await supabase
      .from('requests')
      .insert({
        branch_id: branchId,
        user_id: staffId,
        requested_at: new Date().toISOString(),
        status: 'pending'
      })
      .select('id')
      .single();
    
    if (requestError) throw requestError;
    
    // Add request items
    const requestItems = itemsToSubmit.map(ing => ({
      request_id: request.id,
      ingredient_id: ing.id,
      quantity: ing.quantity,
      note: null
    }));
    
    const { error: itemsError } = await supabase
      .from('request_items')
      .insert(requestItems);
    
    if (itemsError) throw itemsError;
    
    toast({
      title: "Request submitted",
      description: `${itemsToSubmit.length} ingredients have been requested`
    });
    
    return true;
  };

  // Handle submitting a stock update
  const handleStockUpdateSubmission = async (
    branchId: string,
    staffId: string,
    itemsToSubmit: QuickRequestIngredient[]
  ): Promise<boolean> => {
    // Create a new stock check
    const { data: stockCheck, error: checkError } = await supabase
      .from('stock_checks')
      .insert({
        branch_id: branchId,
        user_id: staffId,
        checked_at: new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (checkError) throw checkError;
    
    // Add stock check items and update branch inventory
    for (const ingredient of itemsToSubmit) {
      // Add to stock_check_items
      const { error: itemError } = await supabase
        .from('stock_check_items')
        .insert({
          stock_check_id: stockCheck.id,
          ingredient_id: ingredient.id,
          on_hand_qty: ingredient.quantity
        });
      
      if (itemError) throw itemError;
      
      // Update branch_inventory
      const { error: inventoryError } = await supabase
        .from('branch_inventory')
        .upsert({
          branch_id: branchId,
          ingredient_id: ingredient.id,
          on_hand_qty: ingredient.quantity,
          last_checked: new Date().toISOString()
        }, {
          onConflict: 'branch_id,ingredient_id'
        });
      
      if (inventoryError) throw inventoryError;
    }
    
    toast({
      title: "Stock update submitted",
      description: `${itemsToSubmit.length} ingredient quantities have been updated`
    });
    
    return true;
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
