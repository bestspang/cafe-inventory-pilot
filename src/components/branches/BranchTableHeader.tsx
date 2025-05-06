
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface BranchTableHeaderProps {
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export default function BranchTableHeader({ 
  sortField, 
  sortDirection, 
  onSort 
}: BranchTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[300px] cursor-pointer" onClick={() => onSort('name')}>
          <div className="flex items-center">
            Name
            {sortField === 'name' && (
              sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
            )}
          </div>
        </TableHead>
        <TableHead className="min-w-[150px]">Address</TableHead>
        <TableHead className="min-w-[120px]">Timezone</TableHead>
        <TableHead 
          className="w-[100px] cursor-pointer"
          onClick={() => onSort('status')}
        >
          <div className="flex items-center">
            Status
            {sortField === 'status' && (
              sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
            )}
          </div>
        </TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
