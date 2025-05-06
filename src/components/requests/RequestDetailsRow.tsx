
import React, { useState, useEffect } from 'react';
import { TableCell, TableRow, Table, TableHeader, TableHead, TableBody } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { RequestItem } from '@/types/requests';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { handleUpdate } from '@/utils/updateHandler';

interface RequestDetailsRowProps {
  request: RequestItem;
  showBranch: boolean;
  isExpanded: boolean;
  onRefresh?: () => Promise<void>;
}

interface FulfillmentItem {
  id: string;
  quantity: number;
  fulfilled: boolean;
}

const RequestDetailsRow: React.FC<RequestDetailsRowProps> = ({ 
  request, 
  showBranch, 
  isExpanded,
  onRefresh 
}) => {
  const { toast } = useToast();
  const [fulfillmentItems, setFulfillmentItems] = useState<{
    [key: string]: {
      quantity: number;
      fulfilled: boolean;
    }
  }>({});

  // Initialize fulfillment items when expanded
  useEffect(() => {
    if (isExpanded && request.requestItems) {
      const initialState: { [key: string]: { quantity: number; fulfilled: boolean } } = {};
      request.requestItems.forEach(item => {
        initialState[item.id] = {
          quantity: item.quantity,
          fulfilled: item.fulfilled || false
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
        fulfilled: checked
      }
    }));
  };

  const handleSaveFulfillment = async () => {
    try {
      // Convert the fulfillment items object to an array for batch update
      const updates = Object.entries(fulfillmentItems).map(([id, values]) => ({
        id,
        quantity: values.quantity,
        fulfilled: values.fulfilled
      }));
      
      // Update each item individually
      for (const item of updates) {
        const { error } = await supabase
          .from('request_items')
          .update({
            quantity: item.quantity,
            fulfilled: item.fulfilled
          })
          .eq('id', item.id);
        
        if (error) {
          throw error;
        }
      }
      
      // Check if all items are fulfilled
      const allFulfilled = Object.values(fulfillmentItems).every(item => item.fulfilled);
      
      // If all items are fulfilled, update the request status
      if (allFulfilled && request.status !== 'fulfilled') {
        await handleUpdate('requests', request.id, { status: 'fulfilled' });
      }
      
      toast({
        title: 'Fulfillment updated',
        description: 'The request fulfillment details have been saved.'
      });
      
      // Refresh the data if callback provided
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error: any) {
      console.error('Error saving fulfillment:', error);
      toast({
        title: 'Error saving fulfillment',
        description: error.message || 'Failed to save fulfillment details',
        variant: 'destructive'
      });
    }
  };

  if (!isExpanded || !request.requestItems) {
    return null;
  }

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
                    <TableCell>{item.recommendedQty !== undefined ? item.recommendedQty : 'N/A'}</TableCell>
                    <TableCell>{item.currentQty !== undefined ? item.currentQty : 'N/A'}</TableCell>
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
                        checked={fulfillmentItems[item.id]?.fulfilled || false}
                        onCheckedChange={(checked) => handleToggleDone(item.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell className="text-right">{item.note || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-end p-2 bg-muted/20">
              <Button onClick={handleSaveFulfillment} variant="success">
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
