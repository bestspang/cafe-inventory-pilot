
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { QuickRequestIngredient } from '@/types/quick-request';
import { cn } from '@/lib/utils';

interface QuickRequestIngredientTableRowProps {
  ingredient: QuickRequestIngredient;
  onUpdateQuantity: (id: string, quantity: number) => void;
  disabled?: boolean;
  showDetails?: boolean;
}

const QuickRequestIngredientTableRow: React.FC<QuickRequestIngredientTableRowProps> = ({
  ingredient,
  onUpdateQuantity,
  disabled = false,
  showDetails = false
}) => {
  // Handle quantity change
  const handleQuantityChange = (value: string) => {
    const quantity = parseFloat(value);
    if (!isNaN(quantity) && quantity >= 0) {
      onUpdateQuantity(ingredient.id, quantity);
    }
  };
  
  // Check if this ingredient is below reorder point
  const isLowStock = showDetails && 
    typeof ingredient.onHandQty === 'number' && 
    typeof ingredient.reorderPt === 'number' && 
    ingredient.onHandQty <= ingredient.reorderPt;
  
  return (
    <TableRow>
      <TableCell className="font-medium">{ingredient.name}</TableCell>
      <TableCell>{ingredient.unit}</TableCell>
      {showDetails && (
        <>
          <TableCell className={cn("text-right", isLowStock && "text-red-500")}>
            {typeof ingredient.onHandQty === 'number' ? ingredient.onHandQty : '-'}
          </TableCell>
          <TableCell className="text-right">
            {ingredient.reorderPt || '-'}
          </TableCell>
        </>
      )}
      <TableCell className="text-right">
        <Input
          type="number"
          min={0}
          value={ingredient.quantity || ''}
          onChange={(e) => handleQuantityChange(e.target.value)}
          className="w-24 ml-auto"
          disabled={disabled}
        />
      </TableCell>
    </TableRow>
  );
};

export default QuickRequestIngredientTableRow;
