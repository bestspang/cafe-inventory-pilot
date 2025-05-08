
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRequestsRealtime = (
  refreshFunction: () => Promise<void>,
  storeId?: string | null
) => {
  useEffect(() => {
    console.log('Setting up realtime subscription for requests');
    
    // Base channel configuration
    const channel = supabase
      .channel('requests-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'requests',
          ...(storeId ? { filter: `branch_id=eq.${storeId}` } : {})
        }, 
        () => {
          console.log('Requests changed, refreshing data...');
          refreshFunction();
        }
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'request_items'
        }, 
        () => {
          console.log('Request items changed, refreshing data...');
          refreshFunction();
        }
      )
      .subscribe();

    return () => {
      console.log('Removing realtime subscription for requests');
      supabase.removeChannel(channel);
    };
  }, [refreshFunction, storeId]);
};
