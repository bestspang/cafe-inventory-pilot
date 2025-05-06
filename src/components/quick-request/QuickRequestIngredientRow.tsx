
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { QuickRequestIngredient } from '@/types/quick-request';

interface QuickRequestIngredientRowProps {
  ingredient: QuickRequestIngredient;
  onUpdateQuantity: (id: string, quantity: number) => void;
  disabled?: boolean;
}

const QuickRequestIngredientRow: React.FC<QuickRequestIngredientRowProps> = ({
  ingredient,
  onUpdateQuantity,
  disabled = false
}) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{ingredient.name}</TableCell>
      <TableCell>
        <Input
          type="number"
          min="0"
          value={ingredient.quantity}
          onChange={(e) => onUpdateQuantity(ingredient.id, parseInt(e.target.value) || 0)}
          className="w-20"
          disabled={disabled}
        />
      </TableCell>
      <TableCell>{ingredient.unit}</TableCell>
    </TableRow>
  );
};

export default QuickRequestIngredientRow;
