
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTableToolbar } from '@/components/ui/data-table/DataTableToolbar';
import { DataTableViewOptions } from '@/components/ui/data-table/DataTableViewOptions';
import type { InventoryFilters as InventoryFiltersType } from '@/hooks/inventory/useInventoryFilters';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Category } from '@/types';
import { ViewMode } from '@/components/ui/data-table/DataTableViewOptions';

interface InventoryFiltersProps {
  filters: InventoryFiltersType;
  setFilters: (filters: InventoryFiltersType) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  categories: Category[];
  onAddIngredient: () => void;
  canModify: boolean;
  resetFilters: () => void;
  activeFilterCount: number;
}

const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  filters,
  setFilters,
  viewMode,
  setViewMode,
  categories,
  onAddIngredient,
  canModify,
  resetFilters,
  activeFilterCount
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
            gridViewEnabled={true}
          />
          
          {canModify && (
            <Button onClick={onAddIngredient}>
              <Plus className="h-4 w-4 mr-1" />
              Add Ingredient
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryFilters;
