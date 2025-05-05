
import React from 'react';
import { useInventory } from '@/hooks/useInventory';
import InventoryFilters from '@/components/inventory/InventoryFilters';
import IngredientCard from '@/components/inventory/IngredientCard';
import IngredientFormDialog from '@/components/inventory/IngredientFormDialog';
import DeleteIngredientDialog from '@/components/inventory/DeleteIngredientDialog';
import InventoryEmptyState from '@/components/inventory/InventoryEmptyState';

const Inventory = () => {
  const {
    ingredients,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    formDialogOpen,
    setFormDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    currentIngredient,
    canModify,
    categories,
    handleAddEdit,
    handleEdit,
    handleDelete,
    confirmDelete,
    hasFilters
  } = useInventory();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <p className="text-muted-foreground">
          {canModify 
            ? 'Add, edit, and manage your inventory ingredients.' 
            : 'View your inventory ingredients.'
          }
        </p>
      </div>

      <InventoryFilters
        search={search}
        setSearch={setSearch}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
        onAddIngredient={() => {
          setCurrentIngredient(undefined);
          setFormDialogOpen(true);
        }}
        canModify={canModify}
      />

      {ingredients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ingredients.map((ingredient) => (
            <IngredientCard
              key={ingredient.id}
              ingredient={ingredient}
              onEdit={() => handleEdit(ingredient)}
              onDelete={() => handleDelete(ingredient)}
            />
          ))}
        </div>
      ) : (
        <InventoryEmptyState 
          hasFilters={hasFilters}
          canModify={canModify}
          onAddIngredient={() => {
            setCurrentIngredient(undefined);
            setFormDialogOpen(true);
          }}
        />
      )}
      
      {/* Add/Edit Ingredient Dialog */}
      <IngredientFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSubmit={handleAddEdit}
        ingredient={currentIngredient}
        categories={categories}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteIngredientDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        ingredient={currentIngredient}
        onConfirmDelete={confirmDelete}
      />
    </div>
  );
};

export default Inventory;
