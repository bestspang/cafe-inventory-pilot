
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { StockItem } from '@/types/stock-check';
import { useAuth } from '@/context/AuthContext';
import { Check, X, Edit2 } from 'lucide-react';
import { SortableColumn, SortState } from '@/components/ui/data-table/SortableColumn';

interface StockCheckTableProps {
  items: StockItem[];
  handleQuantityChange: (id: string, quantity: number) => void;
  handleReorderPointChange?: (id: string, reorderPt: number) => void;
  handleReorderPointSave?: (id: string, reorderPt: number, originalValue: number) => void;
  updatedItems: Record<string, boolean>;
  sortState: SortState;
  onSort: (column: string) => void;
}

const StockCheckTable: React.FC<StockCheckTableProps> = ({ 
  items, 
  handleQuantityChange,
  handleReorderPointChange,
  handleReorderPointSave,
  updatedItems,
  sortState,
  onSort
}) => {
  const { user } = useAuth();
  const canEditThresholds = user?.role === 'owner' || user?.role === 'manager';
  const [editingThresholdId, setEditingThresholdId] = useState<string | null>(null);
  const [tempReorderPt, setTempReorderPt] = useState<number>(0);

  const getStockStatus = (item: StockItem) => {
    if (item.onHandQty <= item.reorderPt * 0.5) {
      return { label: 'Low', variant: 'destructive' as const };
    }
    if (item.onHandQty <= item.reorderPt) {
      return { label: 'Reorder', variant: 'warning' as const };
    }
    return { label: 'OK', variant: 'success' as const };
  };

  const startEditThreshold = (item: StockItem) => {
    setEditingThresholdId(item.id);
    setTempReorderPt(item.reorderPt);
  };

  const saveThreshold = (item: StockItem) => {
    if (handleReorderPointChange && handleReorderPointSave) {
      const originalValue = item.reorderPt;
      handleReorderPointChange(item.id, tempReorderPt);
      handleReorderPointSave(item.id, tempReorderPt, originalValue);
    }
    setEditingThresholdId(null);
  };

  const cancelEditThreshold = () => {
    setEditingThresholdId(null);
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortableColumn 
                label="Ingredient" 
                columnKey="name" 
                sortState={sortState} 
                onSort={onSort} 
              />
            </TableHead>
            <TableHead>
              <SortableColumn 
                label="Category" 
                columnKey="categoryName" 
                sortState={sortState} 
                onSort={onSort} 
              />
            </TableHead>
            <TableHead>
              <SortableColumn 
                label="Unit" 
                columnKey="unit" 
                sortState={sortState} 
                onSort={onSort} 
              />
            </TableHead>
            <TableHead>Reorder Point</TableHead>
            <TableHead>
              <SortableColumn 
                label="On-hand Qty" 
                columnKey="onHandQty" 
                sortState={sortState} 
                onSort={onSort} 
              />
            </TableHead>
            <TableHead>Last Update</TableHead>
            <TableHead>
              <SortableColumn 
                label="Status" 
                columnKey="onHandQty" 
                sortState={sortState} 
                onSort={onSort} 
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No ingredients found.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => {
              const stockStatus = getStockStatus(item);
              const isEditingThreshold = editingThresholdId === item.id;
              
              return (
                <TableRow key={item.id} className={updatedItems[item.id] ? 'bg-green-50 dark:bg-green-900/10' : ''}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.categoryName}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell className="relative">
                    {isEditingThreshold ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          min="1"
                          value={tempReorderPt}
                          onChange={(e) => setTempReorderPt(parseInt(e.target.value) || 0)}
                          className="w-16 h-8 text-sm"
                          autoFocus
                        />
                        <button 
                          onClick={() => saveThreshold(item)}
                          className="p-1 rounded-full text-green-600 hover:bg-green-100"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={cancelEditThreshold}
                          className="p-1 rounded-full text-red-600 hover:bg-red-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span>{item.reorderPt}</span>
                        {canEditThresholds && (
                          <button 
                            onClick={() => startEditThreshold(item)}
                            className="ml-2 text-gray-500 hover:text-blue-600"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={item.onHandQty}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <span
                      className={`${
                        item.lastChange > 0 ? 'text-green-600' :
                        item.lastChange < 0 ? 'text-red-600' :
                        'text-gray-500'
                      }`}
                    >
                      {item.lastChange > 0 && '+'}
                      {item.lastChange}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default StockCheckTable;
