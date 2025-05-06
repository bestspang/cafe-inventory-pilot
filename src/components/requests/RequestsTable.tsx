
import React, { useState } from 'react';
import { Check, X, ChevronDown, ChevronUp, FileText } from 'lucide-react';
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
import { RequestItem } from '@/pages/Requests';

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
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
  
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
  
  // Toggle row expansion
  const toggleRowExpansion = (requestId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [requestId]: !prev[requestId]
    }));
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
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <React.Fragment key={request.id}>
              <TableRow>
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-7 px-2" 
                      onClick={() => toggleRowExpansion(request.id)}
                      aria-label={expandedRows[request.id] ? "Hide details" : "Show details"}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Details
                      {expandedRows[request.id] ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge variant={request.status === 'pending' ? 'warning' : 'success'}>
                    {request.status === 'pending' ? 'Pending' : 'Fulfilled'}
                  </Badge>
                </TableCell>
                
                <TableCell className="text-right">
                  {canFulfill && (
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
                  )}
                </TableCell>
              </TableRow>
              
              {/* Expanded row for request details */}
              {expandedRows[request.id] && request.requestItems && (
                <TableRow className="bg-muted/40">
                  <TableCell 
                    colSpan={showBranch ? 6 : 5}
                    className="py-4"
                  >
                    <div className="px-4">
                      <h4 className="text-sm font-medium mb-2">Request Details</h4>
                      {request.comment && (
                        <p className="text-sm text-muted-foreground mb-4">
                          <span className="font-medium">Comment:</span> {request.comment}
                        </p>
                      )}
                      <div className="bg-background border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-1/2">Ingredient</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Note</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {request.requestItems.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>{item.ingredientName}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.note || '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RequestsTable;
