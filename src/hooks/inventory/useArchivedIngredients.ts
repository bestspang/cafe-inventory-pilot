
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Ingredient } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const useArchivedIngredients = (onRestoreCallback?: () => void) => {
  const [archivedIngredients, setArchivedIngredients] = useState<(Ingredient & { categoryName: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch archived ingredients from database
  const fetchArchivedIngredients = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching archived ingredients from database...');
      
      const { data, error } = await supabase
        .from('ingredients')
        .select(`
          id, 
          name, 
          unit, 
          cost_per_unit,
          categoryId:category_id, 
          categories(id, name),
          is_active
        `)
        .eq('is_active', false) // Only fetch archived ingredients
        .order('name');
      
      if (error) {
        throw error;
      }
      
      console.log('Fetched archived ingredients:', data);
      
      // Map and format the response data to match our Ingredient type
      const formattedData = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        unit: item.unit,
        costPerUnit: item.cost_per_unit,
        categoryId: item.categoryId,
        categoryName: item.categories?.name || 'Uncategorized',
        isActive: item.is_active
      }));
      
      setArchivedIngredients(formattedData);
    } catch (error) {
      console.error('Error fetching archived ingredients:', error);
      toast({
        title: "Failed to load archived ingredients",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch when dialog opens
  useEffect(() => {
    if (dialogOpen) {
      fetchArchivedIngredients();
    }
  }, [dialogOpen]);

  // Restore an ingredient by setting is_active to true
  const restoreIngredient = async (ingredient: Ingredient) => {
    try {
      const { error } = await supabase
        .from('ingredients')
        .update({ is_active: true })
        .eq('id', ingredient.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Ingredient restored",
        description: `${ingredient.name} has been restored to active inventory`
      });
      
      // Refetch archived ingredients
      fetchArchivedIngredients();
      
      // Call the callback if provided (to refresh the active ingredients list)
      if (onRestoreCallback) {
        onRestoreCallback();
      }
    } catch (error: any) {
      console.error('Error restoring ingredient:', error);
      toast({
        title: "Failed to restore ingredient",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  return {
    archivedIngredients,
    isLoading,
    dialogOpen,
    setDialogOpen,
    fetchArchivedIngredients,
    restoreIngredient
  };
};
