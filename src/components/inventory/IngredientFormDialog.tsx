
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Copy, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [error, setError] = useState<{title: string, message: string} | null>(null);
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
      setError(null);
      console.log('Submitting form with data:', data);
      await onSubmit(data);
    } catch (err: any) {
      console.error('Error submitting form:', err);
      const errorMessage = err.message || "An unexpected error occurred.";
      const errorDetails = err.details || err.hint || JSON.stringify(err);
      
      setError({
        title: "Failed to save ingredient",
        message: errorMessage + (errorDetails ? `: ${errorDetails}` : "")
      });
      
      toast({
        title: "Error",
        description: "Failed to save ingredient. See form for details.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormClose = () => {
    if (!isSubmitting) {
      setError(null);
      onOpenChange(false);
    }
  };
  
  const copyErrorToClipboard = () => {
    if (error) {
      navigator.clipboard.writeText(`${error.title}: ${error.message}`);
      toast({
        title: "Copied to clipboard",
        description: "Error details have been copied to your clipboard."
      });
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
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertTitle className="flex items-center justify-between">
              {error.title}
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2 h-6 px-2"
                onClick={copyErrorToClipboard}
              >
                <Copy className="h-3 w-3 mr-1" /> Copy
              </Button>
            </AlertTitle>
            <AlertDescription className="break-words">{error.message}</AlertDescription>
          </Alert>
        )}
        
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
