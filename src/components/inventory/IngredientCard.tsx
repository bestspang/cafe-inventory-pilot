
import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { Ingredient } from '@/types';

interface IngredientCardProps {
  ingredient: Ingredient & { 
    categoryName: string;
    onHandQty?: number;
  };
  onEdit: () => void;
  onDelete: () => void;
}

const IngredientCard: React.FC<IngredientCardProps> = ({ 
  ingredient,
  onEdit,
  onDelete
}) => {
  const { user } = useAuth();
  
  // Check if user can edit/delete (owner or manager)
  const canModify = ['owner', 'manager'].includes(user?.role || '');
  
  // Determine stock status
  const getStockStatus = () => {
    if (ingredient.onHandQty === undefined) return null;
    
    if (ingredient.onHandQty <= ingredient.defaultReorderPoint * 0.5) {
      return { label: 'Low Stock', variant: 'destructive' as const };
    }
    if (ingredient.onHandQty <= ingredient.defaultReorderPoint) {
      return { label: 'Reorder Soon', variant: 'warning' as const };
    }
    return { label: 'In Stock', variant: 'success' as const };
  };
  
  const stockStatus = getStockStatus();

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-6 pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h3 className="font-medium">{ingredient.name}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{ingredient.categoryName}</Badge>
              {stockStatus && (
                <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
          <div>
            <p className="text-muted-foreground">Unit</p>
            <p>{ingredient.unit}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Reorder Point</p>
            <p>{ingredient.defaultReorderPoint}</p>
          </div>
          {ingredient.onHandQty !== undefined && (
            <div>
              <p className="text-muted-foreground">On Hand</p>
              <p>{ingredient.onHandQty}</p>
            </div>
          )}
        </div>
      </CardContent>
      {canModify && (
        <CardFooter className="flex justify-end gap-2 pt-2 pb-4 px-6">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default IngredientCard;
