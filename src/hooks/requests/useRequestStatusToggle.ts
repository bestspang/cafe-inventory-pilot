
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RequestItem } from '@/types/requests';

export const useRequestStatusToggle = (requests: RequestItem[], setRequests: React.Dispatch<React.SetStateAction<RequestItem[]>>) => {
  const { toast } = useToast();

  // Toggle request status (mark as fulfilled or reopen)
  const handleToggleStatus = async (requestId: string) => {
    // Find the current request
    const currentRequest = requests.find(req => req.id === requestId);
    if (!currentRequest) return;

    // Determine the new status
    const newStatus = currentRequest.status === 'pending' ? 'fulfilled' : 'pending';
    
    // Optimistic update
    setRequests(prev => prev.map(request => {
      if (request.id === requestId) {
        return {
          ...request,
          status: newStatus
        };
      }
      return request;
    }));

    // Update in Supabase
    try {
      const { error } = await supabase
        .from('requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) {
        throw error;
      }

      toast({
        title: `Request ${newStatus === 'fulfilled' ? 'fulfilled' : 'reopened'}`,
        description: `Request has been ${newStatus === 'fulfilled' ? 'marked as fulfilled' : 'reopened'}.`
      });
    } catch (error: any) {
      // Rollback optimistic update on error
      setRequests(prev => prev.map(request => {
        if (request.id === requestId) {
          return {
            ...request,
            status: currentRequest.status
          };
        }
        return request;
      }));

      toast({
        title: 'Failed to update request',
        description: error.message || 'The operation failed, please try again.',
        variant: 'destructive'
      });
    }
  };

  return { handleToggleStatus };
};
