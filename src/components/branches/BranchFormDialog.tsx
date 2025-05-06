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
  const { refetch } = useBranchesData();
  
  useEffect(() => {
    // Debug logging to track props and state
    if (open) {
      console.group('[BranchFormDialog] Dialog opened/props changed');
      console.log('[BranchFormDialog] Is editing:', isEditing);
      console.log('[BranchFormDialog] Branch data prop:', branch);
      console.groupEnd();
    }
  }, [open, branch, isEditing]);
  
  async function onSubmit(data: BranchFormValues) {
    console.group('[BranchFormDialog] onSubmit triggered');
    console.log('[BranchFormDialog] Form values (data):', data);
    console.log('[BranchFormDialog] Current isEditing state:', isEditing);
    console.log('[BranchFormDialog] Current branch state (for ID):', branch);
    
    let success = false;
    
    try {
      if (isEditing && branch) {
        console.log(`[BranchFormDialog] Attempting to update branch ${branch.id} with name: ${data.name}`);
        success = await updateBranch({
          id: branch.id,
          name: data.name,
          address: data.address,
          timezone: data.timezone
        }, refetch);
      } else {
        console.log('[BranchFormDialog] Attempting to create new branch');
        const newBranch = await createBranch(data);
        success = !!newBranch;
      }
      
      if (success) {
        console.log('[BranchFormDialog] Operation successful, closing dialog and refreshing data');
        await refetch();
        onOpenChange(false);
      } else {
        console.log('[BranchFormDialog] Operation reported as failed, keeping dialog open');
      }
    } catch (error) {
      console.error('[BranchFormDialog] Error in onSubmit handler:', error);
    } finally {
      console.groupEnd(); // End [BranchFormDialog] onSubmit triggered
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      console.log(`[BranchFormDialog] Dialog onOpenChange called. New state: ${isOpen ? 'opening' : 'closing'}`);
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
          onCancel={() => {
            console.log('[BranchFormDialog] Cancel button clicked, closing dialog');
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
