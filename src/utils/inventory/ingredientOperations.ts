
import { Ingredient, Category } from '@/types';
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
      // Update existing ingredient
      console.log('Updating ingredient:', data.id);
      const { error } = await supabase
        .from('ingredients')
        .update({
          name: data.name,
          category_id: categoryId,
          unit: data.unit,
          default_reorder_point: data.defaultReorderPoint
        })
        .eq('id', data.id);
      
      if (error) {
        console.error('Error updating ingredient:', error);
        handleDatabaseError(error);
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
          default_reorder_point: data.defaultReorderPoint,
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
