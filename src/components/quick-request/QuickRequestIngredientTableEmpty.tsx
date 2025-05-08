
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';

interface QuickRequestIngredientTableEmptyProps {
  showDetails?: boolean;
}

const QuickRequestIngredientTableEmpty: React.FC<QuickRequestIngredientTableEmptyProps> = ({ 
  showDetails = false 
}) => {
  return (
    <TableRow>
      <TableCell colSpan={showDetails ? 5 : 3} className="h-24 text-center">
        <div className="text-muted-foreground">
          No ingredients found for this store
        </div>
      </TableCell>
    </TableRow>
  );
};

export default QuickRequestIngredientTableEmpty;
