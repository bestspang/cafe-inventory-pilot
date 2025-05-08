
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';

interface QuickRequestIngredientTableEmptyProps {
  showDetails?: boolean;
  message?: string;
}

const QuickRequestIngredientTableEmpty: React.FC<QuickRequestIngredientTableEmptyProps> = ({
  showDetails = false,
  message = "No ingredients available"
}) => {
  return (
    <TableRow>
      <TableCell colSpan={showDetails ? 5 : 3} className="text-center py-4">
        {message}
      </TableCell>
    </TableRow>
  );
};

export default QuickRequestIngredientTableEmpty;
