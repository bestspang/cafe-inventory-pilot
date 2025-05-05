
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Category } from '@/types';
import { mockCategories } from '@/data/mockInventoryData';

export interface CategoryManagerResult {
  categories: Category[];
  handleNewCategory: (tempId: string, categoryName: string) => string;
}

export const useCategoryManager = (): CategoryManagerResult => {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const { toast } = useToast();

  // Handle adding a new category - returns the new permanent ID
  const handleNewCategory = (tempId: string, categoryName: string): string => {
    // Create a "real" category with a non-temporary ID
    const newCategory = {
      id: Date.now().toString(),
      name: categoryName
    };
    
    // Update our categories state
    setCategories(prev => {
      // Filter out the temporary category and add the new one
      const filtered = prev.filter(c => c.id !== tempId);
      return [...filtered, newCategory];
    });
    
    toast({
      title: "Category created",
      description: `${categoryName} has been added as a new category.`
    });
    
    return newCategory.id;
  };

  return {
    categories,
    handleNewCategory
  };
};
