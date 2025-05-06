
import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export interface FilterState {
  search?: string;
  [key: string]: any;
}

interface DataTableToolbarProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  children?: React.ReactNode;
  searchPlaceholder?: string;
  filterCount?: number;
  onResetFilters?: () => void;
}

export const DataTableToolbar = ({
  filters,
  setFilters,
  children,
  searchPlaceholder = "Search...",
  filterCount = 0,
  onResetFilters,
}: DataTableToolbarProps) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex w-full sm:w-auto max-w-sm items-center space-x-2">
          <div className="relative w-full">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={filters.search || ""}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-8 w-full"
            />
            {filters.search && (
              <Button
                variant="ghost"
                className="absolute right-0 top-0 h-full px-2"
                onClick={() => setFilters({ ...filters, search: "" })}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
        </div>

        {children && (
          <Collapsible className="w-full sm:w-auto">
            <div className="flex items-center justify-between sm:justify-end space-x-2">
              {filterCount > 0 && (
                <Badge variant="secondary" className="mr-2">
                  {filterCount} active {filterCount === 1 ? "filter" : "filters"}
                </Badge>
              )}
              
              {filterCount > 0 && onResetFilters && (
                <Button 
                  variant="ghost" 
                  onClick={onResetFilters} 
                  className="h-8 px-2 lg:px-3"
                >
                  Reset
                </Button>
              )}
              
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-2 lg:px-3">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="mt-4 border rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {children}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
};
