
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

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
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
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
                  onToggleStatus={onToggleStatus}
                  onDeleteRequest={canDelete ? handleDelete : undefined}
                  formatDate={formatDate}
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
