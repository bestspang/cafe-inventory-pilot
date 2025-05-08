
import React from 'react';
import { Archive } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Ingredient } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ArchivedIngredientsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  archivedIngredients: Ingredient[];
  onRestoreIngredient: (ingredient: Ingredient) => Promise<void>;
  isLoading: boolean;
}

const ArchivedIngredientsDialog: React.FC<ArchivedIngredientsDialogProps> = ({
  open,
  onOpenChange,
  archivedIngredients,
  onRestoreIngredient,
  isLoading
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Archived Ingredients
          </DialogTitle>
          <DialogDescription>
            View and restore ingredients that have been archived
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : archivedIngredients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Archive className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No archived ingredients found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {archivedIngredients.map((ingredient) => (
                <TableRow key={ingredient.id}>
                  <TableCell className="font-medium">{ingredient.name}</TableCell>
                  <TableCell>
                    {ingredient.categoryName ? (
                      <Badge variant="outline">{ingredient.categoryName}</Badge>
                    ) : (
                      'Uncategorized'
                    )}
                  </TableCell>
                  <TableCell>{ingredient.unit}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onRestoreIngredient(ingredient)}
                      className="gap-1"
                    >
                      <Archive className="h-4 w-4" />
                      Restore
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ArchivedIngredientsDialog;
