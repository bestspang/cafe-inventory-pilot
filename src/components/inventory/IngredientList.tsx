
import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  ingredients: Array<Ingredient & { 
    categoryName: string;
    onHandQty?: number;
  }>;
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
  
  const getStockStatus = (ingredient: Ingredient & { onHandQty?: number }) => {
    if (ingredient.onHandQty === undefined) return null;
    
    if (ingredient.onHandQty <= ingredient.defaultReorderPoint * 0.5) {
      return { label: 'Low Stock', variant: 'destructive' as const };
    }
    if (ingredient.onHandQty <= ingredient.defaultReorderPoint) {
      return { label: 'Reorder Soon', variant: 'warning' as const };
    }
    return { label: 'In Stock', variant: 'success' as const };
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Reorder Point</TableHead>
            <TableHead>On Hand</TableHead>
            <TableHead>Status</TableHead>
            {canModify && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {ingredients.map((ingredient) => {
            const stockStatus = getStockStatus(ingredient);
            
            return (
              <TableRow key={ingredient.id}>
                <TableCell className="font-medium">{ingredient.name}</TableCell>
                <TableCell>{ingredient.categoryName}</TableCell>
                <TableCell>{ingredient.unit}</TableCell>
                <TableCell>{ingredient.defaultReorderPoint}</TableCell>
                <TableCell>{ingredient.onHandQty !== undefined ? ingredient.onHandQty : 'N/A'}</TableCell>
                <TableCell>
                  {stockStatus && (
                    <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                  )}
                </TableCell>
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
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default IngredientList;
