
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Category } from '@/types';

interface InventoryFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  categories: Category[];
  onAddIngredient: () => void;
  canModify: boolean;
}

const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  categories,
  onAddIngredient,
  canModify
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="relative w-full md:w-auto flex-1 md:max-w-sm">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search ingredients..." 
          className="pl-8"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
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
