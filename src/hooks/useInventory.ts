
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Ingredient } from '@/types';
import { type ViewMode } from '@/types/inventory';
import { useCategoryManager } from './inventory/useCategoryManager';
import { useIngredientManager } from './inventory/useIngredientManager';
import { useFilterManager } from './inventory/useFilterManager';

export type { ViewMode };

export const useInventory = (storeId?: string | null) => {
  const { user } = useAuth();
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [costHistoryDialogOpen, setCostHistoryDialogOpen] = useState(false);
  
  // Only owners and managers can modify ingredients
  const canModify = ['owner', 'manager'].includes(user?.role || '');
  
  // Pass storeId to the ingredient manager
  const { 
    ingredients, 
    currentIngredient, 
    setCurrentIngredient, 
    handleAddEdit,
    handleEdit,
    handleDelete,
    confirmDelete,
    fetchIngredients,
    isLoading: ingredientsLoading
  } = useIngredientManager(setFormDialogOpen, setDeleteDialogOpen, storeId);
  
  // Use our smaller, focused hooks - now without passing store context
  const { categories, handleNewCategory, isLoading: categoriesLoading } = useCategoryManager();
  
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
  const handleAddEditIngredient = async (data: Partial<Ingredient>) => {
    console.log('handleAddEditIngredient called with data:', data);
    
    // Set the branch_id to the current storeId if provided
    const ingredientWithStore = {
      ...data,
      branch_id: storeId || data.branch_id
    };
    
    await handleAddEdit(ingredientWithStore, categories, (name: string) => {
      // The handleNewCategory function requires two arguments: tempId and categoryName
      // Here we're generating a temporary ID using the current timestamp
      const tempId = `temp-${Date.now()}`;
      return handleNewCategory(tempId, name);
    });
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
    fetchIngredients,
    hasFilters,
    isLoading
  };
};
