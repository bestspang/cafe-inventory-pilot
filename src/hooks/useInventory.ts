
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Ingredient } from '@/types';
import { ViewMode } from '@/types/inventory';
import { useCategoryManager } from './inventory/useCategoryManager';
import { useIngredientManager } from './inventory/useIngredientManager';
import { useFilterManager } from './inventory/useFilterManager';

export { type ViewMode };

export const useInventory = () => {
  const { user } = useAuth();
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Only owners and managers can modify ingredients
  const canModify = ['owner', 'manager'].includes(user?.role || '');
  
  // Use our smaller, focused hooks
  const { categories, handleNewCategory } = useCategoryManager();
  const { 
    ingredients, 
    currentIngredient, 
    setCurrentIngredient, 
    handleAddEdit,
    handleEdit,
    handleDelete,
    confirmDelete
  } = useIngredientManager(setFormDialogOpen, setDeleteDialogOpen);
  const {
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    viewMode,
    setViewMode,
    filterIngredients,
    hasFilters
  } = useFilterManager();

  // Apply filters to ingredients
  const filteredIngredients = filterIngredients(ingredients);

  // Wrapper for handleAddEdit to include category creation
  const handleAddEditIngredient = (data: Partial<Ingredient>) => {
    handleAddEdit(data, categories, handleNewCategory);
  };

  return {
    ingredients: filteredIngredients,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    viewMode,
    setViewMode,
    formDialogOpen,
    setFormDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    currentIngredient,
    setCurrentIngredient,
    canModify,
    categories,
    handleAddEdit: handleAddEditIngredient,
    handleEdit,
    handleDelete,
    confirmDelete,
    hasFilters
  };
};
