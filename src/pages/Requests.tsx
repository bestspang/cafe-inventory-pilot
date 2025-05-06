
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import RequestsFilters from '@/components/requests/RequestsFilters';
import RequestsTable from '@/components/requests/RequestsTable';
import RequestsHeader from '@/components/requests/RequestsHeader';
import RequestsLoadingSkeleton from '@/components/requests/RequestsLoadingSkeleton';
import { useRequestsFetch } from '@/hooks/requests/useRequestsFetch';
import { useRequestStatusToggle } from '@/hooks/requests/useRequestStatusToggle';
import { useRequestsFilters } from '@/hooks/requests/useRequestsFilters';
import { useRequestsRealtime } from '@/hooks/requests/useRequestsRealtime';

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
    filteredAndSortedItems
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
