
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { SortableColumn, SortState } from '@/components/ui/data-table/SortableColumn';
import { RequestItem } from '@/types/requests';
import RequestTableRow from './RequestTableRow';
import RequestDetailsRow from './RequestDetailsRow';
import { useDateFormatter } from '@/hooks/requests/useDateFormatter';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RequestsTableProps {
  requests: RequestItem[];
  onToggleStatus: (id: string) => void;
  onDeleteRequest?: (id: string) => void;
  showBranch: boolean;
  sortState: SortState;
  onSort: (column: string) => void;
  onRefresh?: () => Promise<void>;
}

const RequestsTable: React.FC<RequestsTableProps> = ({ 
  requests, 
  onToggleStatus,
  onDeleteRequest,
  showBranch,
  sortState,
  onSort,
  onRefresh
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
  const [itemsFulfillmentStatus, setItemsFulfillmentStatus] = useState<{ [key: string]: boolean }>({});
  const { formatDate } = useDateFormatter();
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);
  
  const canFulfill = ['owner', 'manager'].includes(user?.role || '');
  const canDelete = ['owner', 'manager'].includes(user?.role || '');
  
  // Toggle row expansion
  const toggleRowExpansion = (requestId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [requestId]: !prev[requestId]
    }));
  };
  
  const handleDelete = (requestId: string) => {
    setRequestToDelete(requestId);
  };
  
  const confirmDelete = () => {
    if (requestToDelete && onDeleteRequest) {
      onDeleteRequest(requestToDelete);
      setRequestToDelete(null);
    }
  };
  
  const cancelDelete = () => {
    setRequestToDelete(null);
  };

  // Handle mark fulfilled with inventory update
  const handleMarkFulfilled = async (requestId: string) => {
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request || request.status === 'fulfilled') return;
      
      // Get the detailed items for this request
      const { data: items, error: itemsError } = await supabase
        .from('request_items')
        .select(`
          id, 
          ingredient_id, 
          quantity, 
          fulfilled
        `)
        .eq('request_id', requestId);
      
      if (itemsError) throw itemsError;
      if (!items || items.length === 0) {
        toast({
          title: 'No items found',
          description: 'This request has no items to fulfill',
          variant: 'destructive'
        });
        return;
      }
      
      // Check if all items are fulfilled
      if (!items.every(item => item.fulfilled)) {
        toast({
          title: 'Action not allowed',
          description: 'All items must be marked as fulfilled before marking the request as fulfilled',
          variant: 'destructive'
        });
        return;
      }

      // Update branch inventory for each item
      for (const item of items) {
        // Step 1: Get the current quantity
        const { data: inventoryItem, error: fetchError } = await supabase
          .from('branch_inventory')
          .select('on_hand_qty')
          .eq('branch_id', request.branchId)
          .eq('ingredient_id', item.ingredient_id)
          .single();

        if (fetchError) {
          console.error('Error fetching inventory item:', fetchError);
          throw fetchError;
        }

        // Step 2: Calculate new quantity and update
        const currentQty = inventoryItem?.on_hand_qty || 0;
        const newQty = currentQty + item.quantity;
        
        const { error: updateError } = await supabase
          .from('branch_inventory')
          .update({ on_hand_qty: newQty })
          .eq('branch_id', request.branchId)
          .eq('ingredient_id', item.ingredient_id);

        if (updateError) {
          console.error('Error updating inventory:', updateError);
          throw updateError;
        }
      }
      
      // Update request status
      onToggleStatus(requestId);
      
      toast({
        title: 'Request fulfilled',
        description: 'The request has been marked as fulfilled and inventory has been updated'
      });
      
      // Refresh data
      if (onRefresh) {
        await onRefresh();
      }
      
    } catch (error: any) {
      console.error('Error marking request as fulfilled:', error);
      toast({
        title: 'Error fulfilling request',
        description: error.message || 'Failed to fulfill the request',
        variant: 'destructive'
      });
    }
  };
  
  if (requests.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No requests found.</p>
      </div>
    );
  }
  
  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortableColumn 
                  label="Date" 
                  columnKey="requestedAt" 
                  sortState={sortState} 
                  onSort={onSort} 
                  className="w-[100px]"
                />
              </TableHead>
              {showBranch && (
                <TableHead>
                  <SortableColumn 
                    label="Branch" 
                    columnKey="branchName" 
                    sortState={sortState} 
                    onSort={onSort} 
                  />
                </TableHead>
              )}
              <TableHead>
                <SortableColumn 
                  label="Requested By" 
                  columnKey="userName" 
                  sortState={sortState} 
                  onSort={onSort} 
                />
              </TableHead>
              <TableHead>Items</TableHead>
              <TableHead>
                <SortableColumn 
                  label="Status" 
                  columnKey="status" 
                  sortState={sortState} 
                  onSort={onSort} 
                />
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <React.Fragment key={request.id}>
                <RequestTableRow 
                  request={request}
                  showBranch={showBranch}
                  canFulfill={canFulfill}
                  isExpanded={!!expandedRows[request.id]}
                  onToggleExpand={toggleRowExpansion}
                  onToggleStatus={() => handleMarkFulfilled(request.id)}
                  onDeleteRequest={canDelete ? handleDelete : undefined}
                  formatDate={formatDate}
                  allItemsChecked={itemsFulfillmentStatus[request.id]}
                />
                
                <RequestDetailsRow
                  request={request}
                  showBranch={showBranch}
                  isExpanded={!!expandedRows[request.id]}
                  onRefresh={onRefresh}
                />
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <AlertDialog open={!!requestToDelete} onOpenChange={(open) => !open && cancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this request?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the request and all its items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RequestsTable;
