
import React, { useState } from 'react';
import { TableCell, TableRow, Table, TableHeader, TableHead, TableBody } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { RequestItem } from '@/types/requests';
import { useToast } from '@/hooks/use-toast';

interface RequestDetailsRowProps {
  request: RequestItem;
  showBranch: boolean;
  isExpanded: boolean;
}

const RequestDetailsRow: React.FC<RequestDetailsRowProps> = ({ 
  request, 
  showBranch, 
  isExpanded 
}) => {
  const { toast } = useToast();
  const [fulfillmentItems, setFulfillmentItems] = useState<{
    [key: string]: {
      quantity: number;
      isDone: boolean;
    }
  }>({});

  // Initialize fulfillment items when expanded
  React.useEffect(() => {
    if (isExpanded && request.requestItems) {
      const initialState: { [key: string]: { quantity: number; isDone: boolean } } = {};
      request.requestItems.forEach(item => {
        initialState[item.id] = {
          quantity: item.quantity,
          isDone: false
        };
      });
      setFulfillmentItems(initialState);
    }
  }, [isExpanded, request.requestItems]);

  const handleQuantityChange = (id: string, value: number) => {
    setFulfillmentItems(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        quantity: value
      }
    }));
  };

  const handleToggleDone = (id: string, checked: boolean) => {
    setFulfillmentItems(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isDone: checked
      }
    }));
  };

  const handleSaveFulfillment = () => {
    // This would normally save to the database
    console.log('Saving fulfillment data:', fulfillmentItems);
    
    toast({
      title: 'Fulfillment updated',
      description: 'The request fulfillment details have been saved.'
    });
  };

  if (!isExpanded || !request.requestItems) {
    return null;
  }

  // Recommended quantities would normally come from the database
  // This is a placeholder for demonstration purposes
  const recommendedQuantities = {
    // ingredientId: recommendedQty
  };
  
  // Current quantities would normally come from the database
  // This is a placeholder for demonstration purposes
  const currentQuantities = {
    // ingredientId: currentQty
  };

  return (
    <TableRow className="bg-muted/40">
      <TableCell 
        colSpan={showBranch ? 6 : 5}
        className="py-4"
      >
        <div className="px-4">
          <h4 className="text-sm font-medium mb-2">Request Details</h4>
          <div className="bg-background border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Ingredient</TableHead>
                  <TableHead>Rec.q</TableHead>
                  <TableHead>Current</TableHead>
                  <TableHead>Add</TableHead>
                  <TableHead>Mark</TableHead>
                  <TableHead className="text-right">Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {request.requestItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.ingredientName}</TableCell>
                    <TableCell>{recommendedQuantities[item.ingredientId] || 'N/A'}</TableCell>
                    <TableCell>{currentQuantities[item.ingredientId] || 'N/A'}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="w-20 h-8"
                        min={0}
                        value={fulfillmentItems[item.id]?.quantity || item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox 
                        checked={fulfillmentItems[item.id]?.isDone || false}
                        onCheckedChange={(checked) => handleToggleDone(item.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell className="text-right">{item.note || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-end p-2 bg-muted/20">
              <Button onClick={handleSaveFulfillment}>
                Save Fulfillment
              </Button>
            </div>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default RequestDetailsRow;
