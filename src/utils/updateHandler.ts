
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Define TableName as the union of all table names in the Database type
type TableName = keyof Database['public']['Tables'];

interface UpdateResponse<T> {
  success: boolean;
  data?: T;
  error?: any;
}

/**
 * Generic update handler with detailed logging for debugging update operations
 */
export async function handleUpdate<T extends TableName>(
  table: T,
  id: string,
  changes: Partial<Database['public']['Tables'][T]['Update']>,
  refreshFn?: () => Promise<void>
): Promise<UpdateResponse<any>> {
  console.group(`[handleUpdate] Updating ${table} ${id}`);
  console.log('[handleUpdate] Received table:', table);
  console.log('[handleUpdate] Received id:', id);
  console.log('[handleUpdate] Received changes:', changes);
  
  try {
    // Create a copy of the changes object to avoid mutating the original
    const updatePayload = { ...changes as any };
    console.log('[handleUpdate] Initial updatePayload:', updatePayload);
    
    // Only add updated_at timestamp if we're updating the branches table
    // This fixes the TypeScript error by making the check more specific
    if (table === 'branches') {
      updatePayload.updated_at = new Date().toISOString();
      console.log('[handleUpdate] Added updated_at to payload:', updatePayload);
    }

    // Execute the update operation - don't use .single() on first query
    console.log(`[handleUpdate] Calling supabase.from('${table}').update().eq('id', '${id}') with payload:`, updatePayload);
    const { data: updateData, error: updateError, status, statusText } = await supabase
      .from(table)
      .update(updatePayload)
      .eq('id', id as any)
      .select();
      
    // Log detailed response information
    console.log('[handleUpdate] Supabase update response data:', updateData);
    console.log('[handleUpdate] Supabase update response error:', updateError);
    console.log('[handleUpdate] Supabase update response status:', status, statusText);
    
    // Check for errors
    if (updateError) {
      console.error(`Error updating ${table}:`, updateError);
      toast.error(`Failed to update ${table}: ${updateError.message}`);
      return { success: false, error: updateError };
    }
    
    // Update likely succeeded, fetch the updated record to return it
    console.log('[handleUpdate] Update reported success, fetching updated record...');
    
    const { data: fetchedData, error: fetchError } = await supabase
      .from(table)
      .select('*')
      .eq('id', id as any)
      .single();
      
    console.log('[handleUpdate] Fetched record data:', fetchedData);
    console.log('[handleUpdate] Fetched record error:', fetchError);

    if (fetchError) {
      // Handle case where fetching the updated record fails
      console.error('[handleUpdate] Update succeeded, but failed to fetch updated record:', fetchError);
      toast.error(`Update successful, but couldn't retrieve the latest data.`);
      // Return success: true, but potentially without data
      return { success: true, data: null, error: fetchError }; 
    } else {
      console.log('[handleUpdate] Fetched updated record:', fetchedData);
    }
    
    // If successful and a refresh function was provided, call it
    if (refreshFn) {
      console.log('[handleUpdate] Refreshing data...');
      await refreshFn();
    }
    
    // Show success message
    const entityName = table.endsWith('es') 
      ? table.slice(0, -2) // branches -> branch
      : table.endsWith('s')
        ? table.slice(0, -1) // ingredients -> ingredient
        : table;
      
    toast.success(`${entityName} updated successfully`);
    
    // Return the fetched data
    return { success: true, data: fetchedData };
  } catch (error) {
    console.error(`[handleUpdate] Unexpected error updating ${table}:`, error);
    toast.error(`Failed to update ${table}: Unexpected error`);
    return { success: false, error };
  } finally {
    console.groupEnd();
  }
}
