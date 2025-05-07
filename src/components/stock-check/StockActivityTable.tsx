
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import StockActivityRow from './StockActivityRow';
import type { StockActivity } from '@/hooks/stock-check/useStockActivity';

interface StockActivityTableProps {
  activities: StockActivity[];
}

const StockActivityTable: React.FC<StockActivityTableProps> = ({ activities }) => {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Store</TableHead>
            <TableHead>Staff</TableHead>
            <TableHead>Ingredient</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6">
                No activity recorded yet.
              </TableCell>
            </TableRow>
          ) : (
            activities.map(activity => (
              <StockActivityRow key={activity.id} activity={activity} />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default StockActivityTable;
