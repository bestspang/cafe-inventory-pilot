
import { Ingredient, Category } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

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
      throw error;
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
      throw error;
    }
    
    return {
      success: true,
      message: `${data.name} has been added to inventory.`
    };
  }
};

// Delete an ingredient
export const deleteIngredient = async (ingredientId: string) => {
  console.log('Deleting ingredient:', ingredientId);
  const { error } = await supabase
    .from('ingredients')
    .delete()
    .eq('id', ingredientId);
  
  if (error) {
    console.error('Error deleting ingredient:', error);
    throw error;
  }
  
  return {
    success: true
  };
};
