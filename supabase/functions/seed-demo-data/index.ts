
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Create a Supabase client with the Auth context of the logged-in user
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    console.log('Seeding demo data...');
    
    // 1. Seed demo user accounts if they don't exist
    await seedDemoUsers(supabaseClient);
    
    // 2. Seed branches
    await seedBranches(supabaseClient);
    
    // 3. Seed categories
    await seedCategories(supabaseClient);
    
    // 4. Seed ingredients
    await seedIngredients(supabaseClient);
    
    // 5. Seed stock checks
    await seedStockChecks(supabaseClient);
    
    // 6. Seed requests
    await seedRequests(supabaseClient);
    
    return new Response(
      JSON.stringify({ success: true, message: 'Demo data seeded successfully' }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error seeding demo data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 500 
      }
    );
  }
});

async function seedDemoUsers(supabase) {
  console.log('Seeding demo users...');
  
  // Check if owner@cafeapp.com already exists
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', 'owner@cafeapp.com')
    .single();
  
  // Only seed users if demo users don't exist
  if (!existingUser) {
    // First, create the auth users
    
    // Owner user
    const { data: ownerData, error: ownerError } = await supabase.auth.admin.createUser({
      email: 'owner@cafeapp.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: { name: 'Owner Demo' }
    });
    
    if (ownerError) throw ownerError;
    
    // Manager user
    const { data: managerData, error: managerError } = await supabase.auth.admin.createUser({
      email: 'manager@cafeapp.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: { name: 'Manager Demo' }
    });
    
    if (managerError) throw managerError;
    
    // Staff user
    const { data: staffData, error: staffError } = await supabase.auth.admin.createUser({
      email: 'staff@cafeapp.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: { name: 'Staff Demo' }
    });
    
    if (staffError) throw staffError;
    
    // Update profiles with roles
    if (ownerData.user) {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'owner' })
        .eq('id', ownerData.user.id);
      
      if (error) throw error;
    }
    
    if (managerData.user) {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'manager' })
        .eq('id', managerData.user.id);
      
      if (error) throw error;
    }
    
    if (staffData.user) {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'staff' })
        .eq('id', staffData.user.id);
      
      if (error) throw error;
    }
  }
}

async function seedBranches(supabase) {
  console.log('Seeding branches...');
  
  // Check if branches already exist
  const { count } = await supabase
    .from('branches')
    .select('*', { count: 'exact', head: true });
    
  if (count === 0) {
    // Insert demo branches
    const { error } = await supabase.from('branches').insert([
      { name: 'Downtown Cafe', address: '123 Main St, Downtown', timezone: 'America/New_York' },
      { name: 'Uptown Juice Bar', address: '456 Park Ave, Uptown', timezone: 'America/New_York' },
      { name: 'Riverside Cafe', address: '789 River Rd, Riverside', timezone: 'America/Chicago' },
      { name: 'Airport Kiosk', address: 'Terminal B, International Airport', timezone: 'America/Los_Angeles' }
    ]);
    
    if (error) throw error;
  }
}

async function seedCategories(supabase) {
  console.log('Seeding categories...');
  
  // Check if categories already exist
  const { count } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true });
    
  if (count === 0) {
    // Insert demo categories
    const { error } = await supabase.from('categories').insert([
      { name: 'Dairy' },
      { name: 'Produce' },
      { name: 'Coffee & Tea' },
      { name: 'Bakery' },
      { name: 'Packaging' }
    ]);
    
    if (error) throw error;
  }
}

async function seedIngredients(supabase) {
  console.log('Seeding ingredients...');
  
  // Check if ingredients already exist
  const { count } = await supabase
    .from('ingredients')
    .select('*', { count: 'exact', head: true });
    
  if (count === 0) {
    // Get categories
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name');
      
    if (!categories) throw new Error('Categories not found');
    
    // Find category IDs by name
    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.name] = cat.id;
      return acc;
    }, {});
    
    // Insert demo ingredients
    const { error } = await supabase.from('ingredients').insert([
      { name: 'Coffee Beans', category_id: categoryMap['Coffee & Tea'], unit: 'kg', default_reorder_point: 5 },
      { name: 'Whole Milk', category_id: categoryMap['Dairy'], unit: 'liter', default_reorder_point: 10 },
      { name: 'Almond Milk', category_id: categoryMap['Dairy'], unit: 'liter', default_reorder_point: 8 },
      { name: 'Avocado', category_id: categoryMap['Produce'], unit: 'pcs', default_reorder_point: 15 },
      { name: 'Bananas', category_id: categoryMap['Produce'], unit: 'kg', default_reorder_point: 7 },
      { name: 'Croissant', category_id: categoryMap['Bakery'], unit: 'pcs', default_reorder_point: 20 },
      { name: 'Bagel', category_id: categoryMap['Bakery'], unit: 'pcs', default_reorder_point: 18 },
      { name: 'To-Go Cups (12oz)', category_id: categoryMap['Packaging'], unit: 'box', default_reorder_point: 3 },
      { name: 'Napkins', category_id: categoryMap['Packaging'], unit: 'pack', default_reorder_point: 5 }
    ]);
    
    if (error) throw error;
  }
}

