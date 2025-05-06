
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Ingredient } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const useIngredientsFetch = () => {
  const [ingredients, setIngredients] = useState<(Ingredient & { categoryName: string })[]>([]);
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
          categories(id, name)
        `)
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

  // Initial fetch
  useEffect(() => {
    fetchIngredients();
  }, []);

  return {
    ingredients,
    setIngredients,
    isLoading,
    fetchIngredients
  };
};
