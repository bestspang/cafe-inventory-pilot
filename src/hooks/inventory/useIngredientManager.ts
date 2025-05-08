
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Ingredient } from '@/types';
import { Category } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { saveIngredient, deleteIngredient } from '@/utils/inventory/ingredientOperations';

export const useIngredientManager = (
  setFormDialogOpen: (open: boolean) => void,
  setDeleteDialogOpen: (open: boolean) => void,
  storeId?: string | null
) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState<Ingredient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch ingredients from database, filtered by storeId
  const fetchIngredients = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching ingredients from database for store:', storeId);
      
      let query = supabase
        .from('ingredients')
        .select(`
          id, 
          name, 
          unit, 
          cost_per_unit,
          categoryId:category_id, 
          categories(id, name)
        `);
        
      // Filter by store if storeId is provided
      if (storeId) {
        query = query.eq('branch_id', storeId);
      }
      
      // Order by name
      query = query.order('name');
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      console.log('Fetched ingredients:', data);
      
      // Map and format the response data to match our Ingredient type
      const formattedData = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        unit: item.unit,
        costPerUnit: item.cost_per_unit,
        categoryId: item.categoryId,
        categoryName: item.categories?.name || 'Uncategorized'
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

  // Initial fetch when storeId changes
  useEffect(() => {
    if (storeId) {
      console.log('Store ID changed, fetching ingredients:', storeId);
      fetchIngredients();
    }
  }, [storeId]);

  // Add/edit ingredient handler
  const handleAddEdit = async (
    data: Partial<Ingredient>, 
    categories: Category[], 
    handleNewCategory: (name: string) => Promise<string>
  ) => {
    try {
      // Get or create category ID
      let categoryId: string | null = null;
      
      if (data.categoryId) {
        categoryId = data.categoryId;
      } else if (data.categoryName) {
        const existingCategory = categories.find(cat => 
          cat.name.toLowerCase() === data.categoryName?.toLowerCase());
        
        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          categoryId = await handleNewCategory(data.categoryName);
        }
      }
      
      // Save ingredient with branch_id and category
      const result = await saveIngredient({
        ...data,
        branch_id: storeId
      }, categoryId);
      
      if (result.success) {
        toast({
          title: data.id ? 'Ingredient updated' : 'Ingredient added',
          description: result.message
        });
        
        fetchIngredients();
        setFormDialogOpen(false);
      }
      
    } catch (error: any) {
      console.error('Error in handleAddEdit:', error);
      toast({
        title: data.id ? 'Failed to update ingredient' : 'Failed to add ingredient',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };

  // Edit handler
  const handleEdit = (ingredient: Ingredient) => {
    setCurrentIngredient(ingredient);
    setFormDialogOpen(true);
  };

  // Delete handler
  const handleDelete = (ingredient: Ingredient) => {
    setCurrentIngredient(ingredient);
    setDeleteDialogOpen(true);
  };

  // Confirm delete handler
  const confirmDelete = async () => {
    if (!currentIngredient) return;
    
    try {
      const result = await deleteIngredient(currentIngredient.id);
      
      if (result.success) {
        toast({
          title: 'Ingredient deleted',
          description: `${currentIngredient.name} has been removed from inventory`
        });
        
        fetchIngredients();
        setDeleteDialogOpen(false);
      }
    } catch (error: any) {
      console.error('Error in confirmDelete:', error);
      toast({
        title: 'Failed to delete ingredient',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };

  return {
    ingredients,
    setIngredients,
    currentIngredient,
    setCurrentIngredient,
    isLoading,
    fetchIngredients,
    handleAddEdit,
    handleEdit,
    handleDelete,
    confirmDelete
  };
};
