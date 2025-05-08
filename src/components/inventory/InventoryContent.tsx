
import React from 'react';
import { Ingredient } from '@/types';
import { SortState } from '@/components/ui/data-table/SortableColumn';
import IngredientList from './IngredientList';
import IngredientGrid from './IngredientGrid';
import InventoryEmptyState from './InventoryEmptyState';

interface InventoryContentProps {
  ingredients: Ingredient[];
  viewMode: 'grid' | 'list';
  sortState: SortState;
  onSort: (column: string) => void;
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
  onViewCostHistory: (ingredient: Ingredient) => void;
  hasFilters: boolean;
  canModify: boolean;
  onAddIngredient: () => void;
}

const InventoryContent: React.FC<InventoryContentProps> = ({ 
  ingredients, 
  viewMode, 
  sortState, 
  onSort, 
  onEdit, 
  onDelete, 
  onViewCostHistory,
  hasFilters,
  canModify,
  onAddIngredient
}) => {
  if (ingredients.length === 0) {
    return (
      <InventoryEmptyState 
        hasFilters={hasFilters}
        canModify={canModify}
        onAddIngredient={onAddIngredient}
      />
    );
  }

  return viewMode === 'grid' ? (
    <IngredientGrid 
      ingredients={ingredients}
      onEdit={onEdit}
      onDelete={onDelete}
      onViewCostHistory={onViewCostHistory}
    />
  ) : (
    <IngredientList
      ingredients={ingredients}
      onEdit={onEdit}
      onDelete={onDelete}
      onViewCostHistory={onViewCostHistory}
      sortState={sortState}
      onSort={onSort}
    />
  );
};

export default InventoryContent;
