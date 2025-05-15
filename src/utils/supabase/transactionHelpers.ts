
import { supabase } from '@/integrations/supabase/client';

// Begin a transaction
export async function beginTransaction() {
  try {
    // Call the RPC function without specific type assertion
    const { data, error } = await supabase.rpc('begin_transaction');
    return { data, error };
  } catch (error) {
    console.error('Error beginning transaction:', error);
    return { data: null, error };
  }
}

// Commit a transaction
export async function commitTransaction() {
  try {
    // Call the RPC function without specific type assertion
    const { data, error } = await supabase.rpc('commit_transaction');
    return { data, error };
  } catch (error) {
    console.error('Error committing transaction:', error);
    return { data: null, error };
  }
}

// Rollback a transaction
export async function rollbackTransaction() {
  try {
    // Call the RPC function without specific type assertion
    const { data, error } = await supabase.rpc('rollback_transaction');
    return { data, error };
  } catch (error) {
    console.error('Error rolling back transaction:', error);
    return { data: null, error };
  }
}
