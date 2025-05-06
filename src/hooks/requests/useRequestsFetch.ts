
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RequestItem, RequestDB } from '@/types/requests';

export const useRequestsFetch = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [branches, setBranches] = useState<{ id: string, name: string }[]>([]);

  // Transform database response to our RequestItem format
  const transformRequests = (data: RequestDB[]): RequestItem[] => {
    return data.map(request => {
      // Create detailed text of all items
      const detailText = request.request_items
        .map(item => `${item.ingredients.name} (${item.quantity})${item.note ? ` - ${item.note}` : ''}`)
        .join(', ');
      
      // Transform each request to match our expected format
      return {
        id: request.id,
        branchId: request.branch_id,
        branchName: request.branches.name,
        userId: request.user_id,
        userName: request.store_staff?.staff_name || 'Unknown User',
        requestedAt: request.requested_at,
        status: request.status,
        itemsCount: request.request_items.length,
        detailText,
        requestItems: request.request_items.map(item => ({
          id: item.id,
          ingredientId: item.ingredient_id,
          ingredientName: item.ingredients.name,
          quantity: item.quantity,
          note: item.note
        }))
      };
    });
  };

  // Fetch requests from Supabase
  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('requests')
        .select(`
          id,
          branch_id,
          user_id,
          requested_at,
          status,
          branches (
            name
          ),
          store_staff (
            staff_name
          ),
          request_items (
            id,
            ingredient_id,
            quantity,
            note,
            ingredients (
              name
            )
          )
        `)
        .order('requested_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setRequests(transformRequests(data as RequestDB[]));
      }
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      toast({
        title: 'Error fetching requests',
        description: error.message || 'Failed to load requests',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch branches for filter
  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name')
        .order('name');

      if (error) {
        throw error;
      }

      if (data) {
        setBranches(data);
      }
    } catch (error: any) {
      console.error('Error fetching branches:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchRequests();
    fetchBranches();
  }, []);

  return {
    requests,
    setRequests,
    isLoading,
    branches,
    fetchRequests
  };
};
