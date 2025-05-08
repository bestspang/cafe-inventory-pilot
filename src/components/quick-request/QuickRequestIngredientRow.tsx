
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
  // Use controlled input to ensure state is always synced
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    onUpdateQuantity(ingredient.id, value);
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{ingredient.name}</TableCell>
      <TableCell>
        <Input
          name={`qty_${ingredient.id}`}
          type="number"
          min="0"
          // Ensure we always have a number for value (controlled input)
          value={ingredient.quantity}
          onChange={handleChange}
          className="w-20"
          disabled={disabled}
        />
      </TableCell>
      <TableCell>{ingredient.unit}</TableCell>
    </TableRow>
  );
};

export default QuickRequestIngredientRow;
