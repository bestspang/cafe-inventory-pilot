
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TableRow, TableCell } from '@/components/ui/table';
import { useDateFormatter } from '@/hooks/requests/useDateFormatter';
import { Trash2 } from 'lucide-react';
import type { StockActivity } from '@/hooks/stock-check/types';
import { toast } from '@/hooks/use-toast';

interface StockActivityRowProps {
  activity: StockActivity;
  onDelete: (id: string) => Promise<boolean>;
}

const StockActivityRow: React.FC<StockActivityRowProps> = ({ activity, onDelete }) => {
  const { formatDate } = useDateFormatter();
  
  const handleDelete = async () => {
    try {
      const success = await onDelete(activity.id);
      
      if (success) {
        toast({
          title: "Activity deleted",
          description: "The activity record has been removed successfully",
        });
      } else {
        throw new Error("Failed to delete activity");
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting the activity",
        variant: "destructive",
      });
    }
  };

  // Determine the change indicator
  const renderQuantityChange = () => {
    if (activity.quantityChange === undefined || activity.quantityChange === null || activity.quantityChange === 0) {
      return <span className="text-muted-foreground">0</span>;
    }
    
    const isPositive = activity.quantityChange > 0;
    return (
      <span className={isPositive ? "text-green-600" : "text-red-600"}>
        {isPositive ? '+' : ''}{activity.quantityChange}
      </span>
    );
  };
  
  return (
    <TableRow>
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
        {renderQuantityChange()}
      </TableCell>
      <TableCell>
        {activity.source === 'fulfilled-request' ? (
          <Badge variant="secondary">Fulfilled Request</Badge>
        ) : (
          activity.comment || 'Stock Check'
        )}
      </TableCell>
      <TableCell className="text-right">
        <button
          onClick={handleDelete}
          className="text-destructive hover:text-destructive/80 transition-colors"
          aria-label="Delete activity"
        >
          <Trash2 size={16} />
        </button>
      </TableCell>
    </TableRow>
  );
};

export default StockActivityRow;
