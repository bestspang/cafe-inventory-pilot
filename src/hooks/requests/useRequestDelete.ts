
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useRequestDelete = (fetchRequests: () => Promise<void>) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const deleteRequest = async (requestId: string) => {
    try {
      setIsDeleting(true);
      
      // First delete related request items
      const { error: itemsError } = await supabase
        .from('request_items')
        .delete()
        .eq('request_id', requestId);

      if (itemsError) throw itemsError;

      // Then delete the request itself
      const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Request deleted',
        description: 'The request has been successfully deleted',
        variant: 'default', // Changed from 'success' to 'default'
      });
      
      // Refresh the requests list
      await fetchRequests();
    } catch (error: any) {
      console.error('Error deleting request:', error);
      toast({
        title: 'Error deleting request',
        description: error.message || 'Failed to delete request',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteRequest,
    isDeleting
  };
};
