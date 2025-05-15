
import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useBranchInventory } from '@/hooks/useBranchInventory';
import { useInventory } from '@/hooks/useInventory';
import { useInventoryFilters } from '@/hooks/inventory/useInventoryFilters';
import { useArchivedIngredients } from '@/hooks/inventory/useArchivedIngredients';
import { useStores } from '@/context/StoresContext';
import InventoryFilters from '@/components/inventory/InventoryFilters';
import InventorySkeletons from '@/components/inventory/InventorySkeletons';
import InventoryHeader from '@/components/inventory/InventoryHeader';
import InventoryContent from '@/components/inventory/InventoryContent';
import InventoryDialogs from '@/components/inventory/InventoryDialogs';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Inventory = () => {
  const intl = useIntl();
  const { stores, currentStoreId, setCurrentStoreId } = useStores();
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [costHistoryDialogOpen, setCostHistoryDialogOpen] = useState(false);
  const [currentIngredient, setCurrentIngredient] = useState(null);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  
  // Fetch branch inventory data using our new hook
  const { data: branchInventoryItems = [], isLoading, refetch: refreshInventory } = useBranchInventory(currentStoreId);
  
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

  // User permissions check
  const { user } = useAuth();

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

  const handleEdit = (ingredient) => {
    setCurrentIngredient(ingredient);
    setFormDialogOpen(true);
  };

  const handleDelete = (ingredient) => {
    setCurrentIngredient(ingredient);
    setDeleteDialogOpen(true);
  };

  const handleViewCostHistory = (ingredient) => {
    setCurrentIngredient(ingredient);
    setCostHistoryDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between">
        <InventoryHeader 
          canModify={canModify}
          onOpenArchives={() => setArchiveDialogOpen(true)}
        />
        
        <div className="flex items-center gap-2">
          <Select 
            value={currentStoreId || ''} 
            onValueChange={setCurrentStoreId}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select store" />
            </SelectTrigger>
            <SelectContent>
              {stores.map(store => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {canModify && (
            <>
              <Button 
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => setArchiveDialogOpen(true)}
              >
                Archives
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => setSettingsDialogOpen(true)}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <InventorySkeletons viewMode={viewMode} />
      ) : (
        <>
          <InventoryFilters
            filters={filters}
            setFilters={setFilters}
            viewMode={viewMode}
            setViewMode={setViewMode}
            categories={categories}
            onAddIngredient={handleOpenAddIngredient}
            canModify={canModify}
            resetFilters={resetFilters}
            activeFilterCount={activeFilterCount}
          />

          <InventoryContent
            ingredients={filteredAndSortedItems}
            viewMode={viewMode}
            sortState={sortState}
            onSort={handleSort}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewCostHistory={handleViewCostHistory}
            hasFilters={hasFilters}
            canModify={canModify}
            onAddIngredient={handleOpenAddIngredient}
          />
        </>
      )}
      
      <InventoryDialogs 
        formDialogOpen={formDialogOpen}
        setFormDialogOpen={setFormDialogOpen}
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        costHistoryDialogOpen={costHistoryDialogOpen}
        setCostHistoryDialogOpen={setCostHistoryDialogOpen}
        archiveDialogOpen={archiveDialogOpen}
        setArchiveDialogOpen={setArchiveDialogOpen}
        currentIngredient={currentIngredient}
        categories={categories}
        onSubmitForm={handleAddEdit}
        onConfirmDelete={confirmDelete}
        archivedIngredients={archivedIngredients}
        onRestoreIngredient={restoreIngredient}
        archiveLoading={archiveLoading}
        settingsDialogOpen={settingsDialogOpen}
        setSettingsDialogOpen={setSettingsDialogOpen}
        currentStoreId={currentStoreId}
      />
    </div>
  );
};

export default Inventory;
