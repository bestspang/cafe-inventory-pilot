
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { QuickRequestIngredient } from '@/types/quick-request';

interface QuickRequestIngredientRowProps {
  ingredient: QuickRequestIngredient;
  onUpdateQuantity: (id: string, quantity: number) => void;
  disabled?: boolean;
  showDetails?: boolean;
}

const QuickRequestIngredientRow: React.FC<QuickRequestIngredientRowProps> = ({
  ingredient,
  onUpdateQuantity,
  disabled = false,
  showDetails = false
}) => {
  // Handle numeric input changes with fully controlled input
  // Using onInput to capture changes immediately (including spinner clicks)
  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const value = parseInt((e.target as HTMLInputElement).value) || 0;
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
          value={ingredient.quantity ?? 0}
          onInput={handleInput}
          onChange={() => {/* no-op so React doesn't complain */}}
          className="w-20"
          disabled={disabled}
        />
      </TableCell>
      <TableCell>{ingredient.unit}</TableCell>

      {showDetails && (
        <>
          <TableCell className="text-right">
            {ingredient.reorderPt ?? 'N/A'}
          </TableCell>
          <TableCell className="text-right">
            {ingredient.onHandQty ?? 'N/A'}
          </TableCell>
        </>
      )}
    </TableRow>
  );
}

export default QuickRequestIngredientRow;
