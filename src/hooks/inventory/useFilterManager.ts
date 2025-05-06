
import { useState } from 'react';
import { Ingredient } from '@/types';
import { ViewMode } from '@/types/inventory';

export interface FilterManagerResult {
  search: string;
  setSearch: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  filterIngredients: (ingredients: Ingredient[]) => Ingredient[];
  hasFilters: boolean;
}

export const useFilterManager = (): FilterManagerResult => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Filter ingredients based on search and category
  const filterIngredients = (ingredients: Ingredient[]): Ingredient[] => {
    return ingredients.filter(ingredient => {
      const matchesSearch = ingredient.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' ? true : ingredient.categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  };

  const hasFilters = search !== '' || categoryFilter !== 'all';

  return {
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    viewMode,
    setViewMode,
    filterIngredients,
    hasFilters
  };
};
