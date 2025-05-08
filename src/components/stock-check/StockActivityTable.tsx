
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
import type { StockActivity } from '@/hooks/stock-check/types';

interface StockActivityTableProps {
  activities: StockActivity[];
  onActivityDelete: (id: string) => Promise<boolean>;
}

const StockActivityTable: React.FC<StockActivityTableProps> = ({ 
  activities,
  onActivityDelete
}) => {
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
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6">
                No activity recorded yet.
              </TableCell>
            </TableRow>
          ) : (
            activities.map(activity => (
              <StockActivityRow 
                key={activity.id} 
                activity={activity} 
                onDelete={onActivityDelete}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default StockActivityTable;
