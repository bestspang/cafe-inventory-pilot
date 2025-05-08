
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Branch } from '@/types';

export const fetchBranches = async (): Promise<Branch[]> => {
  try {
    console.log('Fetching branches from stores table...');
    
    // Only fetch from 'stores' table
    const { data: storesData, error: storesError } = await supabase
      .from('stores')
      .select('id, name, owner_id, address, timezone, is_open, created_at, updated_at')
      .order('name');
    
    if (storesError) {
      console.error('Error fetching from stores table:', storesError);
      throw storesError;
    }
    
    if (storesData && storesData.length > 0) {
      console.log('Stores loaded:', storesData);
      return storesData as Branch[];
    }
    
    // If no data found, return empty array
    return [];
  } catch (error) {
    console.error('Error fetching stores:', error);
    toast({
      title: 'Error',
      description: 'Failed to fetch store locations',
      variant: 'destructive'
    });
    return [];
  }
};
