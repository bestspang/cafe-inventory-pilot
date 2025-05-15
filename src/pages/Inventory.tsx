
import React from 'react';
import { useInventoryPage } from '@/hooks/inventory/useInventoryPage';
import InventoryFilters from '@/components/inventory/InventoryFilters';
import InventorySkeletons from '@/components/inventory/InventorySkeletons';
import InventoryHeader from '@/components/inventory/InventoryHeader';
import InventoryContent from '@/components/inventory/InventoryContent';
import InventoryDialogs from '@/components/inventory/InventoryDialogs';
import InventoryActions from '@/components/inventory/InventoryActions';

const Inventory = () => {
  const {
    // State and data
    stores,
    currentStoreId,
    setCurrentStoreId,
    categories,
    isLoading,
    canModify,
    
    // Dialogs state
    settingsDialogOpen,
    setSettingsDialogOpen,
    formDialogOpen,
    setFormDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    costHistoryDialogOpen,
    setCostHistoryDialogOpen,
    archiveDialogOpen,
    setArchiveDialogOpen,
    currentIngredient,
    
    // Archived ingredients
    archivedIngredients,
    archiveLoading,
    restoreIngredient,
    
    // Filters and content
    filters,
    setFilters,
    viewMode,
    setViewMode,
    sortState,
    handleSort,
    hasFilters,
    resetFilters,
    activeFilterCount,
    filteredAndSortedItems,
    
    // Action handlers
    handleOpenAddIngredient,
    handleEdit,
    handleDelete,
    handleViewCostHistory,
    handleAddEdit,
    confirmDelete
  } = useInventoryPage();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between">
        <InventoryHeader 
          canModify={canModify}
          onOpenArchives={() => setArchiveDialogOpen(true)}
        />
        
        <InventoryActions
          stores={stores}
          currentStoreId={currentStoreId}
          onStoreChange={setCurrentStoreId}
          onOpenSettings={() => setSettingsDialogOpen(true)}
          onOpenArchives={() => setArchiveDialogOpen(true)}
          canModify={canModify}
        />
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
