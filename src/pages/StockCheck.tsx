
import React from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useStockCheck } from '@/hooks/useStockCheck';
import StockCheckBranchSelector from '@/components/stock-check/StockCheckBranchSelector';
import StockCheckSearchBar from '@/components/stock-check/StockCheckSearchBar';
import StockCheckTable from '@/components/stock-check/StockCheckTable';
import StockCheckLoadingState from '@/components/stock-check/StockCheckLoadingState';

const StockCheck = () => {
  const { user } = useAuth();
  const {
    search,
    setSearch,
    selectedBranch,
    setSelectedBranch,
    filteredItems,
    updatedItems,
    branches,
    isLoading,
    handleQuantityChange,
    handleReorderPointChange,
    handleReorderPointSave,
    handleSave
  } = useStockCheck();

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
        
        <StockCheckSearchBar search={search} setSearch={setSearch} />
      </div>

      {isLoading ? (
        <StockCheckLoadingState />
      ) : (
        <>
          <StockCheckTable 
            items={filteredItems} 
            handleQuantityChange={handleQuantityChange}
            handleReorderPointChange={handleReorderPointChange}
            handleReorderPointSave={handleReorderPointSave}
            updatedItems={updatedItems}
          />

          {filteredItems.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {search ? 
                  "No ingredients found matching your search." : 
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
