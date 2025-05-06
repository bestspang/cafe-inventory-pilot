
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Ingredient, Category } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface IngredientManagerResult {
  ingredients: Array<Ingredient & { categoryName: string }>;
  currentIngredient: Ingredient | undefined;
  setCurrentIngredient: (ingredient: Ingredient | undefined) => void;
  handleAddEdit: (data: Partial<Ingredient>, categories: Category[], handleNewCategory: (tempId: string, name: string) => Promise<string>) => Promise<void>;
  handleEdit: (ingredient: Ingredient) => void;
  handleDelete: (ingredient: Ingredient) => void;
  confirmDelete: () => Promise<void>;
  isLoading: boolean;
}

export const useIngredientManager = (
  setFormDialogOpen: (open: boolean) => void,
  setDeleteDialogOpen: (open: boolean) => void
): IngredientManagerResult => {
  const [ingredients, setIngredients] = useState<Array<Ingredient & { categoryName: string }>>([]);
  const [currentIngredient, setCurrentIngredient] = useState<Ingredient>();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch ingredients from the database
  const fetchIngredients = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching ingredients from database');
      
      const { data, error } = await supabase
        .from('ingredients')
        .select(`
          id, 
          name, 
          category_id, 
          unit, 
          default_reorder_point,
          categories(name)
        `)
        .order('name');
      
      if (error) {
        throw error;
      }
      
      // Map the data to match our Ingredient type
      const formattedData = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        categoryId: item.category_id,
        categoryName: item.categories?.name || 'Uncategorized',
        unit: item.unit,
        defaultReorderPoint: item.default_reorder_point
      }));
      
      setIngredients(formattedData);
      console.log('Fetched ingredients:', formattedData);
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
  }, [toast]);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  // Handle adding or editing an ingredient
  const handleAddEdit = async (
    data: Partial<Ingredient>, 
    categories: Category[],
    handleNewCategory: (tempId: string, name: string) => Promise<string>
  ) => {
    try {
      console.log('Handling add/edit for ingredient:', data);
      
      // Check if the categoryId starts with 'new-', which indicates a new category
      let categoryId = data.categoryId;
      if (categoryId && categoryId.startsWith('new-')) {
        // Find the category name from our categories array
        const category = categories.find(c => c.id === categoryId);
        if (category) {
          // Create the new category in the database
          categoryId = await handleNewCategory(categoryId, category.name);
          console.log('Created new category with ID:', categoryId);
        }
      }
      
      // Prepare the data for the database
      const ingredientData = {
        name: data.name,
        category_id: categoryId,
        unit: data.unit,
        default_reorder_point: data.defaultReorderPoint,
        created_by: user?.id
      };
      
      if (currentIngredient) {
        // Update existing ingredient
        console.log('Updating existing ingredient:', currentIngredient.id);
        const { error } = await supabase
          .from('ingredients')
          .update(ingredientData)
          .eq('id', currentIngredient.id);
        
        if (error) throw error;
        
        toast({
          title: "Ingredient updated",
          description: `${data.name} has been updated.`
        });
      } else {
        // Create new ingredient
        console.log('Creating new ingredient');
        const { error } = await supabase
          .from('ingredients')
          .insert([ingredientData]);
        
        if (error) throw error;
        
        toast({
          title: "Ingredient added",
          description: `${data.name} has been added to your inventory.`
        });
      }
      
      // Refresh the ingredients list
      await fetchIngredients();
      
      // Close the dialog
      setFormDialogOpen(false);
      // Clear the current ingredient
      setCurrentIngredient(undefined);
      
    } catch (error: any) {
      console.error('Error saving ingredient:', error);
      toast({
        title: "Failed to save ingredient",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
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

  // Confirm and execute the deletion
  const confirmDelete = async () => {
    if (!currentIngredient) return;
    
    try {
      console.log('Deleting ingredient:', currentIngredient.id);
      
      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', currentIngredient.id);
      
      if (error) throw error;
      
      // Update local state by removing the deleted ingredient
      setIngredients(prev => prev.filter(i => i.id !== currentIngredient.id));
      
      toast({
        title: "Ingredient deleted",
        description: `${currentIngredient.name} has been removed from your inventory.`
      });
      
      // Close the dialog and clear the current ingredient
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
