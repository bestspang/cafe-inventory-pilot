
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.15.0';

// Define types
interface WebhookPayload {
  type: string;
  table: string;
  record: any;
  schema: string;
}

// Setup Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  // Parse the webhook payload
  const payload: WebhookPayload = await req.json();
  
  // Only proceed for branch_inventory updates or stock_check_items insertions
  if ((payload.table !== 'branch_inventory' && payload.table !== 'stock_check_items') || 
      (payload.type !== 'INSERT' && payload.type !== 'UPDATE')) {
    return new Response(JSON.stringify({ message: 'Not relevant update' }), { 
      headers: { "Content-Type": "application/json" },
      status: 200
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    let branchId: string;
    let ingredientId: string;
    let currentQty: number;
    
    // Extract data based on the table being updated
    if (payload.table === 'branch_inventory') {
      branchId = payload.record.branch_id;
      ingredientId = payload.record.ingredient_id;
      currentQty = payload.record.on_hand_qty;
    } else {
      // For stock_check_items, we need to get the branch_id from the parent stock_check
      const { data: stockCheck, error: stockCheckError } = await supabase
        .from('stock_checks')
        .select('branch_id')
        .eq('id', payload.record.stock_check_id)
        .single();
      
      if (stockCheckError) {
        throw new Error(`Failed to get stock check: ${stockCheckError.message}`);
      }
      
      branchId = stockCheck.branch_id;
      ingredientId = payload.record.ingredient_id;
      currentQty = payload.record.on_hand_qty;
    }
    
    // Get inventory info including reorder point
    const { data: inventory, error: inventoryError } = await supabase
      .from('branch_inventory')
      .select('reorder_pt')
      .eq('branch_id', branchId)
      .eq('ingredient_id', ingredientId)
      .maybeSingle();
    
    if (inventoryError) {
      throw new Error(`Error fetching inventory: ${inventoryError.message}`);
    }
    
    const reorderPt = inventory?.reorder_pt || 0;
    
    // If quantity is not low, no need to notify
    if (currentQty > reorderPt) {
      return new Response(JSON.stringify({ message: 'Stock level acceptable' }), {
        headers: { "Content-Type": "application/json" },
        status: 200
      });
    }
    
    // Get ingredient and branch details for notification
    const { data: ingredient, error: ingredientError } = await supabase
      .from('ingredients')
      .select('name, unit')
      .eq('id', ingredientId)
      .single();
    
    if (ingredientError) {
      throw new Error(`Error fetching ingredient: ${ingredientError.message}`);
    }
    
    const { data: branch, error: branchError } = await supabase
      .from('branches')
      .select('name')
      .eq('id', branchId)
      .single();
    
    if (branchError) {
      throw new Error(`Error fetching branch: ${branchError.message}`);
    }
    
    // Create notification in the system
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        type: 'low_stock',
        title: `Low Stock Alert: ${ingredient.name}`,
        content: `${ingredient.name} is running low at ${branch.name}. Current quantity: ${currentQty} ${ingredient.unit} (Reorder point: ${reorderPt} ${ingredient.unit})`,
        branch_id: branchId,
        ingredient_id: ingredientId,
        status: 'unread',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (notificationError) {
      throw new Error(`Error creating notification: ${notificationError.message}`);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Notification created for low stock of ${ingredient.name} at ${branch.name}`,
        notification: notification
      }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 200
      }
    );
    
  } catch (error) {
    console.error('Error in stock notifications function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
