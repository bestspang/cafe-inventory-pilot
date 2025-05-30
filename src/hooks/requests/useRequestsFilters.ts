
import { useState, useMemo } from 'react';
import { SortState } from '@/components/ui/data-table/SortableColumn';
import { DateRange } from 'react-day-picker';
import { RequestItem } from '@/types/requests';

export interface RequestFilters {
  search: string;
  branchId: string;
  status: 'pending' | 'fulfilled';
  dateRange?: DateRange;
}

export const useRequestsFilters = (requests: RequestItem[]) => {
  const [filters, setFilters] = useState<RequestFilters>({
    search: '',
    branchId: 'all',
    status: 'pending',
  });
  
  const [sortState, setSortState] = useState<SortState>({
    column: 'requestedAt',
    direction: 'desc',
  });
  
  // Add pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Handle sort change
  const handleSort = (column: string) => {
    setSortState(prev => ({
      column,
      direction: 
        prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      branchId: 'all',
      status: 'pending',
      dateRange: undefined,
    });
    setPage(1); // Reset to first page when filters change
  };

  // Count active filters (excluding search which is handled separately)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.branchId !== 'all') count++;
    if (filters.dateRange) count++;
    return count;
  }, [filters]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    // First, filter the items
    let result = [...requests];
    
    // Apply branch filter
    if (filters.branchId !== 'all') {
      result = result.filter(item => item.branchId === filters.branchId);
    }
    
    // Apply status filter
    result = result.filter(item => item.status === filters.status);
    
    // Apply date range filter
    if (filters.dateRange?.from) {
      const fromDate = new Date(filters.dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      
      result = result.filter(item => {
        const itemDate = new Date(item.requestedAt);
        return itemDate >= fromDate;
      });
    }
    
    if (filters.dateRange?.to) {
      const toDate = new Date(filters.dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      
      result = result.filter(item => {
        const itemDate = new Date(item.requestedAt);
        return itemDate <= toDate;
      });
    }
    
    // Apply search filter (case insensitive search)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(item => {
        // Search in username and branch name
        const basicMatch = item.userName.toLowerCase().includes(searchLower) || 
                         item.branchName.toLowerCase().includes(searchLower);
        
        // Search in items details
        const itemsMatch = item.requestItems?.some(reqItem => 
          reqItem.ingredientName.toLowerCase().includes(searchLower));
          
        return basicMatch || itemsMatch;
      });
    }
    
    // Then sort the filtered items
    if (sortState.column) {
      result = [...result].sort((a, b) => {
        const aValue = a[sortState.column as keyof RequestItem];
        const bValue = b[sortState.column as keyof RequestItem];
        
        if (aValue === bValue) return 0;
        
        // Handle date comparison for requestedAt
        if (sortState.column === 'requestedAt') {
          const aDate = new Date(a.requestedAt).getTime();
          const bDate = new Date(b.requestedAt).getTime();
          return sortState.direction === 'asc' ? aDate - bDate : bDate - aDate;
        }
        
        // Handle string comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortState.direction === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
        
        return 0;
      });
    }
    
    return result;
  }, [requests, filters, sortState]);
  
  // Apply pagination to filtered and sorted items
  const paginatedItems = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredItems.slice(startIndex, startIndex + pageSize);
  }, [filteredItems, page, pageSize]);
  
  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return {
    filters,
    setFilters,
    sortState,
    handleSort,
    resetFilters,
    activeFilterCount,
    filteredItems,
    paginatedItems,
    pagination: {
      page,
      pageSize,
      totalPages,
      totalItems: filteredItems.length,
      handlePageChange,
      setPageSize
    }
  };
};
