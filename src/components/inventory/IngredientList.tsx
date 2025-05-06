
import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Ingredient } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface IngredientListProps {
  ingredients: Ingredient[];
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
}

const IngredientList: React.FC<IngredientListProps> = ({ 
  ingredients,
  onEdit,
  onDelete
}) => {
  const { user } = useAuth();
  const canModify = ['owner', 'manager'].includes(user?.role || '');

  return (
    <div className="rounded-md border">
      <Table className="table-auto">
        <TableHeader>
          <TableRow>
            <TableHead className="px-4 py-2">Name</TableHead>
            <TableHead className="px-4 py-2">Category</TableHead>
            <TableHead className="px-4 py-2">Unit</TableHead>
            {canModify && <TableHead className="px-4 py-2 text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {ingredients.map((ingredient) => (
            <TableRow key={ingredient.id}>
              <TableCell className="px-4 py-2 font-medium">{ingredient.name}</TableCell>
              <TableCell className="px-4 py-2">{ingredient.categoryName || 'Uncategorized'}</TableCell>
              <TableCell className="px-4 py-2">{ingredient.unit}</TableCell>
              {canModify && (
                <TableCell className="px-4 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(ingredient)}>
                      <Edit2 className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive" 
                      onClick={() => onDelete(ingredient)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default IngredientList;
