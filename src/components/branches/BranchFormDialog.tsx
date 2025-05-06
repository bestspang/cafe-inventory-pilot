
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useBranchManager } from '@/hooks/branches/useBranchManager';
import { Branch } from '@/types/branch';
import BranchForm from './BranchForm';
import { BranchFormValues } from '@/lib/schemas/branch-schema';
import { useEffect } from 'react';
import { useBranchesData } from '@/hooks/branches/useBranchesData';

interface BranchFormDialogProps {
  branch: Branch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BranchFormDialog({ 
  branch,
  open,
  onOpenChange
}: BranchFormDialogProps) {
  const isEditing = !!branch;
  const { createBranch, updateBranch, isLoading } = useBranchManager();
  const { refetch } = useBranchesData(); // Get refetch method to update branch list
  
  useEffect(() => {
    // Debug logging to track props
    if (open) {
      console.log('BranchFormDialog opened with branch:', branch);
    }
  }, [open, branch]);
  
  async function onSubmit(data: BranchFormValues) {
    console.group('Branch form submitted');
    console.log('Form values:', data);
    console.log('Is editing:', isEditing);
    console.log('Branch ID:', branch?.id);
    
    let success = false;
    
    try {
      if (isEditing && branch) {
        console.log(`Attempting to update branch ${branch.id} with name: ${data.name}`);
        success = await updateBranch({
          id: branch.id,
          name: data.name,
          address: data.address,
          timezone: data.timezone
        });
        console.log('Update result:', success ? 'Success' : 'Failed');
      } else {
        console.log('Attempting to create new branch');
        const newBranch = await createBranch(data);
        success = !!newBranch;
        console.log('Create result:', success ? 'Success' : 'Failed');
      }
      
      if (success) {
        console.log('Operation successful, closing dialog and refreshing data');
        await refetch(); // Ensure we refresh the branch list
        onOpenChange(false);
      } else {
        console.log('Operation failed, keeping dialog open');
      }
    } catch (error) {
      console.error('Error in form submit handler:', error);
    } finally {
      console.groupEnd();
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      console.log(`Dialog ${isOpen ? 'opening' : 'closing'}`);
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Branch' : 'Add New Branch'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the details for this branch.' 
              : 'Add a new branch to your café chain.'}
          </DialogDescription>
        </DialogHeader>
        
        <BranchForm 
          branch={branch} 
          isLoading={isLoading}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
