
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

/**
 * Attempts to seed demo data for the application if it doesn't exist
 * This is an idempotent operation - it won't create duplicates
 */
export const seedDemoData = async (): Promise<void> => {
  try {
    console.log('Checking if demo data needs to be seeded...');
    
    // First check if we need to seed any data by checking if demo users exist
    const { data: existingUsers, error: userCheckError } = await supabase
      .from('profiles')
      .select('id, email')
      .in('email', ['owner@cafeapp.com', 'manager@cafeapp.com', 'staff@cafeapp.com'])
      .limit(3);
    
    if (userCheckError) {
      console.error('Error checking for demo users:', userCheckError);
      return;
    }
    
    // If we found all three demo users, no need to seed
    if (existingUsers && existingUsers.length === 3) {
      console.log('All demo users already exist, skipping seed');
      return;
    }
    
    console.log('Seeding demo data...');
    
    // If we're here, we need to seed the missing demo data
    // This would normally be done via a server-side function for security reasons
    // For a real app, this would be replaced with a proper backend seeding process
    // that would handle creating the auth users and their profiles
    
    // In this implementation, we're assuming the demo users already exist in auth.users
    // and we're just making sure their profiles are properly set up
    
    // For demo purposes, we'll check and create demo branches if needed
    const { data: existingBranches, error: branchCheckError } = await supabase
      .from('branches')
      .select('id, name')
      .limit(3);
      
    if (branchCheckError) {
      console.error('Error checking for demo branches:', branchCheckError);
    }
    
    // If no branches exist, create some demo ones
    if (!existingBranches || existingBranches.length === 0) {
      const demoBranches = [
        { name: 'Downtown Cafe', timezone: 'America/New_York', address: '123 Main St, New York, NY' },
        { name: 'Uptown Juice Bar', timezone: 'America/Chicago', address: '456 Park Ave, Chicago, IL' },
        { name: 'Riverside Cafe', timezone: 'America/Los_Angeles', address: '789 River Rd, Los Angeles, CA' },
        { name: 'Airport Kiosk', timezone: 'America/Phoenix', address: '101 Terminal Way, Phoenix, AZ' }
      ];
      
      const { error: branchInsertError } = await supabase
        .from('branches')
        .insert(demoBranches);
        
      if (branchInsertError) {
        console.error('Error creating demo branches:', branchInsertError);
      } else {
        console.log('Created demo branches');
      }
    }
    
    // Seed categories if needed
    const { data: existingCategories, error: categoryCheckError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(5);
      
    if (categoryCheckError) {
      console.error('Error checking for categories:', categoryCheckError);
    }
    
    // If no categories exist, create demo ones
    if (!existingCategories || existingCategories.length === 0) {
      const demoCategories = [
        { name: 'Dairy' },
        { name: 'Produce' },
        { name: 'Coffee & Tea' },
        { name: 'Bakery' },
        { name: 'Packaging' }
      ];
      
      const { error: categoryInsertError } = await supabase
        .from('categories')
        .insert(demoCategories);
        
      if (categoryInsertError) {
        console.error('Error creating demo categories:', categoryInsertError);
      } else {
        console.log('Created demo categories');
      }
    }
    
    // Fetch the categories to get their IDs for ingredient creation
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name');
      
    if (categories && categories.length > 0) {
      // Check if ingredients exist
      const { data: existingIngredients, error: ingredientCheckError } = await supabase
        .from('ingredients')
        .select('id')
        .limit(1);
        
      if (ingredientCheckError) {
        console.error('Error checking for ingredients:', ingredientCheckError);
      }
      
      // If no ingredients exist, create demo ones
      if (!existingIngredients || existingIngredients.length === 0) {
        const getCategoryId = (name: string) => {
          const category = categories.find(c => c.name === name);
          return category ? category.id : null;
        };
        
        const demoIngredients = [
          { 
            name: 'Coffee Beans', 
            category_id: getCategoryId('Coffee & Tea'),
            unit: 'kg', 
            default_reorder_point: 5
          },
          { 
            name: 'Whole Milk', 
            category_id: getCategoryId('Dairy'),
            unit: 'liter', 
            default_reorder_point: 10
          },
          { 
            name: 'Avocado', 
            category_id: getCategoryId('Produce'),
            unit: 'pcs', 
            default_reorder_point: 15
          },
          { 
            name: 'Croissant', 
            category_id: getCategoryId('Bakery'),
            unit: 'pcs', 
            default_reorder_point: 20
          },
          { 
            name: 'To-Go Cups (12oz)', 
            category_id: getCategoryId('Packaging'),
            unit: 'box', 
            default_reorder_point: 3
          },
        ];
        
        const { error: ingredientInsertError } = await supabase
          .from('ingredients')
          .insert(demoIngredients);
          
        if (ingredientInsertError) {
          console.error('Error creating demo ingredients:', ingredientInsertError);
        } else {
          console.log('Created demo ingredients');
        }
      }
    }

    console.log('Demo data seeding completed');
  } catch (error) {
    console.error('Error seeding demo data:', error);
  }
};
