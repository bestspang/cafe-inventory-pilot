
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
  console.group(`Updating ${table} ${id}`);
  console.log('Changes:', changes);
  
  try {
    // Create a copy of the changes object to avoid mutating the original
    const updatePayload = { ...changes as any };
    
    // Only add updated_at timestamp if we're updating the branches table
    // This fixes the TypeScript error by making the check more specific
    if (table === 'branches') {
      updatePayload.updated_at = new Date().toISOString();
    }

    // Execute the update operation
    const { data, error, status, statusText } = await supabase
      .from(table)
      .update(updatePayload)
      .eq('id', id as any) // Type assertion to handle the complex type
      .select()
      .single();
      
    // Log detailed response information
    console.log('Response data:', data);
    console.log('Response error:', error);
    console.log('Status:', status, statusText);
    
    // Check for errors
    if (error) {
      console.error(`Error updating ${table}:`, error);
      toast.error(`Failed to update ${table}: ${error.message}`);
      return { success: false, error };
    }
    
    // Check if any rows were returned (indicating success)
    if (!data) {
      console.warn('Update request succeeded but no data returned - possible RLS issue');
    }
    
    // If successful and a refresh function was provided, call it
    if (refreshFn) {
      console.log('Refreshing data...');
      await refreshFn();
    }
    
    // Show success message
    const entityName = table.endsWith('es') 
      ? table.slice(0, -2) // branches -> branch
      : table.endsWith('s')
        ? table.slice(0, -1) // ingredients -> ingredient
        : table;
      
    toast.success(`${entityName} updated successfully`);
    
    return { success: true, data };
  } catch (error) {
    console.error(`Unexpected error updating ${table}:`, error);
    toast.error(`Failed to update ${table}: Unexpected error`);
    return { success: false, error };
  } finally {
    console.groupEnd();
  }
}
