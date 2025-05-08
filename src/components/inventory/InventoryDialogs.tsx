
import React from 'react';
import { Ingredient, Category } from '@/types';
import IngredientFormDialog from './IngredientFormDialog';
import DeleteIngredientDialog from './DeleteIngredientDialog';
import CostHistoryDialog from './CostHistoryDialog';
import ArchivedIngredientsDialog from './ArchivedIngredientsDialog';

interface InventoryDialogsProps {
  formDialogOpen: boolean;
  setFormDialogOpen: (open: boolean) => void;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  costHistoryDialogOpen: boolean;
  setCostHistoryDialogOpen: (open: boolean) => void;
  archiveDialogOpen: boolean;
  setArchiveDialogOpen: (open: boolean) => void;
  currentIngredient: Ingredient | null;
  categories: Category[];
  onSubmitForm: (data: Partial<Ingredient>) => Promise<void>;
  onConfirmDelete: () => void;
  archivedIngredients: Ingredient[];
  onRestoreIngredient: (ingredient: Ingredient) => Promise<void>;
  archiveLoading: boolean;
}

const InventoryDialogs: React.FC<InventoryDialogsProps> = ({
  formDialogOpen,
  setFormDialogOpen,
  deleteDialogOpen,
  setDeleteDialogOpen,
  costHistoryDialogOpen,
  setCostHistoryDialogOpen,
  archiveDialogOpen,
  setArchiveDialogOpen,
  currentIngredient,
  categories,
  onSubmitForm,
  onConfirmDelete,
  archivedIngredients,
  onRestoreIngredient,
  archiveLoading
}) => {
  return (
    <>
      {/* Add/Edit Ingredient Dialog */}
      <IngredientFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSubmit={onSubmitForm}
        ingredient={currentIngredient}
        categories={categories}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteIngredientDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        ingredient={currentIngredient}
        onConfirmDelete={onConfirmDelete}
      />

      {/* Cost History Dialog */}
      <CostHistoryDialog
        open={costHistoryDialogOpen}
        onOpenChange={setCostHistoryDialogOpen}
        ingredient={currentIngredient}
      />

      {/* Archived Ingredients Dialog */}
      <ArchivedIngredientsDialog
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        archivedIngredients={archivedIngredients}
        onRestoreIngredient={onRestoreIngredient}
        isLoading={archiveLoading}
      />
    </>
  );
};

export default InventoryDialogs;
