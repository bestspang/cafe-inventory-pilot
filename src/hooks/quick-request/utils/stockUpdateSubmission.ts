
import { toast } from '@/hooks/use-toast';
import { QuickRequestFormState, StaffMember } from '@/types/quick-request';
import { supabase } from '@/integrations/supabase/client';

/**
 * Submits a stock update to the database
 */
export const submitStockUpdate = async (
  formState: QuickRequestFormState,
  selectedStaff: StaffMember,
  itemsWithQuantity: any[],
  currentTime: string
): Promise<boolean> => {
  console.log('Submitting stock update with items:', itemsWithQuantity.length);
  
  try {
    // Create a new stock check with the staff ID as user_id
    const { data, error: stockCheckError } = await supabase
      .from('stock_checks')
      .insert({
        branch_id: formState.branchId,
        user_id: formState.staffId, // Using staffId directly as the user_id
        checked_at: currentTime,
      })
      .select('id')
      .single();
    
    if (stockCheckError) throw stockCheckError;
    
    // Insert stock check items
    const stockItems = itemsWithQuantity.map(item => ({
      stock_check_id: data.id,
      ingredient_id: item.ingredient_id,
      on_hand_qty: item.quantity
    }));
    
    console.log('Stock items to insert:', stockItems);
    
    const { data: insertedItems, error: stockItemsError } = await supabase
      .from('stock_check_items')
      .insert(stockItems)
      .select('*');
    
    if (stockItemsError) throw stockItemsError;
    
    console.log('Inserted stock items:', insertedItems?.length || 0);
    
    // Update branch_inventory for immediate reflection
    const branchInventoryUpdates = itemsWithQuantity.map(item => ({
      branch_id: formState.branchId,
      ingredient_id: item.ingredient_id,
      on_hand_qty: item.quantity,
      last_checked: currentTime,
      reorder_pt: 10 // Add default reorder_pt as it's required by the table schema
    }));
    
    // Use string instead of array for onConflict
    const { error: inventoryUpdateError } = await supabase
      .from('branch_inventory')
      .upsert(branchInventoryUpdates, { 
        onConflict: 'branch_id,ingredient_id' 
      });
    
    if (inventoryUpdateError) throw inventoryUpdateError;
    
    toast({
      title: 'Stock Update Submitted',
      description: `Your stock update has been submitted successfully by ${selectedStaff.staffName}`,
    });
    
    return true;
  } catch (error) {
    console.error('Error submitting stock update:', error);
    throw error;
  }
};
