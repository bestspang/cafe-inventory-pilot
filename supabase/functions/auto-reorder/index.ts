
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.15.0';

// Define types for the edge function
interface WebhookPayload {
  type: string;
  table: string;
  record: any;
  schema: string;
  old_record: any;
}

// Setup Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  // Parse the webhook payload
  const payload: WebhookPayload = await req.json();
  
  // Only proceed for stock_check_items insertions or branch_inventory updates
  if ((payload.table !== 'stock_check_items' && payload.table !== 'branch_inventory') || 
      (payload.type !== 'INSERT' && payload.type !== 'UPDATE')) {
    return new Response(JSON.stringify({ message: 'Not relevant update' }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    let branchId: string;
    let ingredientId: string;
    let currentQty: number;
    
    // Handle different table sources
    if (payload.table === 'stock_check_items') {
      // For stock_check_items, we need to get the branch_id from the parent stock_check
      ingredientId = payload.record.ingredient_id;
      const onHandQty = payload.record.on_hand_qty;
      
      // Get the stock check to find the branch_id
      const { data: stockCheck, error: stockCheckError } = await supabase
        .from('stock_checks')
        .select('branch_id')
        .eq('id', payload.record.stock_check_id)
        .single();
      
      if (stockCheckError) {
        throw new Error(`Failed to get stock check: ${stockCheckError.message}`);
      }
      
      branchId = stockCheck.branch_id;
      currentQty = onHandQty;
      
    } else {
      // For branch_inventory direct updates
      branchId = payload.record.branch_id;
      ingredientId = payload.record.ingredient_id;
      currentQty = payload.record.on_hand_qty;
    }
    
    // Get the reorder point for this item in this branch
    const { data: inventoryItem, error: inventoryError } = await supabase
      .from('branch_inventory')
      .select('reorder_pt')
      .eq('branch_id', branchId)
      .eq('ingredient_id', ingredientId)
      .maybeSingle();
    
    if (inventoryError) {
      throw new Error(`Failed to get inventory item: ${inventoryError.message}`);
    }
    
    // If we don't have a reorder point or qty is above it, no action needed
    const reorderPt = inventoryItem?.reorder_pt || 0;
    if (currentQty > reorderPt) {
      return new Response(JSON.stringify({ message: 'Inventory level acceptable' }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // Get ingredient details
    const { data: ingredient, error: ingredientError } = await supabase
      .from('ingredients')
      .select('name, unit')
      .eq('id', ingredientId)
      .single();
    
    if (ingredientError) {
      throw new Error(`Failed to get ingredient: ${ingredientError.message}`);
    }
    
    // Get branch details
    const { data: branch, error: branchError } = await supabase
      .from('branches')
      .select('name')
      .eq('id', branchId)
      .single();
    
    if (branchError) {
      throw new Error(`Failed to get branch: ${branchError.message}`);
    }
    
    // Calculate suggested order quantity (reorder point - current + buffer)
    const suggestedQty = Math.max(reorderPt - currentQty + 5, 1); // Minimum of 1 unit
    
    // Check if we already have a draft PO for this branch
    const { data: existingPO, error: poError } = await supabase
      .from('purchase_orders')
      .select('id')
      .eq('branch_id', branchId)
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (poError) {
      throw new Error(`Failed to check for existing POs: ${poError.message}`);
    }
    
    let poId: string;
    
    if (existingPO) {
      // Use existing PO
      poId = existingPO.id;
    } else {
      // Create a new PO
      const { data: newPO, error: newPoError } = await supabase
        .from('purchase_orders')
        .insert({
          branch_id: branchId,
          status: 'draft',
          notes: `Auto-generated PO for ${branch.name} low inventory items`,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (newPoError) {
        throw new Error(`Failed to create PO: ${newPoError.message}`);
      }
      
      poId = newPO.id;
    }
    
    // Check if this ingredient is already on the PO
    const { data: existingItem, error: itemError } = await supabase
      .from('purchase_order_items')
      .select('id, quantity')
      .eq('po_id', poId)
      .eq('ingredient_id', ingredientId)
      .maybeSingle();
    
    if (itemError) {
      throw new Error(`Failed to check for existing PO items: ${itemError.message}`);
    }
    
    if (existingItem) {
      // Update existing item with higher quantity if needed
      if (existingItem.quantity < suggestedQty) {
        await supabase
          .from('purchase_order_items')
          .update({ quantity: suggestedQty })
          .eq('id', existingItem.id);
      }
    } else {
      // Add new item to PO
      await supabase
        .from('purchase_order_items')
        .insert({
          po_id: poId,
          ingredient_id: ingredientId,
          quantity: suggestedQty,
          notes: `Auto-reordered (${currentQty}/${reorderPt})`
        });
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        message: `Ingredient ${ingredient.name} added to PO for ${branch.name}`,
        poId: poId,
        ingredientId: ingredientId,
        suggestedQty: suggestedQty
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error('Error in auto-reorder function:', error);
    
    // Return error response
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
