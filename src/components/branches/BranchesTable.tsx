
import React, { useState } from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { Branch } from '@/types/branch';
import BranchTableHeader from './BranchTableHeader';
import BranchTableRow from './BranchTableRow';
import DeleteBranchDialog from './DeleteBranchDialog';
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
          <BranchTableHeader 
            sortField={sortField} 
            sortDirection={sortDirection} 
            onSort={toggleSort} 
          />
          <TableBody>
            {sortedBranches.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground">
                  No branches found
                </td>
              </tr>
            ) : (
              sortedBranches.map((branch) => (
                <BranchTableRow
                  key={branch.id}
                  branch={branch}
                  expandedBranch={expandedBranch}
                  setExpandedBranch={setExpandedBranch}
                  onEdit={(branch) => setEditingBranch(branch)}
                  onDelete={(branch) => setConfirmDelete(branch)}
                  onToggleStatus={onToggleStatus}
                />
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
      
      <DeleteBranchDialog
        branch={confirmDelete}
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
}
