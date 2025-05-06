
import { useState, useMemo } from 'react';
import { StockItem } from '@/types/stock-check';
import { SortState } from '@/components/ui/data-table/SortableColumn';

export interface StockCheckFilters {
  search: string;
  categoryId: string;
}

export const useStockCheckFilters = (stockItems: StockItem[]) => {
  const [filters, setFilters] = useState<StockCheckFilters>({
    search: '',
    categoryId: 'all',
  });
  const [sortState, setSortState] = useState<SortState>({
    column: 'name',
    direction: 'asc',
  });

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

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    // First, filter the items
    let result = stockItems;
    
    // Apply category filter
    if (filters.categoryId !== 'all') {
      result = result.filter(item => item.categoryId === filters.categoryId);
    }
    
    // Apply search filter (case insensitive search)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchLower) || 
        item.categoryName.toLowerCase().includes(searchLower)
      );
    }
    
    // Then sort the filtered items
    if (sortState.column) {
      result = [...result].sort((a, b) => {
        const aValue = a[sortState.column as keyof StockItem];
        const bValue = b[sortState.column as keyof StockItem];
        
        if (aValue === bValue) return 0;
        
        // Handle string comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortState.direction === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
        
        // Handle numeric comparison
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortState.direction === 'asc' 
            ? aValue - bValue 
            : bValue - aValue;
        }
        
        return 0;
      });
    }
    
    return result;
  }, [stockItems, filters, sortState]);
  
  return {
    filters,
    setFilters,
    sortState,
    handleSort,
    resetFilters,
    activeFilterCount,
    filteredAndSortedItems,
  };
};
