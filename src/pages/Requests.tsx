import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import RequestsFilters from '@/components/requests/RequestsFilters';
import RequestsTable from '@/components/requests/RequestsTable';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useRequestsFilters } from '@/hooks/requests/useRequestsFilters';
import { Skeleton } from '@/components/ui/skeleton';

interface RequestItemDB {
  id: string;
  ingredient_id: string;
  quantity: number;
  note?: string;
  ingredients: {
    name: string;
  };
}

interface RequestDB {
  id: string;
  branch_id: string;
  user_id: string;
  requested_at: string;
  status: 'pending' | 'fulfilled';
  branches: {
    name: string;
  };
  profiles: {
    name: string | null;
  };
  request_items: RequestItemDB[];
}

export interface RequestItem {
  id: string;
  branchId: string;
  branchName: string;
  userId: string;
  userName: string;
  requestedAt: string;
  status: 'pending' | 'fulfilled';
  itemsCount: number;
  detailText: string;
  requestItems?: {
    id: string;
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    note?: string;
  }[];
}

const Requests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // State for requests data and loading status
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [branches, setBranches] = useState<{ id: string, name: string }[]>([]);
  
  // Use our filter hook
  const {
    filters,
    setFilters,
    sortState,
    handleSort,
    resetFilters,
    activeFilterCount,
    filteredAndSortedItems
  } = useRequestsFilters(requests);

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
        userName: request.profiles?.name || 'Unknown User',
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
          profiles (
            name
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

  // Set up initial data and realtime subscription
  useEffect(() => {
    fetchRequests();
    fetchBranches();

    // Set up realtime subscription to requests updates
    const channel = supabase
      .channel('requests-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'requests' 
        }, 
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Get available branches based on user role
  const availableBranches = user?.role === 'owner' 
    ? branches 
    : branches.filter(branch => branch.id === user?.branchId);
  
  const showBranchSelector = user?.role === 'owner';

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Ingredient Requests</h1>
            <p className="text-muted-foreground">View and manage requests from your branches</p>
          </div>
        </div>
        
        <div className="space-y-4 mt-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-2/3" />
          
          <div className="space-y-2 mt-6">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ingredient Requests</h1>
          <p className="text-muted-foreground">View and manage requests from your branches</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" asChild>
            <Link to="/quick-request" target="_blank">
              <Plus className="h-4 w-4 mr-2" />
              Quick Request
            </Link>
          </Button>
          
          <Button onClick={() => navigate('/requests/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      <RequestsFilters 
        filters={filters}
        setFilters={setFilters}
        branches={availableBranches}
        resetFilters={resetFilters}
        activeFilterCount={activeFilterCount}
        showBranchSelector={showBranchSelector}
      />
      
      <RequestsTable 
        requests={filteredAndSortedItems} 
        onToggleStatus={handleToggleStatus} 
        showBranch={user?.role === 'owner'}
        sortState={sortState}
        onSort={handleSort}
      />
    </div>
  );
};

export default Requests;
