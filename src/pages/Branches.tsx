
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Building2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BranchesTable from '@/components/branches/BranchesTable';
import BranchFormDialog from '@/components/branches/BranchFormDialog';
import { useBranchesData } from '@/hooks/branches/useBranchesData';
import { useBranchManager } from '@/hooks/branches/useBranchManager';
import { Skeleton } from '@/components/ui/skeleton';
import { FormattedMessage } from 'react-intl';
import { useStores } from '@/context/StoresContext';  // Import useStores

export default function Branches() {
  const { user } = useAuth();
  const { branches, isLoading: isLoadingBranches, refetch } = useBranchesData();
  const { deleteBranch, toggleBranchStatus } = useBranchManager();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { refreshStores } = useStores();  // Add this to refresh the stores context
  
  // Only owners and managers can access this page
  if (user && user.role !== 'owner' && user.role !== 'manager') {
    return <Navigate to="/dashboard" replace />;
  }

  // Debug logs
  console.log('Branches - Current user:', user);
  console.log('Branches - Available branches:', branches);

  const handleAddBranch = () => {
    setIsAddDialogOpen(true);
  };

  const handleBranchAdded = async () => {
    await refetch();
    await refreshStores();  // Also refresh the stores in context
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <FormattedMessage id="branches.title" defaultMessage="Branches" />
          </h1>
          <p className="text-muted-foreground">
            <FormattedMessage id="branches.subtitle" defaultMessage="Manage your café & juice bar locations" />
          </p>
        </div>
        <Button onClick={handleAddBranch}>
          <Plus className="mr-2 h-4 w-4" /> 
          <FormattedMessage id="branches.add" defaultMessage="Add Branch" />
        </Button>
      </div>
      
      {isLoadingBranches ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : branches.length === 0 ? (
        <div className="bg-card border shadow rounded-lg p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Building2 className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">
            <FormattedMessage id="branches.none.found" defaultMessage="No branches found" />
          </h2>
          <p className="text-muted-foreground max-w-sm">
            <FormattedMessage 
              id="branches.none.found.description" 
              defaultMessage="Add your first branch to get started with managing your café inventory system."
            />
          </p>
          <Button onClick={handleAddBranch}>
            <Plus className="mr-2 h-4 w-4" /> 
            <FormattedMessage id="branches.add" defaultMessage="Add Branch" />
          </Button>
        </div>
      ) : (
        <BranchesTable
          branches={branches}
          isLoading={isLoadingBranches}
          onDelete={async (branchId) => {
            const branch = branches.find(b => b.id === branchId);
            if (!branch) return false;
            
            const success = await deleteBranch(branchId, branch.name);
            if (success) {
              await refetch();
              await refreshStores();  // Also refresh the stores in context
            }
            return success;
          }}
          onToggleStatus={async (branch) => {
            const success = await toggleBranchStatus(branch);
            if (success) {
              await refetch();
              await refreshStores();  // Also refresh the stores in context
            }
            return success;
          }}
          onSave={async () => {
            await refetch();
            await refreshStores();  // Also refresh the stores in context
          }}
        />
      )}
      
      <BranchFormDialog
        branch={null}
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleBranchAdded}
      />
    </div>
  );
}
