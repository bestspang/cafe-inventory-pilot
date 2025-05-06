
import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useStockCheck } from '@/hooks/useStockCheck';
import StockCheckBranchSelector from '@/components/stock-check/StockCheckBranchSelector';
import StockCheckTable from '@/components/stock-check/StockCheckTable';
import StockCheckLoadingState from '@/components/stock-check/StockCheckLoadingState';
import StockCheckFilters from '@/components/stock-check/StockCheckFilters';
import { useStockCheckFilters } from '@/hooks/stock-check/useStockCheckFilters';
import { ViewMode } from '@/components/ui/data-table/DataTableViewOptions';

const StockCheck = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  
  const {
    selectedBranch,
    setSelectedBranch,
    stockItems,
    updatedItems,
    branches,
    isLoading,
    handleQuantityChange,
    handleReorderPointChange,
    handleReorderPointSave,
    handleSave
  } = useStockCheck();

  // Extract categories from stock items for the filter
  const categories = React.useMemo(() => {
    const uniqueCategories = new Map();
    stockItems.forEach(item => {
      if (item.categoryId && item.categoryName) {
        uniqueCategories.set(item.categoryId, {
          id: item.categoryId,
          name: item.categoryName
        });
      }
    });
    return Array.from(uniqueCategories.values());
  }, [stockItems]);

  // Use the filtering and sorting hook
  const {
    filters,
    setFilters,
    sortState,
    handleSort,
    resetFilters,
    activeFilterCount,
    filteredAndSortedItems
  } = useStockCheckFilters(stockItems);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Stock Check</h1>
        <p className="text-muted-foreground">Update your current inventory counts</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-auto">
          <StockCheckBranchSelector 
            selectedBranch={selectedBranch} 
            setSelectedBranch={setSelectedBranch}
            branches={branches}
            isLoading={isLoading}
          />
        </div>
      </div>

      {isLoading ? (
        <StockCheckLoadingState />
      ) : (
        <>
          <StockCheckFilters
            filters={filters}
            setFilters={setFilters}
            categories={categories}
            resetFilters={resetFilters}
            activeFilterCount={activeFilterCount}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />

          <StockCheckTable 
            items={filteredAndSortedItems} 
            handleQuantityChange={handleQuantityChange}
            handleReorderPointChange={handleReorderPointChange}
            handleReorderPointSave={handleReorderPointSave}
            updatedItems={updatedItems}
            sortState={sortState}
            onSort={handleSort}
          />

          {filteredAndSortedItems.length === 0 && stockItems.length > 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {filters.search || filters.categoryId !== 'all' ? 
                  "No ingredients found matching your filters." : 
                  "No ingredients available for this branch."}
              </p>
            </div>
          )}
        </>
      )}

      <div className="fixed bottom-8 right-8">
        <Button 
          onClick={handleSave} 
          size="lg" 
          className="shadow-lg"
          disabled={isLoading || Object.keys(updatedItems).length === 0}
        >
          <Save className="mr-2 h-4 w-4" />
          Save Stock Check
        </Button>
      </div>
    </div>
  );
};

export default StockCheck;
