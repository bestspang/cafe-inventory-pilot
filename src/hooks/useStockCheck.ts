
import { useState } from 'react';
import { useStockCheckBranches } from '@/hooks/stock-check/useStockCheckBranches';
import { useStockCheckItems } from '@/hooks/stock-check/useStockCheckItems';
import { useStockCheckActions } from '@/hooks/stock-check/useStockCheckActions';
import { useStores } from '@/context/StoresContext';

export const useStockCheck = () => {
  const { currentStoreId } = useStores();
  
  const {
    branches,
    selectedBranch,
    setSelectedBranch,
    isLoading: branchesLoading
  } = useStockCheckBranches(currentStoreId);

  const {
    stockItems,
    filteredItems,
    updatedItems,
    search,
    setSearch,
    isLoading: itemsLoading,
    handleQuantityChange,
    handleReorderPointChange,
    setUpdatedItems
  } = useStockCheckItems(selectedBranch || currentStoreId);

  const { 
    handleSave,
    handleReorderPointSave 
  } = useStockCheckActions(
    selectedBranch || currentStoreId,
    stockItems,
    updatedItems,
    setUpdatedItems,
    branches
  );

  // Combined loading state
  const isLoading = branchesLoading || itemsLoading;

  // If no branch is selected, default to the current store
  if (currentStoreId && !selectedBranch) {
    setSelectedBranch(currentStoreId);
  }

  return {
    search,
    setSearch,
    selectedBranch,
    setSelectedBranch,
    stockItems,
    filteredItems,
    updatedItems,
    branches,
    isLoading,
    handleQuantityChange,
    handleReorderPointChange,
    handleReorderPointSave,
    handleSave
  };
};
