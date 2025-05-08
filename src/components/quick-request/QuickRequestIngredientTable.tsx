
import React from 'react';
import { QuickRequestIngredient } from '@/types/quick-request';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

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
  // Handle quantity change
  const handleQuantityChange = (id: string, value: string) => {
    const quantity = parseFloat(value);
    if (!isNaN(quantity) && quantity >= 0) {
      onUpdateQuantity(id, quantity);
    }
  };
  
  // Sort ingredients by name
  const sortedIngredients = [...ingredients].sort((a, b) => a.name.localeCompare(b.name));
  
  if (isLoading) {
    return (
      <div className="text-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
        <p className="text-muted-foreground">Loading ingredients...</p>
      </div>
    );
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
            sortedIngredients.map(ingredient => {
              // Check if this ingredient is below reorder point
              const isLowStock = showDetails && 
                typeof ingredient.onHandQty === 'number' && 
                typeof ingredient.reorderPt === 'number' && 
                ingredient.onHandQty <= ingredient.reorderPt;
              
              return (
                <TableRow key={ingredient.id}>
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
                      onChange={(e) => handleQuantityChange(ingredient.id, e.target.value)}
                      className="w-24 ml-auto"
                      disabled={disabled}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={showDetails ? 5 : 3} className="text-center py-4">
                No ingredients available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default QuickRequestIngredientTable;
