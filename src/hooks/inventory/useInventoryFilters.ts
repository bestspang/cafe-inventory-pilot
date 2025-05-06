
import { useState, useMemo } from 'react';
import { Ingredient } from '@/types';
import { SortState } from '@/components/ui/data-table/SortableColumn';
import { ViewMode } from '@/components/ui/data-table/DataTableViewOptions';

export interface InventoryFilters {
  search: string;
  categoryId: string;
}

export const useInventoryFilters = (ingredients: Ingredient[]) => {
  const [filters, setFilters] = useState<InventoryFilters>({
    search: '',
    categoryId: 'all',
  });
  const [sortState, setSortState] = useState<SortState>({
    column: 'name',
    direction: 'asc',
  });
  const [viewMode, setViewMode] = useState<ViewMode>('list');

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
      categoryId: 'all',
    });
  };

  // Count active filters (excluding search which is handled separately)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categoryId !== 'all') count++;
    return count;
  }, [filters]);

  // Check if any filters are active
  const hasFilters = useMemo(() => {
    return !!filters.search || filters.categoryId !== 'all';
  }, [filters]);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    // First, filter the items
    let result = ingredients;
    
    // Apply category filter
    if (filters.categoryId !== 'all') {
      result = result.filter(item => item.categoryId === filters.categoryId);
    }
    
    // Apply search filter (case insensitive search)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchLower) || 
        (item.categoryName && item.categoryName.toLowerCase().includes(searchLower))
      );
    }
    
    // Then sort the filtered items
    if (sortState.column) {
      result = [...result].sort((a, b) => {
        const aValue = a[sortState.column as keyof Ingredient];
        const bValue = b[sortState.column as keyof Ingredient];
        
        if (aValue === bValue) return 0;
        
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
  }, [ingredients, filters, sortState]);
  
  return {
    filters,
    setFilters,
    sortState,
    handleSort,
    viewMode,
    setViewMode,
    resetFilters,
    activeFilterCount,
    hasFilters,
    filteredAndSortedItems,
  };
};
