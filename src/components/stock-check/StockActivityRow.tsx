
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TableRow, TableCell } from '@/components/ui/table';
import { useDateFormatter } from '@/hooks/requests/useDateFormatter';
import type { StockActivity } from '@/hooks/stock-check/useStockActivity';

interface StockActivityRowProps {
  activity: StockActivity;
}

const StockActivityRow: React.FC<StockActivityRowProps> = ({ activity }) => {
  const { formatDate } = useDateFormatter();
  
  return (
    <TableRow key={activity.id}>
      <TableCell className="whitespace-nowrap">
        {formatDate(activity.checkedAt)}
      </TableCell>
      <TableCell>{activity.branchName}</TableCell>
      <TableCell>
        {activity.staffName}
        {activity.source === 'fulfilled-request' && activity.requestedBy && (
          <div className="text-xs text-muted-foreground">
            Requested by: {activity.requestedBy}
          </div>
        )}
      </TableCell>
      <TableCell>{activity.ingredient}</TableCell>
      <TableCell>
        <Badge variant={activity.source === 'fulfilled-request' ? 'success' : 'outline'}>
          {activity.quantity} {activity.unit}
        </Badge>
      </TableCell>
      <TableCell>
        {activity.source === 'fulfilled-request' ? (
          <Badge variant="secondary">Fulfilled Request</Badge>
        ) : (
          activity.comment || 'Stock Check'
        )}
      </TableCell>
    </TableRow>
  );
};

export default StockActivityRow;
