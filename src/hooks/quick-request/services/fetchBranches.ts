
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Branch } from '@/types';

export const fetchBranches = async (): Promise<Branch[]> => {
  try {
    console.log('Fetching branches from stores table for quick request...');
    
    const { data: storesData, error: storesError } = await supabase
      .from('stores')
      .select('*')
      .order('name');
    
    if (storesError) {
      console.error('Error fetching stores:', storesError);
      toast({
        title: 'Error',
        description: 'Failed to fetch store locations',
        variant: 'destructive'
      });
      return [];
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
