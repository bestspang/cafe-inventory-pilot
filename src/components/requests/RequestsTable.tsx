
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

interface RequestsTableProps {
  requests: RequestItem[];
  onToggleStatus: (id: string) => void;
  showBranch: boolean;
  sortState: SortState;
  onSort: (column: string) => void;
  onRefresh?: () => Promise<void>;
}

const RequestsTable: React.FC<RequestsTableProps> = ({ 
  requests, 
  onToggleStatus,
  showBranch,
  sortState,
  onSort,
  onRefresh
}) => {
  const { user } = useAuth();
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
  const { formatDate } = useDateFormatter();
  
  const canFulfill = ['owner', 'manager'].includes(user?.role || '');
  
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
              <RequestTableRow 
                request={request}
                showBranch={showBranch}
                canFulfill={canFulfill}
                isExpanded={!!expandedRows[request.id]}
                onToggleExpand={toggleRowExpansion}
                onToggleStatus={onToggleStatus}
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
  );
};

export default RequestsTable;
