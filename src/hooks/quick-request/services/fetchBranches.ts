
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Branch } from '@/types';

export const fetchBranches = async (): Promise<Branch[]> => {
  try {
    console.log('Fetching branches...');
    
    // Try fetching from 'branches' table first
    const { data: branchesData, error: branchesError } = await supabase
      .from('branches')
      .select('id, name')
      .order('name');
    
    if (branchesError) {
      console.error('Error fetching from branches table:', branchesError);
      
      // Fall back to 'stores' table if there was an error
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('id, name')
        .order('name');
      
      if (storesError) {
        console.error('Error fetching from stores table:', storesError);
        throw storesError;
      }
      
      if (storesData && storesData.length > 0) {
        console.log('Stores loaded:', storesData);
        return storesData;
      }
    } else if (branchesData && branchesData.length > 0) {
      console.log('Branches loaded:', branchesData);
      return branchesData;
    } else {
      console.log('No branches found in branches table, trying stores table');
      
      // If no branches found, try stores table
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('id, name')
        .order('name');
      
      if (storesError) {
        console.error('Error fetching from stores table:', storesError);
        throw storesError;
      }
      
      console.log('Stores loaded:', storesData);
      return storesData || [];
    }
  } catch (error) {
    console.error('Error fetching branches/stores:', error);
    toast({
      title: 'Error',
      description: 'Failed to fetch store locations',
      variant: 'destructive'
    });
  }
  return [];
};
