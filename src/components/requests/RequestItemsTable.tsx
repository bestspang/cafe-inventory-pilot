
import React from 'react';
import { TableHeader, TableHead, TableRow, TableBody, TableCell, Table } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { DetailedRequestItem } from '@/types/requests';

interface RequestItemsTableProps {
  items: DetailedRequestItem[];
  isLoading: boolean;
  onQuantityChange: (id: string, value: number) => void;
  onToggleFulfilled: (id: string, checked: boolean) => void;
  onSaveFulfillment: () => Promise<void>;
}

const RequestItemsTable: React.FC<RequestItemsTableProps> = ({
  items,
  isLoading,
  onQuantityChange,
  onToggleFulfilled,
  onSaveFulfillment
}) => {
  if (isLoading) {
    return <p className="text-center py-4">Loading details...</p>;
  }

  // Check if all items are marked as fulfilled
  const allItemsMarked = items.length > 0 && items.every(item => item.fulfilled);

  return (
    <div className="bg-background border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/4">Ingredient</TableHead>
            <TableHead className="text-right">Reorder Point</TableHead>
            <TableHead className="text-right">Current</TableHead>
            <TableHead className="text-center">Add</TableHead>
            <TableHead className="text-center">Mark</TableHead>
            <TableHead>Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length > 0 ? (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.ingredientName}</TableCell>
                <TableCell className="text-right">
                  {item.reorderPoint !== undefined ? item.reorderPoint : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  {item.currentQty !== undefined ? item.currentQty : 'N/A'}
                </TableCell>
                <TableCell className="text-center">
                  <Input
                    type="number"
                    className="w-20 h-8"
                    min={0}
                    value={item.quantity}
                    onChange={(e) => onQuantityChange(item.id, parseInt(e.target.value) || 0)}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Checkbox 
                    checked={item.fulfilled || false}
                    onCheckedChange={(checked) => onToggleFulfilled(item.id, !!checked)}
                  />
                </TableCell>
                <TableCell>{item.note || '-'}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                No items found for this request.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex justify-end p-2 bg-muted/20">
        <Button 
          onClick={onSaveFulfillment} 
          variant="success" 
          disabled={!allItemsMarked}
          title={!allItemsMarked ? "All items must be marked to fulfill request" : "Save fulfillment"}
        >
          Save Fulfillment
        </Button>
      </div>
    </div>
  );
};

export default RequestItemsTable;
