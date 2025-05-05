
import React from 'react';
import { Search, Plus, LayoutGrid, LayoutList } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Category } from '@/types';
import { ViewMode } from '@/hooks/useInventory';

interface InventoryFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  viewMode: ViewMode;
  setViewMode: (value: ViewMode) => void;
  categories: Category[];
  onAddIngredient: () => void;
  canModify: boolean;
}

const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  viewMode,
  setViewMode,
  categories,
  onAddIngredient,
  canModify
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="flex gap-2 items-center w-full md:w-auto">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search ingredients..." 
            className="pl-8"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as ViewMode)}>
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <LayoutList className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div className="flex gap-2 w-full md:w-auto">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {canModify && (
          <Button onClick={onAddIngredient}>
            <Plus className="h-4 w-4 mr-1" />
            Add Ingredient
          </Button>
        )}
      </div>
    </div>
  );
};

export default InventoryFilters;
