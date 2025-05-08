
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Ingredient } from '@/types';
import { type ViewMode } from '@/types/inventory';
import { useCategoryManager } from './inventory/useCategoryManager';
import { useIngredientManager } from './inventory/useIngredientManager';
import { useFilterManager } from './inventory/useFilterManager';
import { useStores } from '@/context/StoresContext';

export type { ViewMode };

export const useInventory = () => {
  const { user } = useAuth();
  const { currentStoreId } = useStores();
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [costHistoryDialogOpen, setCostHistoryDialogOpen] = useState(false);
  
  // Only owners and managers can modify ingredients
  const canModify = ['owner', 'manager'].includes(user?.role || '');
  
  // Use our smaller, focused hooks with store context
  const { categories, handleNewCategory, isLoading: categoriesLoading } = useCategoryManager();
  const { 
    ingredients, 
    currentIngredient, 
    setCurrentIngredient, 
    handleAddEdit,
    handleEdit,
    handleDelete,
    confirmDelete,
    isLoading: ingredientsLoading
  } = useIngredientManager(setFormDialogOpen, setDeleteDialogOpen, currentStoreId);
  
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

  // Wrapper for handleAddEdit to include category creation and store ID
  const handleAddEditIngredient = async (data: Partial<Ingredient>) => {
    console.log('handleAddEditIngredient called with data:', data);
    // Ensure branch_id is set to currentStoreId
    await handleAddEdit({
      ...data,
      branch_id: currentStoreId
    }, categories, (id: string, name: string) => handleNewCategory(id, name));
  };

  // Handler for viewing cost history
  const handleViewCostHistory = (ingredient: Ingredient) => {
    setCurrentIngredient(ingredient);
    setCostHistoryDialogOpen(true);
  };

  const isLoading = categoriesLoading || ingredientsLoading;

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
    costHistoryDialogOpen,
    setCostHistoryDialogOpen,
    currentIngredient,
    setCurrentIngredient,
    canModify,
    categories,
    handleAddEdit: handleAddEditIngredient,
    handleEdit,
    handleDelete,
    confirmDelete,
    handleViewCostHistory,
    hasFilters,
    isLoading
  };
};
