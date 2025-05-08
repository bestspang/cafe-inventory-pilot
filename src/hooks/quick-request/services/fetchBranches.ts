
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Branch } from '@/types';

export const fetchBranches = async (): Promise<Branch[]> => {
  try {
    console.log('Fetching branches...');
    
    // Try fetching from 'stores' table first (which has owner_id)
    const { data: storesData, error: storesError } = await supabase
      .from('stores')
      .select('id, name, owner_id, address, timezone')
      .order('name');
    
    if (storesError) {
      console.error('Error fetching from stores table:', storesError);
      
      // Fall back to 'branches' table, but select only the fields that exist
      const { data: branchesData, error: branchesError } = await supabase
        .from('branches')
        .select('id, name, address, timezone')
        .order('name');
      
      if (branchesError) {
        console.error('Error fetching from branches table:', branchesError);
        throw branchesError;
      }
      
      if (branchesData && branchesData.length > 0) {
        console.log('Branches loaded:', branchesData);
        // Add owner_id field to match Branch type requirement
        const branchesWithOwnerId = branchesData.map(branch => ({
          ...branch,
          owner_id: '' // Add empty owner_id as a fallback
        }));
        return branchesWithOwnerId as Branch[];
      }
      
      return [];
    } else if (storesData && storesData.length > 0) {
      console.log('Stores loaded:', storesData);
      return storesData as Branch[];
    }
    
    // If no data found in either table, return empty array
    return [];
  } catch (error) {
    console.error('Error fetching branches/stores:', error);
    toast({
      title: 'Error',
      description: 'Failed to fetch store locations',
      variant: 'destructive'
    });
    return [];
  }
};
