
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { useBranchManager } from '@/hooks/branches/useBranchManager';
import { Branch } from '@/types/branch';
import BranchForm from './BranchForm';
import { BranchFormValues } from '@/lib/schemas/branch-schema';
import { useEffect, useState } from 'react';
import { useBranchesData } from '@/hooks/branches/useBranchesData';
import { useAuth } from '@/context/AuthContext';
import { useBranchCreate } from '@/hooks/branches/operations/useBranchCreate';
import { toast } from '@/components/ui/sonner';

interface BranchFormDialogProps {
  branch: Branch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => Promise<void>;
}

export default function BranchFormDialog({ 
  branch,
  open,
  onOpenChange,
  onSave
}: BranchFormDialogProps) {
  const isEditing = !!branch;
  const { updateBranch, isLoading: isUpdateLoading } = useBranchManager();
  const { createBranch, isLoading: isCreateLoading } = useBranchCreate();
  const { refetch } = useBranchesData();
  const { user } = useAuth();
  
  // Track internal submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset submission state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
    }
  }, [open]);
  
  async function onSubmit(data: BranchFormValues): Promise<void> {
    console.group('[BranchFormDialog] onSubmit triggered');
    console.log('[BranchFormDialog] Form values:', data);
    console.log('[BranchFormDialog] Is editing branch?', isEditing);
    console.log('[BranchFormDialog] Current user:', user?.id);
    
    try {
      // Set submitting state to prevent multiple submissions
      setIsSubmitting(true);
      let success = false;
      
      if (isEditing && branch) {
        console.log(`[BranchFormDialog] Updating branch ${branch.id} with name: ${data.name}`);
        success = await updateBranch({
          id: branch.id,
          name: data.name,
          address: data.address,
          timezone: data.timezone
        });
      } else if (user) {
        console.log('[BranchFormDialog] Creating new branch with user ID:', user.id);
        
        // Use createBranch from useBranchCreate hook
        const newBranch = await createBranch({
          name: data.name,
          address: data.address,
          timezone: data.timezone,
          owner_id: user.id // Explicitly include owner_id for new branches
        });
        
        success = !!newBranch;
        console.log('[BranchFormDialog] Branch creation result:', newBranch);
        
        if (!newBranch) {
          toast.error("Failed to create branch - please check console for details");
        }
      }
      
      if (success) {
        console.log('[BranchFormDialog] Operation successful, closing dialog and refreshing data');
        
        // If onSave prop is provided, call it
        if (onSave) {
          await onSave();
        } else {
          // If no onSave provided, explicitly refetch
          await refetch();
        }
        
        // Explicitly close the dialog and reset state
        onOpenChange(false);
      } else {
        console.log('[BranchFormDialog] Operation reported as failed, keeping dialog open');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('[BranchFormDialog] Error in onSubmit handler:', error);
      setIsSubmitting(false);
    } finally {
      console.groupEnd(); // End [BranchFormDialog] onSubmit triggered
    }
  }

  const isLoading = isUpdateLoading || isCreateLoading || isSubmitting;

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        // Only allow closing if not in middle of submission
        if (isSubmitting && !isOpen) {
          return;
        }
        
        console.log(`[BranchFormDialog] Dialog onOpenChange called. New state: ${isOpen ? 'opening' : 'closing'}`);
        onOpenChange(isOpen);
      }}
      modal={true}
    >
      <DialogContent 
        className="sm:max-w-[500px]"
        onInteractOutside={(e) => {
          // Prevent interaction outside during loading or submission
          if (isLoading) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevent escape key closing during loading or submission
          if (isLoading) {
            e.preventDefault();
          }
        }}
      >
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
            // Only allow cancel if not submitting
            if (!isSubmitting) {
              console.log('[BranchFormDialog] Cancel button clicked, closing dialog');
              onOpenChange(false);
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
