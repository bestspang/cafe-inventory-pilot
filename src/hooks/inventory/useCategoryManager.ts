
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
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching categories from database...');
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      console.log('Categories fetched successfully:', data);
      
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

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle adding a new category to the database
  const handleNewCategory = async (tempId: string, categoryName: string): Promise<string> => {
    try {
      console.log('Creating new category:', categoryName);
      
      if (!categoryName || categoryName.trim() === '') {
        throw new Error('Category name cannot be empty');
      }
      
      // Insert the new category into the database
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: categoryName.trim() }])
        .select('id, name')
        .single();
      
      if (error) {
        console.error('Supabase error creating category:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('No data returned from category creation');
      }
      
      console.log('Category created successfully:', data);
      
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
      
      // Force a refresh of categories from the database
      fetchCategories();
      
      return newCategory.id;
    } catch (error: any) {
      console.error('Error creating category:', error);
      toast({
        title: "Failed to create category",
        description: error.message || "Please try again later.",
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
