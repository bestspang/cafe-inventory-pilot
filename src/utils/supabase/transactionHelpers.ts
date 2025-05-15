
import { supabase } from '@/integrations/supabase/client';

// Begin a transaction
export async function beginTransaction() {
  return await supabase.rpc('begin_transaction');
}

// Commit a transaction
export async function commitTransaction() {
  return await supabase.rpc('commit_transaction');
}

// Rollback a transaction
export async function rollbackTransaction() {
  return await supabase.rpc('rollback_transaction');
}
