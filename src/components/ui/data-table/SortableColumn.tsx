
import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  column: string | null;
  direction: SortDirection;
}

interface SortableColumnProps {
  label: string;
  columnKey: string;
  sortState: SortState;
  onSort: (column: string) => void;
  className?: string;
}

export const SortableColumn: React.FC<SortableColumnProps> = ({
  label,
  columnKey,
  sortState,
  onSort,
  className,
}) => {
  const isSorted = sortState.column === columnKey;
  
  return (
    <button
      onClick={() => onSort(columnKey)}
      className={cn(
        "group flex items-center gap-1 focus:outline-none cursor-pointer",
        className
      )}
      aria-sort={
        !isSorted 
          ? 'none' 
          : sortState.direction === 'asc' 
            ? 'ascending' 
            : 'descending'
      }
    >
      <span>{label}</span>
      <span className="flex flex-col ml-1">
        {isSorted && sortState.direction === 'asc' ? (
          <ChevronUp className="h-3 w-3 text-primary" />
        ) : isSorted && sortState.direction === 'desc' ? (
          <ChevronDown className="h-3 w-3 text-primary" />
        ) : (
          <span className="h-3 w-3 flex flex-col opacity-0 group-hover:opacity-50">
            <ChevronUp className="h-2 w-2" />
            <ChevronDown className="h-2 w-2" />
          </span>
        )}
      </span>
    </button>
  );
};
