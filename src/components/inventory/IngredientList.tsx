
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
import { SortableColumn, SortState } from '@/components/ui/data-table/SortableColumn';

interface IngredientListProps {
  ingredients: Ingredient[];
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
  sortState: SortState;
  onSort: (column: string) => void;
}

const IngredientList: React.FC<IngredientListProps> = ({ 
  ingredients,
  onEdit,
  onDelete,
  sortState,
  onSort
}) => {
  const { user } = useAuth();
  const canModify = ['owner', 'manager'].includes(user?.role || '');

  return (
    <div className="rounded-md border overflow-hidden">
      <Table className="table-auto">
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortableColumn 
                label="Name" 
                columnKey="name" 
                sortState={sortState} 
                onSort={onSort} 
              />
            </TableHead>
            <TableHead>
              <SortableColumn 
                label="Category" 
                columnKey="categoryName" 
                sortState={sortState} 
                onSort={onSort} 
              />
            </TableHead>
            <TableHead>
              <SortableColumn 
                label="Unit" 
                columnKey="unit" 
                sortState={sortState} 
                onSort={onSort} 
              />
            </TableHead>
            {canModify && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {ingredients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={canModify ? 4 : 3} className="h-24 text-center">
                No ingredients found.
              </TableCell>
            </TableRow>
          ) : (
            ingredients.map((ingredient) => (
              <TableRow key={ingredient.id}>
                <TableCell className="font-medium">{ingredient.name}</TableCell>
                <TableCell>{ingredient.categoryName || 'Uncategorized'}</TableCell>
                <TableCell>{ingredient.unit}</TableCell>
                {canModify && (
                  <TableCell className="text-right">
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default IngredientList;
