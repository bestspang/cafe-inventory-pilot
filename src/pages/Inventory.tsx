
import React from 'react';
import { useIntl } from 'react-intl';
import { useInventory } from '@/hooks/useInventory';
import { useInventoryFilters } from '@/hooks/inventory/useInventoryFilters';
import { useArchivedIngredients } from '@/hooks/inventory/useArchivedIngredients';
import InventoryFilters from '@/components/inventory/InventoryFilters';
import InventorySkeletons from '@/components/inventory/InventorySkeletons';
import InventoryHeader from '@/components/inventory/InventoryHeader';
import InventoryContent from '@/components/inventory/InventoryContent';
import InventoryDialogs from '@/components/inventory/InventoryDialogs';

const Inventory = () => {
  const intl = useIntl();
  
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
  } = useInventory();

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

  const handleOpenAddIngredient = () => {
    setCurrentIngredient(null);
    setFormDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <InventoryHeader 
        canModify={canModify}
        onOpenArchives={() => setArchiveDialogOpen(true)}
      />

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
      />
    </div>
  );
};

export default Inventory;
