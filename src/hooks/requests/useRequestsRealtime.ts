
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useRequestsRealtime = (
  refreshFunction: () => Promise<void>
) => {
  const { user } = useAuth();
  
  useEffect(() => {
    // Set up realtime subscription
    // For owners, listen to all changes across all branches
    // For other roles, only listen to changes in their branch
    let channelFilter = {};
    
    if (user && user.role !== 'owner' && user.branchId) {
      channelFilter = {
        filter: `branch_id=eq.${user.branchId}`
      };
    }
    
    const channel = supabase
      .channel('requests-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'requests',
        ...channelFilter
      }, () => {
        refreshFunction();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'request_items' 
      }, () => {
        refreshFunction();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshFunction, user]);
};
