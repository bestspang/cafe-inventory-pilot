
import { Category } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Fetch all categories from the database
export const fetchCategories = async (): Promise<Category[]> => {
  console.log('Fetching categories from database...');
  const { data, error } = await supabase
    .from('categories')
    .select('id, name')
    .order('name');
  
  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
  
  console.log('Categories fetched successfully:', data);
  
  // Map the data to match our Category type
  return data.map((category: any) => ({
    id: category.id,
    name: category.name
  }));
};

// Check if a category with the same name already exists
export const checkCategoryExists = async (categoryName: string): Promise<string | null> => {
  const { data } = await supabase
    .from('categories')
    .select('id')
    .ilike('name', categoryName.trim())
    .limit(1);
    
  if (data && data.length > 0) {
    return data[0].id;
  }
  
  return null;
};

// Create a new category in the database
export const createCategory = async (categoryName: string): Promise<Category> => {
  console.log('Creating category with name:', categoryName);
  
  // Get the current user session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user?.id) {
    throw new Error('You must be logged in to create a category');
  }
  
  // Insert the new category
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
  
  return {
    id: data.id,
    name: data.name
  };
};
