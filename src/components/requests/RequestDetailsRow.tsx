
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { RequestItem } from '@/types/requests';
import { useRequestDetails } from '@/hooks/requests/useRequestDetails';
import RequestItemsTable from './RequestItemsTable';

interface RequestDetailsRowProps {
  request: RequestItem;
  showBranch: boolean;
  isExpanded: boolean;
  onRefresh?: () => Promise<void>;
}

const RequestDetailsRow: React.FC<RequestDetailsRowProps> = ({ 
  request, 
  showBranch, 
  isExpanded,
  onRefresh 
}) => {
  const {
    detailedItems,
    isLoading,
    handleQuantityChange,
    handleToggleFulfilled,
    handleSaveFulfillment,
    allItemsChecked
  } = useRequestDetails(
    request.id,
    request.branchId,
    isExpanded,
    onRefresh
  );

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
          <RequestItemsTable 
            items={detailedItems}
            isLoading={isLoading}
            onQuantityChange={handleQuantityChange}
            onToggleFulfilled={handleToggleFulfilled}
            onSaveFulfillment={handleSaveFulfillment}
            allChecked={allItemsChecked}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default RequestDetailsRow;
