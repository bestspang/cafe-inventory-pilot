
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Category } from '@/types';
import { 
  fetchCategories as fetchCategoriesFromDb,
  checkCategoryExists,
  createCategory
} from '@/utils/inventory/categoryOperations';

export interface CategoryManagerResult {
  categories: Category[];
  handleNewCategory: (tempId: string, categoryName: string) => Promise<string | null>;
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
      const categoriesData = await fetchCategoriesFromDb();
      setCategories(categoriesData);
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
    
    // Set up window.handleNewCategory for cross-component access
    // This is a temporary solution until a proper context-based approach is implemented
    window.handleNewCategory = handleNewCategory;
    
    return () => {
      // Clean up when the hook unmounts
      delete window.handleNewCategory;
    };
  }, []);

  // Handle adding a new category to the database
  const handleNewCategory = async (tempId: string, categoryName: string): Promise<string | null> => {
    try {
      console.log('Creating new category:', categoryName);
      
      if (!categoryName || categoryName.trim() === '') {
        toast({
          title: "Category creation failed",
          description: "Category name cannot be empty",
          variant: "destructive"
        });
        return null;
      }
      
      // Check if category with same name already exists
      const existingCategoryId = await checkCategoryExists(categoryName);
        
      if (existingCategoryId) {
        toast({
          title: "Category already exists",
          description: `A category named "${categoryName}" already exists.`,
          variant: "destructive"
        });
        return existingCategoryId; // Return existing id
      }
      
      // Create the new category
      const newCategory = await createCategory(categoryName);
      
      // Update our categories state
      setCategories(prev => {
        // Filter out the temporary category and add the new one
        const filtered = prev.filter(c => c.id !== tempId);
        return [...filtered, newCategory];
      });
      
      toast({
        title: "Category created successfully",
        description: `"${categoryName}" has been added as a new category.`
      });
      
      // Force a refresh of categories from the database
      await fetchCategories();
      
      return newCategory.id;
    } catch (error: any) {
      console.error('Error creating category:', error);
      let errorMessage = "Please try again later.";
      
      // Handle specific error cases
      if (error.message) {
        errorMessage = error.message;
      }
      
      // Handle Supabase errors
      if (error.code) {
        switch (error.code) {
          case '42501':
            errorMessage = "You don't have permission to create categories.";
            break;
          case '23505':
            errorMessage = "A category with this name already exists.";
            break;
          default:
            errorMessage = `Database error: ${error.message || error.details || error.hint || "Unknown error"}`;
        }
      }
      
      toast({
        title: "Category creation failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      return null;
    }
  };

  return {
    categories,
    handleNewCategory,
    isLoading
  };
};

// Add TypeScript declaration for global window object
declare global {
  interface Window {
    handleNewCategory?: (tempId: string, categoryName: string) => Promise<string | null>;
  }
}
