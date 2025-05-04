
import React from 'react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { StockItem } from '@/types/stock-check';

interface StockCheckTableProps {
  items: StockItem[];
  handleQuantityChange: (id: string, quantity: number) => void;
  updatedItems: Record<string, boolean>;
}

const StockCheckTable: React.FC<StockCheckTableProps> = ({ 
  items, 
  handleQuantityChange,
  updatedItems 
}) => {
  const getStockStatus = (item: StockItem) => {
    if (item.onHandQty <= item.defaultReorderPoint * 0.5) {
      return { label: 'Low', variant: 'destructive' as const };
    }
    if (item.onHandQty <= item.defaultReorderPoint) {
      return { label: 'Reorder', variant: 'warning' as const };
    }
    return { label: 'OK', variant: 'success' as const };
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ingredient</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Reorder Point</TableHead>
            <TableHead>On-hand Qty</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const stockStatus = getStockStatus(item);
            return (
              <TableRow key={item.id} className={updatedItems[item.id] ? 'bg-green-50 dark:bg-green-900/10' : ''}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.categoryName}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>{item.defaultReorderPoint}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    value={item.onHandQty}
                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                    className="w-20"
                  />
                </TableCell>
                <TableCell>
                  <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default StockCheckTable;
