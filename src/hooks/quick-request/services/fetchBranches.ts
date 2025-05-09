
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Branch } from '@/types';

export const fetchBranches = async (): Promise<Branch[]> => {
  try {
    console.log('Fetching branches from stores table for quick request...');
    
    // Only fetch from 'stores' table, consistently
    const { data: storesData, error: storesError } = await supabase
      .from('stores')
      .select('*')
      .order('name');
    
    if (storesError) {
      console.error('Error fetching from stores table:', storesError);
      throw storesError;
    }
    
    if (storesData && storesData.length > 0) {
      console.log('Stores loaded successfully:', storesData);
      return storesData as Branch[];
    }
    
    console.log('No stores found');
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
