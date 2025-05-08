
import React from 'react';
import { QuickRequestIngredient } from '@/types/quick-request';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import QuickRequestIngredientTableRow from './QuickRequestIngredientTableRow';
import QuickRequestIngredientTableLoading from './QuickRequestIngredientTableLoading';
import QuickRequestIngredientTableEmpty from './QuickRequestIngredientTableEmpty';

interface QuickRequestIngredientTableProps {
  ingredients: QuickRequestIngredient[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  disabled?: boolean;
  showDetails?: boolean;
  isLoading?: boolean;
}

const QuickRequestIngredientTable: React.FC<QuickRequestIngredientTableProps> = ({
  ingredients,
  onUpdateQuantity,
  disabled = false,
  showDetails = false,
  isLoading = false
}) => {
  // Sort ingredients by name
  const sortedIngredients = [...ingredients].sort((a, b) => a.name.localeCompare(b.name));
  
  if (isLoading) {
    return <QuickRequestIngredientTableLoading />;
  }
  
  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Name</TableHead>
            <TableHead>Unit</TableHead>
            {showDetails && (
              <>
                <TableHead className="text-right">Current</TableHead>
                <TableHead className="text-right">Reorder At</TableHead>
              </>
            )}
            <TableHead className="text-right">Quantity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedIngredients.length > 0 ? (
            sortedIngredients.map(ingredient => (
              <QuickRequestIngredientTableRow
                key={ingredient.id}
                ingredient={ingredient}
                onUpdateQuantity={onUpdateQuantity}
                disabled={disabled}
                showDetails={showDetails}
              />
            ))
          ) : (
            <QuickRequestIngredientTableEmpty 
              showDetails={showDetails} 
            />
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default QuickRequestIngredientTable;
