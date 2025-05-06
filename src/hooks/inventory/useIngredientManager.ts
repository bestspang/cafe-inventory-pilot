
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Category, Ingredient } from '@/types';
import { useIngredientsFetch } from './useIngredientsFetch';
import { saveIngredient, deleteIngredient } from '@/utils/inventory/ingredientOperations';
import { handleUpdate } from '@/utils/updateHandler';

export const useIngredientManager = (
  setFormDialogOpen: (open: boolean) => void,
  setDeleteDialogOpen: (open: boolean) => void
) => {
  const [currentIngredient, setCurrentIngredient] = useState<Ingredient | undefined>(undefined);
  const { ingredients, isLoading, fetchIngredients } = useIngredientsFetch();
  const { toast } = useToast();

  // Add or edit an ingredient
  const handleAddEdit = async (
    data: Partial<Ingredient>, 
    categories: Category[], 
    handleNewCategory: (tempId: string, categoryName: string) => Promise<string | null>
  ) => {
    try {
      console.group('Handling ingredient add/edit');
      console.log('Form data:', data);
      console.log('Is editing:', !!data.id);
      
      // Check if we need to create a new category
      let categoryId = data.categoryId;
      
      // If category ID starts with "new-", it's a new category
      if (categoryId && categoryId.startsWith('new-')) {
        console.log('Creating new category:', categoryId);
        // Find the category object with this temp ID
        const newCategory = categories.find(c => c.id === categoryId);
        
        if (newCategory) {
          // Create the new category in the database
          const realCategoryId = await handleNewCategory(categoryId, newCategory.name);
          if (!realCategoryId) {
            throw new Error("Failed to create new category");
          }
          categoryId = realCategoryId;
          console.log('New category created with ID:', realCategoryId);
        }
      }
      
      // For existing ingredients, use our update handler for better debugging
      if (data.id) {
        console.log('Updating existing ingredient:', data.id);
        
        // Prepare update payload
        const updatePayload: Record<string, any> = {
          name: data.name,
          category_id: categoryId,
          unit: data.unit
        };
        
        // If cost is provided, handle it separately
        if (data.costPerUnit !== undefined) {
          updatePayload.cost_per_unit = data.costPerUnit;
        }
        
        // Use our generic update handler
        const { success } = await handleUpdate(
          'ingredients', 
          data.id,
          updatePayload,
          fetchIngredients
        );
        
        console.log('Update result:', success);
        
        if (!success) {
          throw new Error("Failed to update ingredient");
        }
      } else {
        // For new ingredients, use the existing saveIngredient function
        console.log('Creating new ingredient');
        const result = await saveIngredient(data, categoryId || null);
        
        // Show success message
        toast({
          title: "Ingredient added",
          description: result.message
        });
        
        // Refresh ingredients list
        await fetchIngredients();
      }
      
      // Close the form dialog
      setFormDialogOpen(false);
      console.groupEnd();
      return true;
    } catch (error: any) {
      console.error('Error saving ingredient:', error);
      console.groupEnd();
      
      // Format user-friendly error message
      let errorMessage = "Please try again later.";
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      if (error.code) {
        switch (error.code) {
          case '42501':
            errorMessage = "You don't have permission to perform this operation.";
            break;
          case '23505':
            errorMessage = "An ingredient with this name already exists.";
            break;
          default:
            errorMessage = `Database error: ${error.message || error.details || error.hint || "Unknown error"}`;
        }
      }
      
      throw {
        code: error.code,
        message: "Failed to save ingredient",
        details: errorMessage,
        hint: error.hint
      };
    }
  };

  // Set up an ingredient for editing
  const handleEdit = (ingredient: Ingredient) => {
    setCurrentIngredient(ingredient);
    setFormDialogOpen(true);
  };

  // Set up an ingredient for deletion
  const handleDelete = (ingredient: Ingredient) => {
    setCurrentIngredient(ingredient);
    setDeleteDialogOpen(true);
  };

  // Delete an ingredient
  const confirmDelete = async () => {
    if (!currentIngredient) return;
    
    try {
      await deleteIngredient(currentIngredient.id);
      
      toast({
        title: "Ingredient deleted",
        description: `${currentIngredient.name} has been removed from inventory.`
      });
      
      // Refresh ingredients after deletion
      await fetchIngredients();
      
      // Close dialog
      setDeleteDialogOpen(false);
      setCurrentIngredient(undefined);
    } catch (error: any) {
      console.error('Error deleting ingredient:', error);
      
      let errorMessage = "Please try again later.";
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      if (error.code) {
        switch (error.code) {
          case '42501':
            errorMessage = "You don't have permission to delete this ingredient.";
            break;
          default:
            errorMessage = error.message || error.details || "Unknown error";
        }
      }
      
      toast({
        title: "Failed to delete ingredient",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return {
    ingredients,
    currentIngredient,
    setCurrentIngredient,
    handleAddEdit,
    handleEdit,
    handleDelete,
    confirmDelete,
    isLoading
  };
};
