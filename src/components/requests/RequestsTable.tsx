
import React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { SortableColumn, SortState } from '@/components/ui/data-table/SortableColumn';

export interface RequestItem {
  id: string;
  branchId: string;
  branchName: string;
  userId: string;
  userName: string;
  requestedAt: string;
  status: 'pending' | 'fulfilled';
  itemsCount: number;
  detailText: string;
}

interface RequestsTableProps {
  requests: RequestItem[];
  onToggleStatus: (id: string) => void;
  showBranch: boolean;
  sortState: SortState;
  onSort: (column: string) => void;
}

const RequestsTable: React.FC<RequestsTableProps> = ({ 
  requests, 
  onToggleStatus,
  showBranch,
  sortState,
  onSort
}) => {
  const { user } = useAuth();
  const canFulfill = ['owner', 'manager'].includes(user?.role || '');
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };
  
  if (requests.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No requests found.</p>
      </div>
    );
  }
  
  return (
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
            {canFulfill && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">
                {formatDate(request.requestedAt)}
              </TableCell>
              
              {showBranch && (
                <TableCell>{request.branchName}</TableCell>
              )}
              
              <TableCell>{request.userName}</TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{request.itemsCount} items</span>
                  <Badge variant="outline" className="cursor-help" title={request.detailText}>
                    Details
                  </Badge>
                </div>
              </TableCell>
              
              <TableCell>
                <Badge variant={request.status === 'pending' ? 'warning' : 'success'}>
                  {request.status === 'pending' ? 'Pending' : 'Fulfilled'}
                </Badge>
              </TableCell>
              
              {canFulfill && (
                <TableCell className="text-right">
                  <Button
                    variant={request.status === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onToggleStatus(request.id)}
                  >
                    {request.status === 'pending' ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Mark Fulfilled
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Reopen
                      </>
                    )}
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RequestsTable;
