
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { IngredientForm } from './IngredientForm';
import { Ingredient, Category } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface IngredientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Ingredient>) => Promise<void>;
  ingredient?: Ingredient;
  categories: Category[];
}

const IngredientFormDialog: React.FC<IngredientFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  ingredient,
  categories
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Helper to attach the handler to the window for global access
  // This is a temporary solution until a more proper context-based approach is implemented
  useEffect(() => {
    const originalHandleNewCategory = window.handleNewCategory;
    return () => {
      // Restore the original method when component unmounts (if any)
      window.handleNewCategory = originalHandleNewCategory;
    };
  }, []);

  const handleSubmit = async (data: Partial<Ingredient>) => {
    try {
      setIsSubmitting(true);
      console.log('Submitting form with data:', data);
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to save ingredient.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleFormClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{ingredient ? 'Edit Ingredient' : 'Add New Ingredient'}</DialogTitle>
          <DialogDescription>
            {ingredient 
              ? 'Update the details for this ingredient.' 
              : 'Add a new ingredient to your inventory.'}
          </DialogDescription>
        </DialogHeader>
        
        <IngredientForm
          onSubmit={handleSubmit}
          onCancel={handleFormClose}
          ingredient={ingredient}
          categories={categories}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

// Fix the "window does not have handleNewCategory" TypeScript issue
declare global {
  interface Window {
    handleNewCategory?: (tempId: string, categoryName: string) => Promise<string | null>;
  }
}

export default IngredientFormDialog;
