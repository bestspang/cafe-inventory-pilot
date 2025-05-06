
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRequestsRealtime = (fetchRequests: () => Promise<void>) => {
  useEffect(() => {
    // Set up realtime subscription to requests updates
    const channel = supabase
      .channel('requests-changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'requests' 
        }, 
        () => {
          fetchRequests();
        }
      )
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'requests' 
        }, 
        () => {
          fetchRequests();
        }
      )
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'request_items' 
        }, 
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRequests]);
};