async function seedStockChecks(supabase) {
  console.log('Seeding stock checks...');
  
  // Check if stock checks already exist
  const { count } = await supabase
    .from('stock_checks')
    .select('*', { count: 'exact', head: true });
    
  if (count === 0) {
    // Get branches
    const { data: branches } = await supabase
      .from('branches')
      .select('id');
      
    if (!branches || branches.length === 0) throw new Error('No branches found');
    
    // Get staff user
    const { data: staffUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'staff@cafeapp.com')
      .single();
      
    if (!staffUser) throw new Error('Staff user not found');
    
    // Get ingredients
    const { data: ingredients } = await supabase
      .from('ingredients')
      .select('id');
      
    if (!ingredients || ingredients.length === 0) throw new Error('No ingredients found');
    
    // Create stock checks for each branch
    for (const branch of branches) {
      // Insert a stock check
      const { data: stockCheck, error } = await supabase
        .from('stock_checks')
        .insert({
          branch_id: branch.id,
          user_id: staffUser.id,
          checked_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Insert stock check items
      const stockCheckItems = ingredients.map(ingredient => ({
        stock_check_id: stockCheck.id,
        ingredient_id: ingredient.id,
        on_hand_qty: Math.floor(Math.random() * 20) + 1 // Random quantity between 1 and 20
      }));
      
      const { error: itemsError } = await supabase
        .from('stock_check_items')
        .insert(stockCheckItems);
        
      if (itemsError) throw itemsError;
    }
  }
}

async function seedRequests(supabase) {
  console.log('Seeding requests...');
  
  // Check if requests already exist
  const { count } = await supabase
    .from('requests')
    .select('*', { count: 'exact', head: true });
    
  if (count === 0) {
    // Get branches
    const { data: branches } = await supabase
      .from('branches')
      .select('id');
      
    if (!branches || branches.length === 0) throw new Error('No branches found');
    
    // Get staff user
    const { data: staffUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'staff@cafeapp.com')
      .single();
      
    if (!staffUser) throw new Error('Staff user not found');
    
    // Get ingredients
    const { data: ingredients } = await supabase
      .from('ingredients')
      .select('id');
      
    if (!ingredients || ingredients.length === 0) throw new Error('No ingredients found');
    
    // Create a few requests with different statuses
    const statuses = ['pending', 'approved', 'completed', 'rejected'];
    
    for (let i = 0; i < branches.length; i++) {
      const branch = branches[i];
      const status = statuses[i % statuses.length];
      
      // Create request
      const { data: request, error } = await supabase
        .from('requests')
        .insert({
          branch_id: branch.id,
          user_id: staffUser.id,
          status: status,
          requested_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Add 2-4 random ingredients to the request
      const numItems = Math.floor(Math.random() * 3) + 2; // 2-4 items
      const selectedIngredients = [];
      
      while (selectedIngredients.length < numItems) {
        const randomIndex = Math.floor(Math.random() * ingredients.length);
        const ingredient = ingredients[randomIndex];
        
        if (!selectedIngredients.some(item => item.id === ingredient.id)) {
          selectedIngredients.push(ingredient);
        }
      }
      
      const requestItems = selectedIngredients.map(ingredient => ({
        request_id: request.id,
        ingredient_id: ingredient.id,
        quantity: Math.floor(Math.random() * 10) + 1, // Random quantity between 1 and 10
        note: Math.random() > 0.7 ? 'Urgent' : null // Sometimes add a note
      }));
      
      const { error: itemsError } = await supabase
        .from('request_items')
        .insert(requestItems);
        
      if (itemsError) throw itemsError;
    }
  }
}
