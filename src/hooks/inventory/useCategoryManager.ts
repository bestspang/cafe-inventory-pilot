
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Category } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export interface CategoryManagerResult {
  categories: Category[];
  handleNewCategory: (tempId: string, categoryName: string) => Promise<string>;
  isLoading: boolean;
}

export const useCategoryManager = (): CategoryManagerResult => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch categories from the database on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('categories')
          .select('id, name')
          .order('name');
        
        if (error) {
          throw error;
        }
        
        // Map the data to match our Category type
        const formattedData = data.map((category: any) => ({
          id: category.id,
          name: category.name
        }));
        
        setCategories(formattedData);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: "Failed to load categories",
          description: "Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [toast]);

  // Handle adding a new category to the database
  const handleNewCategory = async (tempId: string, categoryName: string): Promise<string> => {
    try {
      // Insert the new category into the database
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: categoryName }])
        .select('id, name')
        .single();
      
      if (error) {
        throw error;
      }
      
      const newCategory = {
        id: data.id,
        name: data.name
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
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Failed to create category",
        description: "Please try again later.",
        variant: "destructive"
      });
      // Return the temp ID if we fail - the UI will still work
      return tempId;
    }
  };

  return {
    categories,
    handleNewCategory,
    isLoading
  };
};
