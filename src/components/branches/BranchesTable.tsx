
import React, { useState } from 'react';
import { Globe, Edit, Trash2, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Branch } from '@/types/branch';
import BranchDetailPanel from './BranchDetailPanel';
import BranchFormDialog from './BranchFormDialog';

interface BranchesTableProps {
  branches: Branch[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<boolean>;
  onToggleStatus: (branch: Branch) => Promise<boolean>;
}

export default function BranchesTable({ 
  branches, 
  isLoading,
  onDelete,
  onToggleStatus
}: BranchesTableProps) {
  const [expandedBranch, setExpandedBranch] = useState<string | null>(null);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Branch | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const sortedBranches = [...branches].sort((a, b) => {
    if (sortField === 'name') {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    if (sortField === 'status') {
      return sortDirection === 'asc'
        ? Number(a.is_open) - Number(b.is_open)
        : Number(b.is_open) - Number(a.is_open);
    }
    // Default to name sorting
    return a.name.localeCompare(b.name);
  });
  
  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    
    setIsDeleting(true);
    const success = await onDelete(confirmDelete.id);
    setIsDeleting(false);
    
    if (success) {
      setConfirmDelete(null);
      if (expandedBranch === confirmDelete.id) {
        setExpandedBranch(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="h-16 bg-muted/60 animate-pulse rounded-md"
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px] cursor-pointer" onClick={() => toggleSort('name')}>
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
                onClick={() => toggleSort('status')}
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
          <TableBody>
            {sortedBranches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No branches found
                </TableCell>
              </TableRow>
            ) : (
              sortedBranches.map((branch) => (
                <React.Fragment key={branch.id}>
                  <TableRow 
                    className={
                      expandedBranch === branch.id 
                        ? 'border-b-0 hover:bg-muted/80' 
                        : 'hover:bg-muted/50'
                    }
                    onClick={() => {
                      setExpandedBranch(expandedBranch === branch.id ? null : branch.id);
                    }}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <span>{branch.name}</span>
                        {expandedBranch === branch.id ? (
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
                          setEditingBranch(branch);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDelete(branch);
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
                  {expandedBranch === branch.id && (
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={5} className="p-0">
                        <BranchDetailPanel branchId={branch.id} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <BranchFormDialog
        branch={editingBranch}
        open={!!editingBranch}
        onOpenChange={(open) => {
          if (!open) setEditingBranch(null);
        }}
      />
      
      <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Branch</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {confirmDelete?.name}? This action cannot be undone
              and will delete all related data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDelete(null)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Branch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
