
import React from 'react';
import { Edit2, Trash2, History } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { Ingredient } from '@/types';

interface IngredientCardProps {
  ingredient: Ingredient;
  onEdit: () => void;
  onDelete: () => void;
  onViewCostHistory?: () => void;
}

const formatCost = (cost: number | null | undefined) => {
  if (cost === null || cost === undefined) return '-';
  return `$${cost.toFixed(2)}`;
};

const IngredientCard: React.FC<IngredientCardProps> = ({ 
  ingredient,
  onEdit,
  onDelete,
  onViewCostHistory
}) => {
  const { user } = useAuth();
  
  // Check if user can edit/delete (owner or manager)
  const canModify = ['owner', 'manager'].includes(user?.role || '');

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-6 pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h3 className="font-medium">{ingredient.name}</h3>
            <Badge variant="outline">{ingredient.categoryName || 'Uncategorized'}</Badge>
          </div>
        </div>
        <div className="mt-4 text-sm space-y-3">
          <div>
            <p className="text-muted-foreground">Unit</p>
            <p>{ingredient.unit}</p>
          </div>
          {canModify && (
            <div>
              <p className="text-muted-foreground">Cost per unit</p>
              <p>{formatCost(ingredient.costPerUnit)}</p>
            </div>
          )}
        </div>
      </CardContent>
      {canModify && (
        <CardFooter className="flex justify-end gap-2 pt-2 pb-4 px-6">
          {ingredient.costPerUnit !== null && ingredient.costPerUnit !== undefined && onViewCostHistory && (
            <Button variant="ghost" size="sm" onClick={onViewCostHistory}>
              <History className="h-4 w-4 mr-1" />
              History
            </Button>
          )}
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
