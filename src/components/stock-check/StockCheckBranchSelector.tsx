
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface Branch {
  id: string;
  name: string;
}

interface StockCheckBranchSelectorProps {
  selectedBranch: string;
  setSelectedBranch: (branchId: string) => void;
}

const StockCheckBranchSelector: React.FC<StockCheckBranchSelectorProps> = ({
  selectedBranch,
  setSelectedBranch
}) => {
  const { user } = useAuth();
  
  // Mock branch data - this would normally come from a database
  const mockBranches = [
    { id: '1', name: 'Downtown Cafe' },
    { id: '2', name: 'Uptown Juice Bar' },
    { id: '3', name: 'Riverside Cafe' },
    { id: '4', name: 'Airport Kiosk' },
  ];

  // Get available branches based on user role
  const availableBranches = user?.role === 'owner' 
    ? mockBranches 
    : mockBranches.filter(branch => branch.id === user?.branchId);

  return (
    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
      <SelectTrigger className="w-full md:w-[200px]">
        <SelectValue placeholder="Select branch" />
      </SelectTrigger>
      <SelectContent>
        {availableBranches.map(branch => (
          <SelectItem key={branch.id} value={branch.id}>
            {branch.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default StockCheckBranchSelector;
