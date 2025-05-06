
import React from 'react';
import { Check, X, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { RequestItem } from '@/types/requests';

interface RequestTableRowProps {
  request: RequestItem;
  showBranch: boolean;
  canFulfill: boolean;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onToggleStatus: (id: string) => void;
  formatDate: (dateString: string) => string;
}

const RequestTableRow: React.FC<RequestTableRowProps> = ({
  request,
  showBranch,
  canFulfill,
  isExpanded,
  onToggleExpand,
  onToggleStatus,
  formatDate,
}) => {
  return (
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
            onClick={() => onToggleExpand(request.id)}
            aria-label={isExpanded ? "Hide details" : "Show details"}
          >
            <FileText className="h-4 w-4 mr-1" />
            Details
            {isExpanded ? (
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
  );
};

export default RequestTableRow;
