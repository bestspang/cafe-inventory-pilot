
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Ingredient } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useCostHistory } from '@/hooks/inventory/useCostHistory';

interface CostHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredient?: Ingredient;
}

const formatCost = (cost: number | null | undefined) => {
  if (cost === null || cost === undefined) return '-';
  return `$${cost.toFixed(2)}`;
};

const CostHistoryDialog: React.FC<CostHistoryDialogProps> = ({
  open,
  onOpenChange,
  ingredient
}) => {
  const { costHistory, isLoading, fetchCostHistory } = useCostHistory();

  useEffect(() => {
    if (open && ingredient) {
      fetchCostHistory(ingredient.id);
    }
  }, [open, ingredient, fetchCostHistory]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cost History - {ingredient?.name}</DialogTitle>
          <DialogDescription>
            A record of all cost changes for this ingredient.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : costHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No cost change history available for this ingredient.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Previous Cost</TableHead>
                <TableHead>New Cost</TableHead>
                <TableHead>Changed By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {costHistory.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {format(new Date(entry.changedAt), 'yyyy-MM-dd h:mm a')}
                  </TableCell>
                  <TableCell>{formatCost(entry.previousCost)}</TableCell>
                  <TableCell>{formatCost(entry.newCost)}</TableCell>
                  <TableCell>{entry.changedByName || 'Unknown'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CostHistoryDialog;
