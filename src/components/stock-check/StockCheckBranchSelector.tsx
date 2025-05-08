
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Branch } from '@/types/branch';

interface StockCheckBranchSelectorProps {
  selectedBranch: string;
  setSelectedBranch: (branchId: string) => void;
  branches: Branch[];
  isLoading: boolean;
}

const StockCheckBranchSelector: React.FC<StockCheckBranchSelectorProps> = ({
  selectedBranch,
  setSelectedBranch,
  branches,
  isLoading
}) => {
  return (
    <Select value={selectedBranch} onValueChange={setSelectedBranch} disabled={isLoading}>
      <SelectTrigger className="w-full md:w-[200px]">
        <SelectValue placeholder={isLoading ? "Loading branches..." : "Select branch"} />
      </SelectTrigger>
      <SelectContent>
        {branches.map(branch => (
          <SelectItem key={branch.id} value={branch.id}>
            {branch.name}
          </SelectItem>
        ))}
        {branches.length === 0 && !isLoading && (
          <SelectItem value="none" disabled>No branches available</SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};

export default StockCheckBranchSelector;
