
import { useState, useMemo } from 'react';
import { Ingredient } from '@/types';
import { ViewMode } from '@/types/inventory';

export const useFilterManager = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Filter ingredients based on search and category
  const filterIngredients = (ingredients: Ingredient[]): Ingredient[] => {
    return useMemo(() => {
      return ingredients.filter(ingredient => {
        // Search filter
        const matchesSearch = search === '' || 
          ingredient.name.toLowerCase().includes(search.toLowerCase());
        
        // Category filter
        const matchesCategory = !categoryFilter || 
          ingredient.categoryId === categoryFilter;
        
        return matchesSearch && matchesCategory;
      });
    }, [ingredients, search, categoryFilter]);
  };
  
  // Check if any filters are applied
  const hasFilters = search !== '' || categoryFilter !== null;
  
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
