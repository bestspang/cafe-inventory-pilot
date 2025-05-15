
import { supabase } from '@/integrations/supabase/client';
import { Ingredient } from '@/types';

/**
 * Save ingredient and update branch inventory
 */
export const saveBranchIngredient = async (
  data: Partial<Ingredient>,
  categoryId: string | null,
  userId: string,
  branchId: string
) => {
  try {
    // Start a transaction
    const { error: transactionError } = await supabase.rpc('begin_transaction');
    if (transactionError) throw transactionError;

    // First check if the ingredient already exists in the global ingredients table
    let ingredientId = data.id;
    let ingredientExists = false;

    if (!ingredientId) {
      // Check if an ingredient with the same name already exists
      const { data: existingIngredient, error: checkError } = await supabase
        .from('ingredients')
        .select('id')
        .eq('name', data.name)
        .maybeSingle();

      if (checkError) throw checkError;
      
      if (existingIngredient) {
        ingredientId = existingIngredient.id;
        ingredientExists = true;
      }
    } else {
      ingredientExists = true;
    }

    // If ingredient doesn't exist, create it
    if (!ingredientExists) {
      const { data: newIngredient, error: insertError } = await supabase
        .from('ingredients')
        .insert({
          name: data.name,
          unit: data.unit,
          category_id: categoryId,
          cost_per_unit: data.costPerUnit,
          created_by: userId,
          is_active: true
        })
        .select('id')
        .single();

      if (insertError) throw insertError;
      
      ingredientId = newIngredient.id;
    } else if (data.id) {
      // If ingredient exists and we're updating it
      const { error: updateError } = await supabase
        .from('ingredients')
        .update({
          name: data.name,
          unit: data.unit,
          category_id: categoryId,
          cost_per_unit: data.costPerUnit,
        })
        .eq('id', data.id);

      if (updateError) throw updateError;
    }

    // Now upsert into branch_inventory
    const { error: inventoryError } = await supabase
      .from('branch_inventory')
      .upsert({
        branch_id: branchId,
        ingredient_id: ingredientId,
        on_hand_qty: data.onHandQty || 0,
        reorder_pt: data.reorderPt || 10,
        last_change: data.lastChange || 0,
        last_checked: new Date().toISOString()
      });

    if (inventoryError) throw inventoryError;

    // Commit transaction
    const { error: commitError } = await supabase.rpc('commit_transaction');
    if (commitError) throw commitError;

    return {
      success: true,
      message: data.id ? 'Ingredient updated' : 'Ingredient added',
      ingredientId
    };
  } catch (error) {
    // Rollback transaction on error
    await supabase.rpc('rollback_transaction');
    console.error('Error in saveBranchIngredient:', error);
    return {
      success: false,
      message: error.message || 'Failed to save ingredient',
      error
    };
  }
}

/**
 * Remove ingredient from branch inventory (soft delete)
 */
export const removeBranchIngredient = async (ingredientId: string, branchId: string) => {
  try {
    // Delete from branch_inventory
    const { error } = await supabase
      .from('branch_inventory')
      .delete()
      .eq('ingredient_id', ingredientId)
      .eq('branch_id', branchId);
    
    if (error) throw error;

    return {
      success: true,
      message: 'Ingredient removed from inventory'
    };
  } catch (error) {
    console.error('Error removing branch ingredient:', error);
    return {
      success: false,
      message: error.message || 'Failed to remove ingredient',
      error
    };
  }
}

/**
 * Get branch inventory for a specific branch
 */
export const getBranchInventory = async (branchId: string) => {
  try {
    const { data, error } = await supabase
      .from('branch_inventory')
      .select(`
        on_hand_qty,
        reorder_pt,
        last_change,
        ingredient_id,
        ingredients (
          id, 
          name, 
          unit, 
          category_id,
          cost_per_unit,
          categories(id, name)
        )
      `)
      .eq('branch_id', branchId);

    if (error) throw error;

    return {
      success: true,
      data: data.map(row => ({
        id: row.ingredient_id,
        name: row.ingredients.name,
        unit: row.ingredients.unit,
        categoryId: row.ingredients.category_id,
        categoryName: row.ingredients?.categories?.name || 'Uncategorized',
        onHandQty: row.on_hand_qty,
        reorderPt: row.reorder_pt,
        lastChange: row.last_change,
        costPerUnit: row.ingredients.cost_per_unit,
        isActive: true,
        branch_id: branchId
      }))
    };
  } catch (error) {
    console.error('Error fetching branch inventory:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch inventory',
      error,
      data: []
    };
  }
}
