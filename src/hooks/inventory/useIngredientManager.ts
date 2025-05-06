
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Category, Ingredient } from '@/types';
import { useIngredientsFetch } from './useIngredientsFetch';
import { saveIngredient, deleteIngredient } from '@/utils/inventory/ingredientOperations';

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
    handleNewCategory: (tempId: string, categoryName: string) => Promise<string>
  ) => {
    try {
      console.log('Handling add/edit with data:', data);
      
      // Check if we need to create a new category
      let categoryId = data.categoryId;
      
      // If category ID starts with "new-", it's a new category
      if (categoryId && categoryId.startsWith('new-')) {
        console.log('Creating new category');
        // Find the category object with this temp ID
        const newCategory = categories.find(c => c.id === categoryId);
        
        if (newCategory) {
          // Create the new category in the database
          const realCategoryId = await handleNewCategory(categoryId, newCategory.name);
          categoryId = realCategoryId;
        }
      }
      
      // Save the ingredient
      const result = await saveIngredient(data, categoryId || null);
      
      // Show success message
      toast({
        title: data.id ? "Ingredient updated" : "Ingredient added",
        description: result.message
      });
      
      // Refresh ingredients list
      await fetchIngredients();
      
      // Close the form dialog
      setFormDialogOpen(false);
      
      return true;
    } catch (error: any) {
      console.error('Error saving ingredient:', error);
      toast({
        title: "Failed to save ingredient",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
      return false;
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
      
      // Update state by filtering out the deleted ingredient
      // No need to call fetchIngredients again as we're just removing one item
      
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
      toast({
        title: "Failed to delete ingredient",
        description: error.message || "Please try again later.",
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
