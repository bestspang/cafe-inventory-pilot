
import { Ingredient } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Add or edit an ingredient
export const saveIngredient = async (
  data: Partial<Ingredient>,
  categoryId: string | null
) => {
  console.log('Saving ingredient with data:', data, 'and categoryId:', categoryId);
  
  // Get the current user's ID from the authenticated session
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  
  if (!userId) {
    throw new Error("You must be logged in to save ingredients.");
  }
  
  try {
    if (data.id) {
      // Check if we're updating the cost of an existing ingredient
      if (data.costPerUnit !== undefined) {
        // Get current ingredient details
        const { data: currentIngredient, error: fetchError } = await supabase
          .from('ingredients')
          .select('cost_per_unit')
          .eq('id', data.id)
          .single();
        
        if (fetchError) {
          console.error('Error fetching current ingredient:', fetchError);
          handleDatabaseError(fetchError);
        }
        
        // If cost has changed, use the special RPC function to update it and log history
        if (currentIngredient.cost_per_unit !== data.costPerUnit) {
          const { error: costUpdateError } = await supabase.rpc('update_ingredient_cost', {
            p_ingr_id: data.id,
            p_new_cost: data.costPerUnit,
            p_user_id: userId
          });
          
          if (costUpdateError) {
            console.error('Error updating ingredient cost:', costUpdateError);
            handleDatabaseError(costUpdateError);
          }
          
          // Update other fields separately to avoid duplication in cost history
          const { error } = await supabase
            .from('ingredients')
            .update({
              name: data.name,
              category_id: categoryId,
              unit: data.unit
            })
            .eq('id', data.id);
          
          if (error) {
            console.error('Error updating ingredient:', error);
            handleDatabaseError(error);
          }
        } else {
          // No cost change, just update other fields
          const { error } = await supabase
            .from('ingredients')
            .update({
              name: data.name,
              category_id: categoryId,
              unit: data.unit
            })
            .eq('id', data.id);
          
          if (error) {
            console.error('Error updating ingredient:', error);
            handleDatabaseError(error);
          }
        }
      } else {
        // Update existing ingredient without cost change
        const { error } = await supabase
          .from('ingredients')
          .update({
            name: data.name,
            category_id: categoryId,
            unit: data.unit
          })
          .eq('id', data.id);
        
        if (error) {
          console.error('Error updating ingredient:', error);
          handleDatabaseError(error);
        }
      }
      
      return {
        success: true,
        message: `${data.name} has been updated successfully.`
      };
    } else {
      // Add new ingredient
      console.log('Adding new ingredient with user ID:', userId);
      const { error } = await supabase
        .from('ingredients')
        .insert([{
          name: data.name,
          category_id: categoryId,
          unit: data.unit,
          cost_per_unit: data.costPerUnit,
          created_by: userId // Add the user ID to satisfy RLS
        }]);
      
      if (error) {
        console.error('Error creating ingredient:', error);
        handleDatabaseError(error);
      }
      
      return {
        success: true,
        message: `${data.name} has been added to inventory.`
      };
    }
  } catch (error: any) {
    console.error('Unexpected error saving ingredient:', error);
    throw new Error(`Unexpected error: ${error.message || 'Unknown error'}`);
  }
};

// Delete an ingredient
export const deleteIngredient = async (ingredientId: string) => {
  console.log('Deleting ingredient:', ingredientId);
  
  try {
    const { error } = await supabase
      .from('ingredients')
      .delete()
      .eq('id', ingredientId);
    
    if (error) {
      console.error('Error deleting ingredient:', error);
      handleDatabaseError(error);
    }
    
    return {
      success: true
    };
  } catch (error: any) {
    console.error('Unexpected error deleting ingredient:', error);
    throw new Error(`Unexpected error: ${error.message || 'Unknown error'}`);
  }
};

// Helper function to handle database errors
const handleDatabaseError = (error: any) => {
  let errorMessage = "Operation failed";
  
  if (error.code === '42501') {
    errorMessage = "You don't have permission to perform this operation.";
  } else if (error.code === '23505') { 
    errorMessage = "An item with this name already exists.";
  } else {
    errorMessage = error.message || error.details || error.hint || "Database error";
  }
  
  throw {
    code: error.code,
    message: errorMessage,
    details: error.details,
    hint: error.hint
  };
};
