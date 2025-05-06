
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import BranchTableHeader from './BranchTableHeader';
import BranchTableRow from './BranchTableRow';
import BranchSortingLogic from './BranchSortingLogic';
import { Table, TableBody } from '@/components/ui/table';
import { Branch } from '@/types/branch';
import DeleteBranchDialog from './DeleteBranchDialog';
import BranchFormDialog from './BranchFormDialog';

interface BranchesTableProps {
  branches: Branch[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<boolean>;
  onToggleStatus: (branch: Branch) => Promise<boolean>;
  onSave: () => Promise<void>;
}

export default function BranchesTable({ 
  branches, 
  isLoading,
  onDelete,
  onToggleStatus,
  onSave
}: BranchesTableProps) {
  const [expandedBranch, setExpandedBranch] = useState<string | null>(null);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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
  
  // Use the branch sorting logic component to sort branches
  const sortedBranches = BranchSortingLogic(branches, sortField, sortDirection);
  
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

  // Open edit dialog and set the branch to edit
  const handleOpenEditDialog = (branch: Branch) => {
    setEditingBranch(branch);
    setIsEditDialogOpen(true);
  };

  // Handle closing the edit dialog
  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    // Use a timeout to delay clearing the editing branch
    // This ensures the dialog fully animates out before removing the data
    setTimeout(() => {
      setEditingBranch(null);
    }, 300); // Match this with the dialog's animation duration
  };

  // Handle successful branch edit
  const handleSuccessfulEdit = async () => {
    await onSave();
    handleCloseEditDialog();
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
                  onEdit={handleOpenEditDialog}
                  onDelete={(branch) => setConfirmDelete(branch)}
                  onToggleStatus={onToggleStatus}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Branch Dialog */}
      <BranchFormDialog
        branch={editingBranch}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSuccessfulEdit}
      />
      
      {/* Delete Branch Dialog */}
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
