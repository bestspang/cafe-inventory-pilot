
import { supabase } from '@/integrations/supabase/client';

// Begin a transaction
export async function beginTransaction() {
  try {
    // Use a type assertion to bypass TypeScript's type checking for the RPC function name
    const { data, error } = await supabase.rpc('begin_transaction' as any);
    
    if (error) {
      console.error('Error beginning transaction:', error);
    }
    
    return { data, error };
  } catch (error) {
    console.error('Error beginning transaction:', error);
    return { data: null, error };
  }
}

// Commit a transaction
export async function commitTransaction() {
  try {
    // Use a type assertion to bypass TypeScript's type checking for the RPC function name
    const { data, error } = await supabase.rpc('commit_transaction' as any);
    
    if (error) {
      console.error('Error committing transaction:', error);
    }
    
    return { data, error };
  } catch (error) {
    console.error('Error committing transaction:', error);
    return { data: null, error };
  }
}

// Rollback a transaction
export async function rollbackTransaction() {
  try {
    // Use a type assertion to bypass TypeScript's type checking for the RPC function name
    const { data, error } = await supabase.rpc('rollback_transaction' as any);
    
    if (error) {
      console.error('Error rolling back transaction:', error);
    }
    
    return { data, error };
  } catch (error) {
    console.error('Error rolling back transaction:', error);
    return { data: null, error };
  }
}
