
import { supabase } from '@/integrations/supabase/client';

export async function beginTransaction() {
  return supabase.rpc('begin_transaction');
}

export async function commitTransaction() {
  return supabase.rpc('commit_transaction');
}

export async function rollbackTransaction() {
  return supabase.rpc('rollback_transaction');
}
