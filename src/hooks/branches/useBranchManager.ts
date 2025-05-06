
import { useState } from 'react';
import { useBranchCreate } from './operations/useBranchCreate';
import { useBranchUpdate } from './operations/useBranchUpdate';
import { useBranchDelete } from './operations/useBranchDelete';
import { useBranchStatusToggle } from './operations/useBranchStatusToggle';
import { Branch } from '@/types/branch';

/**
 * Combined hook that provides all branch management operations
 * Acts as a facade over the individual operation hooks
 */
export const useBranchManager = () => {
  // Track combined loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Individual operation hooks
  const { createBranch: _createBranch, isLoading: isCreating } = useBranchCreate();
  const { updateBranch: _updateBranch, isLoading: isUpdating } = useBranchUpdate();
  const { deleteBranch: _deleteBranch, isLoading: isDeleting } = useBranchDelete();
  const { toggleBranchStatus: _toggleStatus, isLoading: isToggling } = useBranchStatusToggle();

  // Set combined loading state whenever any operation starts/ends
  useState(() => {
    setIsLoading(isCreating || isUpdating || isDeleting || isToggling);
  });

  // Wrapper functions that pass through to the individual hook implementations
  const createBranch = async (branch: Partial<Branch>) => {
    return await _createBranch(branch);
  };

  const updateBranch = async (branch: Partial<Branch>, refreshFn?: () => Promise<void>) => {
    return await _updateBranch(branch, refreshFn);
  };

  const deleteBranch = async (branchId: string) => {
    return await _deleteBranch(branchId);
  };

  const toggleBranchStatus = async (branch: Branch) => {
    return await _toggleStatus(branch);
  };

  return {
    isLoading: isCreating || isUpdating || isDeleting || isToggling,
    createBranch,
    updateBranch,
    deleteBranch,
    toggleBranchStatus
  };
};
