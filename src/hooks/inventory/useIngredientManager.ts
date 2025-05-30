import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Ingredient } from '@/types';
import { Category } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { saveIngredient, deleteIngredient } from '@/utils/inventory/ingredientOperations';
import { useAuth } from '@/context/AuthContext';

export const useIngredientManager = (
  setFormDialogOpen: (open: boolean) => void,
  setDeleteDialogOpen: (open: boolean) => void,
  storeId?: string | null
) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState<Ingredient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch all ingredients from database, without filtering by storeId
  const fetchIngredients = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching all ingredients from database');
      
      // RLS will automatically filter to only show ingredients for branches owned by the current user
      const { data, error } = await supabase
        .from('ingredients')
        .select(`
          id, 
          name, 
          unit, 
          cost_per_unit,
          branch_id,
          categoryId:category_id, 
          categories(id, name),
          is_active
        `)
        .eq('is_active', true) // Only fetch active ingredients
        .order('name');
      
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
        branch_id: item.branch_id,
        categoryId: item.categoryId,
        categoryName: item.categories?.name || 'Uncategorized',
        isActive: item.is_active
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

  // Add/edit ingredient handler
  const handleAddEdit = async (
    data: Partial<Ingredient>, 
    categories: Category[], 
    handleNewCategory: (name: string) => Promise<string>
  ) => {
    try {
      if (!user?.id) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to manage ingredients.",
          variant: "destructive"
        });
        return;
      }
      
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
      
      // Save ingredient with category, using branch_id from the data
      const ingredientData = {
        ...data,
        // This property already exists in Ingredient type now
      };
      
      // Pass the user ID separately to the saveIngredient function
      const result = await saveIngredient(ingredientData, categoryId, user.id);
      
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

  // Confirm delete handler (now performs soft deletion)
  const confirmDelete = async () => {
    if (!currentIngredient) return;
    
    try {
      const result = await deleteIngredient(currentIngredient.id);
      
      if (result.success) {
        toast({
          title: 'Ingredient archived',
          description: `${currentIngredient.name} has been archived from inventory`
        });
        
        fetchIngredients();
        setDeleteDialogOpen(false);
      }
    } catch (error: any) {
      console.error('Error in confirmDelete:', error);
      toast({
        title: 'Failed to archive ingredient',
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
