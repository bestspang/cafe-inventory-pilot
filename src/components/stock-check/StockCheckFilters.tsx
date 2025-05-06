
import React, { useState } from 'react';
import { Filter, ArrowDownUp } from 'lucide-react';
import { DataTableToolbar } from '@/components/ui/data-table/DataTableToolbar';
import { DataTableViewOptions } from '@/components/ui/data-table/DataTableViewOptions';
import type { StockCheckFilters as StockCheckFiltersType } from '@/hooks/stock-check/useStockCheckFilters';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { SortState } from '@/components/ui/data-table/SortableColumn';

interface StockCheckFilterProps {
  filters: StockCheckFiltersType;
  setFilters: (filters: StockCheckFiltersType) => void;
  categories: { id: string, name: string }[];
  resetFilters: () => void;
  activeFilterCount: number;
  viewMode: 'list' | 'grid';
  setViewMode: (mode: 'list' | 'grid') => void;
  sortState?: SortState;
  onSort?: (column: string) => void;
}

const StockCheckFilters: React.FC<StockCheckFilterProps> = ({
  filters,
  setFilters,
  categories,
  resetFilters,
  activeFilterCount,
  viewMode,
  setViewMode,
  sortState,
  onSort
}) => {
  const [sortOpen, setSortOpen] = useState(false);
  
  const sortableColumns = [
    { key: 'name', label: 'Ingredient Name' },
    { key: 'categoryName', label: 'Category' },
    { key: 'onHandQty', label: 'On-hand Quantity' },
    { key: 'reorderPt', label: 'Reorder Point' }
  ];

  return (
    <div className="sticky top-0 z-10 bg-background py-4 border-b mb-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <DataTableToolbar
          filters={filters}
          setFilters={setFilters}
          searchPlaceholder="Search ingredients..."
          filterCount={activeFilterCount}
          onResetFilters={resetFilters}
        >
          <div>
            <label className="text-sm font-medium block mb-2">Category</label>
            <Select
              value={filters.categoryId}
              onValueChange={(value) => setFilters({ ...filters, categoryId: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DataTableToolbar>
        
        <div className="flex items-center space-x-2">
          {onSort && (
            <Popover open={sortOpen} onOpenChange={setSortOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-2 lg:px-3">
                  <ArrowDownUp className="h-4 w-4 mr-2" />
                  Sort
                  {sortState?.column && (
                    <span className="ml-1 rounded-full bg-primary w-2 h-2 block"></span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="end">
                <div className="grid gap-2">
                  <h4 className="font-medium text-sm pl-2">Sort by</h4>
                  {sortableColumns.map((column) => (
                    <Button
                      key={column.key}
                      variant={sortState?.column === column.key ? "default" : "ghost"}
                      className="justify-start text-sm px-2 py-1.5 h-auto"
                      onClick={() => {
                        onSort(column.key);
                        setSortOpen(false);
                      }}
                    >
                      {column.label}
                      {sortState?.column === column.key && (
                        <span className="ml-auto">
                          {sortState.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
          <DataTableViewOptions 
            viewMode={viewMode} 
            setViewMode={setViewMode} 
            gridViewEnabled={false}
          />
        </div>
      </div>
    </div>
  );
};

export default StockCheckFilters;
