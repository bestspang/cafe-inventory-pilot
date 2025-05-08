import React, { useState, useEffect } from 'react';
import { Save, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useStockCheck } from '@/hooks/useStockCheck';
import StockCheckBranchSelector from '@/components/stock-check/StockCheckBranchSelector';
import StockCheckTable from '@/components/stock-check/StockCheckTable';
import StockCheckLoadingState from '@/components/stock-check/StockCheckLoadingState';
import StockCheckFilters from '@/components/stock-check/StockCheckFilters';
import { useStockCheckFilters } from '@/hooks/stock-check/useStockCheckFilters';
import { ViewMode } from '@/components/ui/data-table/DataTableViewOptions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StockCheckActivity from '@/components/stock-check/StockCheckActivity';
import StockCheckSettingsModal from '@/components/stock-check/StockCheckSettingsModal';
import { StockCheckSettingsProvider } from '@/context/StockCheckSettingsContext';

const StockCheck = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [activeTab, setActiveTab] = useState<'stock-check' | 'activity'>('stock-check');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Check URL parameters for tab
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'activity') {
      setActiveTab('activity');
    }
  }, []);
  
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
    <StockCheckSettingsProvider branchId={selectedBranch}>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Stock Check</h1>
            <p className="text-muted-foreground">Update your current inventory counts</p>
          </div>
          <div className="w-auto">
            <StockCheckBranchSelector 
              selectedBranch={selectedBranch} 
              setSelectedBranch={setSelectedBranch}
              branches={branches}
              isLoading={isLoading}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'stock-check' | 'activity')} className="w-full">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="stock-check">Stock Check</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettingsModal(true)}
                  disabled={isLoading || !selectedBranch}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                
                <Button 
                  onClick={handleSave} 
                  size="sm"
                  disabled={isLoading || Object.keys(updatedItems).length === 0}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Stock Check
                </Button>
              </div>
            </div>
            
            <TabsContent value="stock-check" className="space-y-6 mt-0">
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
                    sortState={sortState}
                    onSort={handleSort}
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
            </TabsContent>
            
            <TabsContent value="activity" className="mt-0">
              <StockCheckActivity />
            </TabsContent>
          </Tabs>
        </div>
        
        <StockCheckSettingsModal 
          open={showSettingsModal}
          onOpenChange={setShowSettingsModal}
        />
      </div>
    </StockCheckSettingsProvider>
  );
};

export default StockCheck;
