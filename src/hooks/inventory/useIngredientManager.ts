
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Ingredient, Category } from '@/types';
import { StockItem } from '@/types/stock-check';
import { mockIngredients } from '@/data/mockInventoryData';

export interface IngredientManagerResult {
  ingredients: StockItem[];
  currentIngredient: Ingredient | undefined;
  setCurrentIngredient: (ingredient: Ingredient | undefined) => void;
  handleAddEdit: (data: Partial<Ingredient>, categories: Category[], getCategoryId?: (tempId: string, name: string) => string) => void;
  handleEdit: (ingredient: Ingredient) => void;
  handleDelete: (ingredient: Ingredient) => void;
  confirmDelete: () => void;
}

export const useIngredientManager = (
  setFormDialogOpen: (open: boolean) => void,
  setDeleteDialogOpen: (open: boolean) => void
): IngredientManagerResult => {
  const [ingredients, setIngredients] = useState<StockItem[]>(mockIngredients);
  const [currentIngredient, setCurrentIngredient] = useState<Ingredient | undefined>(undefined);
  const { toast } = useToast();

  const handleAddEdit = (
    data: Partial<Ingredient>, 
    categories: Category[],
    getCategoryId?: (tempId: string, name: string) => string
  ) => {
    // Check if categoryId starts with 'new-', indicating a new category
    if (data.categoryId && data.categoryId.startsWith('new-') && getCategoryId) {
      // Extract the category name from our temporary categories
      const newCategoryName = categories.find(c => c.id === data.categoryId)?.name;
      
      if (newCategoryName) {
        // Update the data object with the new category ID from the category manager
        data.categoryId = getCategoryId(data.categoryId, newCategoryName);
      }
    }

    if (currentIngredient) {
      // Edit existing ingredient
      setIngredients(prev => 
        prev.map(item => 
          item.id === currentIngredient.id 
            ? { 
                ...item, 
                ...data,
                categoryName: categories.find(c => c.id === data.categoryId)?.name || item.categoryName
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
      const newIngredient = {
        id: Date.now().toString(),
        name: data.name!,
        categoryId: data.categoryId!,
        categoryName: categories.find(c => c.id === data.categoryId)?.name || '',
        unit: data.unit!,
        defaultReorderPoint: data.defaultReorderPoint!,
        onHandQty: 0
      };
      
      setIngredients(prev => [...prev, newIngredient]);
      
      toast({
        title: "Ingredient added",
        description: `${data.name} has been added to your inventory.`
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

  const confirmDelete = () => {
    if (currentIngredient) {
      setIngredients(prev => prev.filter(item => item.id !== currentIngredient.id));
      
      toast({
        title: "Ingredient deleted",
        description: `${currentIngredient.name} has been removed from your inventory.`,
        variant: "destructive"
      });
      
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
    confirmDelete
  };
};
