import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import RequestsFilters from '@/components/requests/RequestsFilters';
import RequestsTable, { RequestItem } from '@/components/requests/RequestsTable';
import { useRequestsFilters } from '@/hooks/requests/useRequestsFilters';
import { Link } from 'react-router-dom';

// Mock data for demo purposes
const mockRequests: RequestItem[] = [
  {
    id: '1',
    branchId: '1',
    branchName: 'Downtown Cafe',
    userId: '3',
    userName: 'Mike Staff',
    requestedAt: '2023-05-02T10:30:00Z',
    status: 'pending',
    itemsCount: 3,
    detailText: 'Coffee Beans (5kg), Milk (10L), Sugar (2kg)'
  },
  {
    id: '2',
    branchId: '2',
    branchName: 'Uptown Juice Bar',
    userId: '4',
    userName: 'Jane Staff',
    requestedAt: '2023-05-01T14:45:00Z',
    status: 'fulfilled',
    itemsCount: 2,
    detailText: 'Avocados (20pcs), Lemons (30pcs)'
  },
  {
    id: '3',
    branchId: '1',
    branchName: 'Downtown Cafe',
    userId: '3',
    userName: 'Mike Staff',
    requestedAt: '2023-04-29T09:15:00Z',
    status: 'pending',
    itemsCount: 1,
    detailText: 'To-Go Cups (3 boxes)'
  },
  {
    id: '4',
    branchId: '3',
    branchName: 'Riverside Cafe',
    userId: '5',
    userName: 'Alex Staff',
    requestedAt: '2023-04-28T16:20:00Z',
    status: 'pending',
    itemsCount: 4,
    detailText: 'Napkins (5 packs), Straws (2 boxes), Coffee Filters (3 boxes), Tea bags (10 packs)'
  },
  {
    id: '5',
    branchId: '4',
    branchName: 'Airport Kiosk',
    userId: '6',
    userName: 'Sam Staff',
    requestedAt: '2023-04-25T11:05:00Z',
    status: 'fulfilled',
    itemsCount: 2,
    detailText: 'Coffee Beans (2kg), Pastries (20pcs)'
  }
];

// Mock branch data
const mockBranches = [
  { id: '1', name: 'Downtown Cafe' },
  { id: '2', name: 'Uptown Juice Bar' },
  { id: '3', name: 'Riverside Cafe' },
  { id: '4', name: 'Airport Kiosk' },
];

const Requests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Initialize request state
  const [requests, setRequests] = useState(mockRequests);
  
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

  const handleToggleStatus = (requestId: string) => {
    setRequests(prev => prev.map(request => {
      if (request.id === requestId) {
        const newStatus = request.status === 'pending' ? 'fulfilled' : 'pending';
        
        toast({
          title: `Request ${newStatus === 'fulfilled' ? 'fulfilled' : 'reopened'}`,
          description: `Request #${requestId} has been ${newStatus === 'fulfilled' ? 'marked as fulfilled' : 'reopened'}.`
        });
        
        return {
          ...request,
          status: newStatus
        };
      }
      return request;
    }));
  };

  // Get available branches based on user role
  const availableBranches = user?.role === 'owner' 
    ? mockBranches 
    : mockBranches.filter(branch => branch.id === user?.branchId);
  
  const showBranchSelector = user?.role === 'owner';

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
