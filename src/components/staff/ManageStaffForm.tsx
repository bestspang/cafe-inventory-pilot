
import React, { useState } from 'react';
import { useStaffManagement } from '@/hooks/staff/useStaffManagement';
import AddStaffForm from './AddStaffForm';
import StaffTable from './StaffTable';
import DeleteStaffDialog from './DeleteStaffDialog';

const ManageStaffForm: React.FC = () => {
  const {
    isLoading,
    branches,
    staffMembers,
    newStaff,
    setNewStaff,
    handleAddStaff,
    handleDeleteStaff,
    getBranchName
  } = useStaffManagement();
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAddStaff(newStaff);
  };
  
  const confirmDeleteStaff = (staffId: string) => {
    setStaffToDelete(staffId);
    setShowDeleteDialog(true);
  };
  
  const executeDeleteStaff = async () => {
    if (!staffToDelete) return;
    
    setIsDeleting(true);
    try {
      await handleDeleteStaff(staffToDelete);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setStaffToDelete(null);
    }
  };
  
  return (
    <div className="space-y-6">
      <AddStaffForm
        branches={branches}
        newStaff={newStaff}
        setNewStaff={setNewStaff}
        onSubmit={handleAddStaffSubmit}
        isLoading={isLoading}
      />
      
      <StaffTable
        staffMembers={staffMembers}
        isLoading={isLoading}
        onDelete={confirmDeleteStaff}
        getBranchName={getBranchName}
      />
      
      <DeleteStaffDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={executeDeleteStaff}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ManageStaffForm;
