import React from 'react';
import { useInventory } from '@/hooks/useInventory';
import InventoryFilters from '@/components/inventory/InventoryFilters';
import IngredientCard from '@/components/inventory/IngredientCard';
import IngredientList from '@/components/inventory/IngredientList';
import IngredientFormDialog from '@/components/inventory/IngredientFormDialog';
import DeleteIngredientDialog from '@/components/inventory/DeleteIngredientDialog';
import CostHistoryDialog from '@/components/inventory/CostHistoryDialog';
import InventoryEmptyState from '@/components/inventory/InventoryEmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { useInventoryFilters } from '@/hooks/inventory/useInventoryFilters';
const InventorySkeletons = ({
  viewMode
}: {
  viewMode: 'grid' | 'list';
}) => {
  return viewMode === 'grid' ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => <div key={i} className="border rounded-md p-4 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>)}
    </div> : <div className="space-y-2">
      {[...Array(6)].map((_, i) => <div key={i} className="border rounded-md p-4 flex items-center justify-between">
          <div className="space-y-2 w-full">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>)}
    </div>;
};
const Inventory = () => {
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
    isLoading
  } = useInventory();

  // Use our new filter hook
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
  return <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Ingredient Registry</h1>
        <p className="text-muted-foreground">
          {canModify ? 'Add, edit, and manage your global ingredient list.' : 'View the global ingredient list.'}
        </p>
      </div>

      {isLoading ? <InventorySkeletons viewMode={viewMode} /> : <>
          <InventoryFilters filters={filters} setFilters={setFilters} viewMode={viewMode} setViewMode={setViewMode} categories={categories} onAddIngredient={() => {
        setCurrentIngredient(undefined);
        setFormDialogOpen(true);
      }} canModify={canModify} resetFilters={resetFilters} activeFilterCount={activeFilterCount} />

          {filteredAndSortedItems.length > 0 ? viewMode === 'grid' ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAndSortedItems.map(ingredient => <IngredientCard key={ingredient.id} ingredient={ingredient} onEdit={() => handleEdit(ingredient)} onDelete={() => handleDelete(ingredient)} onViewCostHistory={() => handleViewCostHistory(ingredient)} />)}
              </div> : <IngredientList ingredients={filteredAndSortedItems} onEdit={handleEdit} onDelete={handleDelete} onViewCostHistory={handleViewCostHistory} sortState={sortState} onSort={handleSort} /> : <InventoryEmptyState hasFilters={hasFilters} canModify={canModify} onAddIngredient={() => {
        setCurrentIngredient(undefined);
        setFormDialogOpen(true);
      }} />}
        </>}
      
      {/* Add/Edit Ingredient Dialog */}
      <IngredientFormDialog open={formDialogOpen} onOpenChange={setFormDialogOpen} onSubmit={handleAddEdit} ingredient={currentIngredient} categories={categories} />
      
      {/* Delete Confirmation Dialog */}
      <DeleteIngredientDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} ingredient={currentIngredient} onConfirmDelete={confirmDelete} />

      {/* Cost History Dialog */}
      <CostHistoryDialog open={costHistoryDialogOpen} onOpenChange={setCostHistoryDialogOpen} ingredient={currentIngredient} />
    </div>;
};
export default Inventory;