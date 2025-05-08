
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useRequestsRealtime = (
  refreshFunction: () => Promise<void>
) => {
  const { user } = useAuth();
  
  useEffect(() => {
    // Set up realtime subscription
    if (!user) return;

    // First, subscribe to requests changes
    const requestsChannel = supabase
      .channel('requests-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'requests'
      }, () => {
        refreshFunction();
      })
      .subscribe();
    
    // Then, subscribe to request_items changes
    const itemsChannel = supabase
      .channel('request-items-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'request_items' 
      }, () => {
        refreshFunction();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(itemsChannel);
    };
  }, [refreshFunction, user]);
};
