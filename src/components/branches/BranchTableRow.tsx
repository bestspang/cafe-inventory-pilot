
import React from 'react';
import { Edit, Trash2, CheckCircle2, XCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Branch } from '@/types/branch';
import BranchDetailPanel from './BranchDetailPanel';

interface BranchTableRowProps {
  branch: Branch;
  expandedBranch: string | null;
  setExpandedBranch: (id: string | null) => void;
  onEdit: (branch: Branch) => void;
  onDelete: (branch: Branch) => void;
  onToggleStatus: (branch: Branch) => Promise<boolean>;
}

export default function BranchTableRow({
  branch,
  expandedBranch,
  setExpandedBranch,
  onEdit,
  onDelete,
  onToggleStatus
}: BranchTableRowProps) {
  const isExpanded = expandedBranch === branch.id;
  
  const toggleExpand = () => {
    setExpandedBranch(isExpanded ? null : branch.id);
  };
  
  return (
    <React.Fragment>
      <TableRow 
        className={
          isExpanded 
            ? 'border-b-0 hover:bg-muted/80' 
            : 'hover:bg-muted/50'
        }
        onClick={toggleExpand}
      >
        <TableCell className="font-medium">
          <div className="flex items-center">
            <span>{branch.name}</span>
            {isExpanded ? (
              <ChevronUp className="ml-2 h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </TableCell>
        <TableCell>{branch.address || '—'}</TableCell>
        <TableCell>
          <div className="flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-muted-foreground" />
            {branch.timezone || 'UTC'}
          </div>
        </TableCell>
        <TableCell>
          {branch.is_open ? (
            <Badge variant="success" className="bg-green-600">Open</Badge>
          ) : (
            <Badge variant="destructive">Closed</Badge>
          )}
        </TableCell>
        <TableCell className="text-right space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(branch);
            }}
          >
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(branch);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
          <Button
            variant={branch.is_open ? "destructive" : "success"}
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus(branch);
            }}
          >
            {branch.is_open ? (
              <XCircle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
          </Button>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow className="bg-muted/30">
          <TableCell colSpan={5} className="p-0">
            <BranchDetailPanel branchId={branch.id} />
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
}

// Need to import Globe which was missing
import { Globe } from 'lucide-react';
