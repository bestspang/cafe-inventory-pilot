
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import RequestsFilters from '@/components/requests/RequestsFilters';
import RequestsTable from '@/components/requests/RequestsTable';
import RequestsHeader from '@/components/requests/RequestsHeader';
import RequestsLoadingSkeleton from '@/components/requests/RequestsLoadingSkeleton';
import RequestsPagination from '@/components/requests/RequestsPagination';
import { useRequestsFetch } from '@/hooks/requests/useRequestsFetch';
import { useRequestStatusToggle } from '@/hooks/requests/useRequestStatusToggle';
import { useRequestsFilters } from '@/hooks/requests/useRequestsFilters';
import { useRequestsRealtime } from '@/hooks/requests/useRequestsRealtime';
import { ScrollArea } from '@/components/ui/scroll-area';

const Requests = () => {
  const { user } = useAuth();
  
  // Use our custom hooks
  const { requests, setRequests, isLoading, branches, fetchRequests } = useRequestsFetch();
  const { handleToggleStatus } = useRequestStatusToggle(requests, setRequests);
  
  // Set up realtime subscription
  useRequestsRealtime(fetchRequests);
  
  // Use our filter hook
  const {
    filters,
    setFilters,
    sortState,
    handleSort,
    resetFilters,
    activeFilterCount,
    paginatedItems,
    pagination
  } = useRequestsFilters(requests);

  // Get available branches based on user role
  const availableBranches = user?.role === 'owner' 
    ? branches 
    : branches.filter(branch => branch.id === user?.branchId);
  
  const showBranchSelector = user?.role === 'owner';

  // Show loading state
  if (isLoading) {
    return <RequestsLoadingSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <RequestsHeader />

      <RequestsFilters 
        filters={filters}
        setFilters={setFilters}
        branches={availableBranches}
        resetFilters={resetFilters}
        activeFilterCount={activeFilterCount}
        showBranchSelector={showBranchSelector}
      />
      
      <ScrollArea className="w-full overflow-auto">
        <RequestsTable 
          requests={paginatedItems} 
          onToggleStatus={handleToggleStatus} 
          showBranch={user?.role === 'owner'}
          sortState={sortState}
          onSort={handleSort}
          onRefresh={fetchRequests}
        />
      </ScrollArea>
      
      <RequestsPagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        onPageChange={pagination.handlePageChange}
      />
    </div>
  );
};

export default Requests;
