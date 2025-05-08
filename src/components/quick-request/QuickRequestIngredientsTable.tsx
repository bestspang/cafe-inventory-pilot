
import React from 'react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody 
} from '@/components/ui/table';
import { QuickRequestIngredient } from '@/types/quick-request';
import QuickRequestIngredientRow from './QuickRequestIngredientRow';
import { useStockCheckSettings } from '@/context/StockCheckSettingsContext';

interface QuickRequestIngredientsTableProps {
  ingredients: QuickRequestIngredient[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  actionType: 'request' | 'stock-update';
  disabled?: boolean;
}

const QuickRequestIngredientsTable: React.FC<QuickRequestIngredientsTableProps> = ({
  ingredients,
  onUpdateQuantity,
  actionType,
  disabled = false
}) => {
  // Get stock settings to determine whether to show stock details
  const { showStockDetail } = useStockCheckSettings();
  
  // Only show stock details for requests (not stock updates) when setting is enabled
  const showDetails = showStockDetail && actionType === 'request';
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-2">
        {actionType === 'request' ? 'Request Ingredients' : 'Stock Update'}
      </h3>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ingredient</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit</TableHead>
              {showDetails && (
                <>
                  <TableHead className="text-right">Reorder Pt</TableHead>
                  <TableHead className="text-right">On-Hand</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingredients.map(ingredient => (
              <QuickRequestIngredientRow
                key={ingredient.id}
                ingredient={ingredient}
                onUpdateQuantity={onUpdateQuantity}
                disabled={disabled}
                showDetails={showDetails}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default QuickRequestIngredientsTable;
