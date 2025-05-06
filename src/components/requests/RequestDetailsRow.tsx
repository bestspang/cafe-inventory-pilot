
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

interface DetailedItem {
  id: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  note?: string;
  recommendedQty?: number;
  currentQty?: number;
  fulfilled?: boolean;
  reorderPoint?: number;
}

const RequestDetailsRow: React.FC<RequestDetailsRowProps> = ({ 
  request, 
  showBranch, 
  isExpanded,
  onRefresh 
}) => {
  const { toast } = useToast();
  const [detailedItems, setDetailedItems] = useState<DetailedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch detailed request items data when expanded
  useEffect(() => {
    if (isExpanded) {
      fetchDetailedItems();
    }
  }, [isExpanded, request.id]);

  const fetchDetailedItems = async () => {
    if (!isExpanded || !request.branchId) return;
    
    setIsLoading(true);
    try {
      // 1. Fetch request items with ingredient info
      const { data: items, error } = await supabase
        .from('request_items')
        .select(`
          id,
          ingredient_id,
          quantity,
          note,
          recommended_qty,
          current_qty,
          fulfilled,
          ingredients (
            id,
            name
          )
        `)
        .eq('request_id', request.id);

      if (error) throw error;
      
      if (!items || items.length === 0) {
        setDetailedItems([]);
        return;
      }

      // 2. Fetch branch-specific inventory data with reorder points
      const { data: inventory, error: invError } = await supabase
        .from('branch_inventory')
        .select('ingredient_id, on_hand_qty, reorder_pt')
        .eq('branch_id', request.branchId)
        .in('ingredient_id', items.map(i => i.ingredient_id));

      if (invError) throw invError;

      // Create a map of inventory data for quick lookups
      const inventoryMap = Object.fromEntries(
        (inventory || []).map(item => [
          item.ingredient_id, 
          { onHandQty: item.on_hand_qty, reorderPt: item.reorder_pt }
        ])
      );

      // 3. Combine the data
      const detailed = items.map(item => ({
        id: item.id,
        ingredientId: item.ingredient_id,
        ingredientName: item.ingredients.name,
        quantity: item.quantity,
        note: item.note,
        recommendedQty: item.recommended_qty,
        currentQty: inventoryMap[item.ingredient_id]?.onHandQty || item.current_qty || 0,
        fulfilled: item.fulfilled || false,
        reorderPoint: inventoryMap[item.ingredient_id]?.reorderPt
      }));

      setDetailedItems(detailed);
    } catch (error: any) {
      console.error('Error fetching request details:', error);
      toast({
        title: 'Error loading request details',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (id: string, value: number) => {
    setDetailedItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity: value } : item
      )
    );
  };

  const handleToggleFulfilled = (id: string, checked: boolean) => {
    setDetailedItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, fulfilled: checked } : item
      )
    );
  };

  const handleSaveFulfillment = async () => {
    try {
      // Prepare updates for each item
      const updates = detailedItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        fulfilled: item.fulfilled
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
      const allFulfilled = detailedItems.every(item => item.fulfilled);
      
      // If all items are fulfilled, update the request status
      if (allFulfilled && request.status !== 'fulfilled') {
        await handleUpdate('requests', request.id, { status: 'fulfilled' });
      }
      
      toast({
        title: 'Fulfillment saved',
        description: 'The request fulfillment details have been updated.'
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

  if (!isExpanded) {
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
          {isLoading ? (
            <p className="text-center py-4">Loading details...</p>
          ) : (
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
                  {detailedItems.length > 0 ? (
                    detailedItems.map((item) => (
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
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox 
                            checked={item.fulfilled || false}
                            onCheckedChange={(checked) => handleToggleFulfilled(item.id, !!checked)}
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
                <Button onClick={handleSaveFulfillment} variant="success">
                  Save Fulfillment
                </Button>
              </div>
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default RequestDetailsRow;
