
import { Branch } from '@/types/branch';

/**
 * A utility function to sort branches based on given field and direction
 */
export default function BranchSortingLogic(
  branches: Branch[],
  sortField: string,
  sortDirection: 'asc' | 'desc'
): Branch[] {
  return [...branches].sort((a, b) => {
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
}
