
import React from 'react';
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

interface StockCheckFilterProps {
  filters: StockCheckFiltersType;
  setFilters: (filters: StockCheckFiltersType) => void;
  categories: { id: string, name: string }[];
  resetFilters: () => void;
  activeFilterCount: number;
  viewMode: 'list' | 'grid';
  setViewMode: (mode: 'list' | 'grid') => void;
}

const StockCheckFilters: React.FC<StockCheckFilterProps> = ({
  filters,
  setFilters,
  categories,
  resetFilters,
  activeFilterCount,
  viewMode,
  setViewMode
}) => {
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
