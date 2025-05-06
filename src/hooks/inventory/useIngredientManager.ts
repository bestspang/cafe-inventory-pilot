
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Category, Ingredient } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const useIngredientManager = (
  setFormDialogOpen: (open: boolean) => void,
  setDeleteDialogOpen: (open: boolean) => void
) => {
  const [ingredients, setIngredients] = useState<(Ingredient & { categoryName: string })[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState<Ingredient | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch ingredients from database
  const fetchIngredients = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching ingredients from database...');
      
      const { data, error } = await supabase
        .from('ingredients')
        .select(`
          id, 
          name, 
          unit, 
          categoryId:category_id, 
          defaultReorderPoint:default_reorder_point,
          categories(id, name)
        `);
      
      if (error) {
        throw error;
      }
      
      console.log('Fetched ingredients:', data);
      
      // Map and format the response data to match our Ingredient type
      const formattedData = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        unit: item.unit,
        categoryId: item.categoryId,
        categoryName: item.categories?.name || 'Uncategorized',
        defaultReorderPoint: item.defaultReorderPoint
      }));
      
      setIngredients(formattedData);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      toast({
        title: "Failed to load ingredients",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchIngredients();
  }, []);

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
      
      // Now handle the ingredient
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
        
        if (error) throw error;
        
        toast({
          title: "Ingredient updated",
          description: `${data.name} has been updated successfully.`
        });
      } else {
        // Add new ingredient
        console.log('Adding new ingredient');
        const { error } = await supabase
          .from('ingredients')
          .insert([{
            name: data.name,
            category_id: categoryId,
            unit: data.unit,
            default_reorder_point: data.defaultReorderPoint
          }]);
        
        if (error) throw error;
        
        toast({
          title: "Ingredient added",
          description: `${data.name} has been added to inventory.`
        });
      }
      
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
      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', currentIngredient.id);
      
      if (error) throw error;
      
      // Update state
      setIngredients(prev => prev.filter(i => i.id !== currentIngredient.id));
      
      toast({
        title: "Ingredient deleted",
        description: `${currentIngredient.name} has been removed from inventory.`
      });
      
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
