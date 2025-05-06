
import { useState } from 'react';
import { useStockCheckBranches } from '@/hooks/stock-check/useStockCheckBranches';
import { useStockCheckItems } from '@/hooks/stock-check/useStockCheckItems';
import { useStockCheckActions } from '@/hooks/stock-check/useStockCheckActions';

export const useStockCheck = () => {
  const {
    branches,
    selectedBranch,
    setSelectedBranch,
    isLoading: branchesLoading
  } = useStockCheckBranches();

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
  } = useStockCheckItems(selectedBranch);

  const { 
    handleSave,
    handleReorderPointSave 
  } = useStockCheckActions(
    selectedBranch,
    stockItems,
    updatedItems,
    setUpdatedItems,
    branches
  );

  // Combined loading state
  const isLoading = branchesLoading || itemsLoading;

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
