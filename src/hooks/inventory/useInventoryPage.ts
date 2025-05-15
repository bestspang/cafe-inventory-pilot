
import React, { useState, useEffect } from 'react';
import { useStores } from '@/context/StoresContext';
import { useBranchInventory } from '@/hooks/useBranchInventory';
import { useInventory } from '@/hooks/useInventory';
import { useInventoryFilters } from '@/hooks/inventory/useInventoryFilters';
import { useArchivedIngredients } from '@/hooks/inventory/useArchivedIngredients';
import { Ingredient } from '@/types';

export function useInventoryPage() {
  const { stores, currentStoreId, setCurrentStoreId } = useStores();
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [costHistoryDialogOpen, setCostHistoryDialogOpen] = useState(false);
  const [currentIngredient, setCurrentIngredient] = useState<Ingredient | null>(null);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  
  // Fetch branch inventory data using our hook
  const { 
    data: branchInventoryItems = [], 
    isLoading, 
    refetch: refreshInventory 
  } = useBranchInventory(currentStoreId);
  
  // Use the useInventory hook for ingredient operations
  const {
    handleAddEdit,
    confirmDelete,
    canModify
  } = useInventory(currentStoreId);
  
  // Use the archived ingredients hook
  const {
    archivedIngredients,
    isLoading: archiveLoading,
    restoreIngredient
  } = useArchivedIngredients(refreshInventory);

  // Use our filter hook
  const {
    filters,
    setFilters,
    sortState,
    handleSort,
    viewMode,
    setViewMode,
    resetFilters,
    activeFilterCount,
    hasFilters,
    filteredAndSortedItems
  } = useInventoryFilters(branchInventoryItems);

  // Auto-select first store if none is selected
  useEffect(() => {
    if (!currentStoreId && stores.length > 0) {
      setCurrentStoreId(stores[0].id);
    }
  }, [currentStoreId, stores, setCurrentStoreId]);

  // Extract unique categories from inventory items
  const categories = React.useMemo(() => {
    const uniqueCategories = new Map();
    branchInventoryItems.forEach(item => {
      if (item.categoryId && item.categoryName) {
        uniqueCategories.set(item.categoryId, { id: item.categoryId, name: item.categoryName });
      }
    });
    return Array.from(uniqueCategories.values());
  }, [branchInventoryItems]);

  // Handlers
  const handleOpenAddIngredient = () => {
    setCurrentIngredient(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (ingredient: Ingredient) => {
    setCurrentIngredient(ingredient);
    setFormDialogOpen(true);
  };

  const handleDelete = (ingredient: Ingredient) => {
    setCurrentIngredient(ingredient);
    setDeleteDialogOpen(true);
  };

  const handleViewCostHistory = (ingredient: Ingredient) => {
    setCurrentIngredient(ingredient);
    setCostHistoryDialogOpen(true);
  };

  return {
    // State
    stores,
    currentStoreId,
    setCurrentStoreId,
    formDialogOpen,
    setFormDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    costHistoryDialogOpen,
    setCostHistoryDialogOpen,
    currentIngredient,
    archiveDialogOpen,
    setArchiveDialogOpen,
    settingsDialogOpen,
    setSettingsDialogOpen,
    
    // Data
    categories,
    isLoading,
    archivedIngredients,
    archiveLoading,
    filteredAndSortedItems,
    
    // Filters
    filters,
    setFilters,
    viewMode,
    setViewMode,
    sortState,
    handleSort,
    hasFilters,
    resetFilters,
    activeFilterCount,
    
    // Actions
    canModify,
    handleOpenAddIngredient,
    handleEdit,
    handleDelete,
    handleViewCostHistory,
    handleAddEdit,
    confirmDelete,
    restoreIngredient
  };
}
