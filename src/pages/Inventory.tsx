
import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Settings } from 'lucide-react';
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
  
  // Initialize with the current store ID from context
  const storeId = currentStoreId;
  
  const {
    ingredients,
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
    handleAddEdit,
    handleEdit,
    handleDelete,
    confirmDelete,
    handleViewCostHistory,
    isLoading,
    fetchIngredients
  } = useInventory(storeId);

  // Use the archived ingredients hook and pass the fetchIngredients callback
  const {
    archivedIngredients,
    isLoading: archiveLoading,
    dialogOpen: archiveDialogOpen,
    setDialogOpen: setArchiveDialogOpen,
    restoreIngredient
  } = useArchivedIngredients(fetchIngredients);

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
  } = useInventoryFilters(ingredients);

  // Auto-select first store if none is selected
  useEffect(() => {
    if (!currentStoreId && stores.length > 0) {
      setCurrentStoreId(stores[0].id);
    }
  }, [currentStoreId, stores, setCurrentStoreId]);

  const handleOpenAddIngredient = () => {
    setCurrentIngredient(null);
    setFormDialogOpen(true);
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
