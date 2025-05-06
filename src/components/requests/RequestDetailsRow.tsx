
import React from 'react';
import { TableCell, TableRow, Table, TableHeader, TableHead, TableBody } from '@/components/ui/table';
import { RequestItem } from '@/types/requests';

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
  );
};

export default RequestDetailsRow;
