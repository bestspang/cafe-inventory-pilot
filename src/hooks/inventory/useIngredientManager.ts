
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Ingredient, Category } from '@/types';
import { StockItem } from '@/types/stock-check';
import { supabase } from '@/integrations/supabase/client';

export interface IngredientManagerResult {
  ingredients: StockItem[];
  currentIngredient: Ingredient | undefined;
  setCurrentIngredient: (ingredient: Ingredient | undefined) => void;
  handleAddEdit: (data: Partial<Ingredient>, categories: Category[], getCategoryId?: (tempId: string, name: string) => Promise<string>) => Promise<void>;
  handleEdit: (ingredient: Ingredient) => void;
  handleDelete: (ingredient: Ingredient) => void;
  confirmDelete: () => Promise<void>;
  isLoading: boolean;
}

export const useIngredientManager = (
  setFormDialogOpen: (open: boolean) => void,
  setDeleteDialogOpen: (open: boolean) => void
): IngredientManagerResult => {
  const [ingredients, setIngredients] = useState<StockItem[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState<Ingredient | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch ingredients from the database on component mount
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setIsLoading(true);
        // Get ingredients with their categories
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

        // Transform the data to match our StockItem type
        const formattedData = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          categoryId: item.category_id,
          categoryName: item.categories?.name || 'Uncategorized',
          unit: item.unit,
          defaultReorderPoint: item.default_reorder_point,
          onHandQty: 0 // We'll set this to 0 by default
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

    fetchIngredients();
  }, [toast]);

  const handleAddEdit = async (
    data: Partial<Ingredient>, 
    categories: Category[],
    getCategoryId?: (tempId: string, name: string) => Promise<string>
  ) => {
    try {
      // Process new category if needed
      let categoryId = data.categoryId;
      if (categoryId && categoryId.startsWith('new-') && getCategoryId) {
        const newCategoryName = categories.find(c => c.id === categoryId)?.name;
        if (newCategoryName) {
          categoryId = await getCategoryId(categoryId, newCategoryName);
        }
      }

      if (currentIngredient) {
        // Update existing ingredient
        const { error } = await supabase
          .from('ingredients')
          .update({
            name: data.name,
            category_id: categoryId,
            unit: data.unit,
            default_reorder_point: data.defaultReorderPoint
          })
          .eq('id', currentIngredient.id);
        
        if (error) {
          throw error;
        }
        
        // Update local state
        setIngredients(prev => 
          prev.map(item => 
            item.id === currentIngredient.id 
              ? { 
                  ...item, 
                  name: data.name || item.name,
                  categoryId: categoryId || item.categoryId,
                  categoryName: categories.find(c => c.id === categoryId)?.name || item.categoryName,
                  unit: data.unit || item.unit,
                  defaultReorderPoint: data.defaultReorderPoint !== undefined ? data.defaultReorderPoint : item.defaultReorderPoint
                } 
              : item
          )
        );
        
        toast({
          title: "Ingredient updated",
          description: `${data.name} has been updated successfully.`
        });
      } else {
        // Add new ingredient
        const { data: newIngredient, error } = await supabase
          .from('ingredients')
          .insert([{
            name: data.name,
            category_id: categoryId,
            unit: data.unit,
            default_reorder_point: data.defaultReorderPoint
          }])
          .select(`
            id, 
            name, 
            category_id,
            unit, 
            default_reorder_point,
            categories(name)
          `)
          .single();
        
        if (error) {
          throw error;
        }
        
        // Add to local state
        const newItem: StockItem = {
          id: newIngredient.id,
          name: newIngredient.name,
          categoryId: newIngredient.category_id,
          categoryName: newIngredient.categories?.name || 'Uncategorized',
          unit: newIngredient.unit,
          defaultReorderPoint: newIngredient.default_reorder_point,
          onHandQty: 0
        };
        
        setIngredients(prev => [...prev, newItem]);
        
        toast({
          title: "Ingredient added",
          description: `${data.name} has been added to your inventory.`
        });
      }
    } catch (error) {
      console.error('Error saving ingredient:', error);
      toast({
        title: "Failed to save ingredient",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
    
    setCurrentIngredient(undefined);
  };

  const handleEdit = (ingredient: Ingredient) => {
    setCurrentIngredient(ingredient);
    setFormDialogOpen(true);
  };

  const handleDelete = (ingredient: Ingredient) => {
    setCurrentIngredient(ingredient);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (currentIngredient) {
      try {
        const { error } = await supabase
          .from('ingredients')
          .delete()
          .eq('id', currentIngredient.id);
        
        if (error) {
          throw error;
        }
        
        setIngredients(prev => prev.filter(item => item.id !== currentIngredient.id));
        
        toast({
          title: "Ingredient deleted",
          description: `${currentIngredient.name} has been removed from your inventory.`,
          variant: "destructive"
        });
      } catch (error) {
        console.error('Error deleting ingredient:', error);
        toast({
          title: "Failed to delete ingredient",
          description: "Please try again later.",
          variant: "destructive"
        });
      }
      
      setCurrentIngredient(undefined);
      setDeleteDialogOpen(false);
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
