
import React from 'react';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Branch } from '@/types';
import { StaffMember } from '@/types/quick-request';

interface QuickRequestHeaderProps {
  formAction: 'request' | 'stock-update';
  branchId: string;
  staffId: string;
  branches: Branch[];
  staffMembers: StaffMember[];
  isLoading: boolean;
  onActionChange: (value: 'request' | 'stock-update') => void;
  onBranchChange: (value: string) => void;
  onStaffChange: (value: string) => void;
}

const QuickRequestHeader: React.FC<QuickRequestHeaderProps> = ({
  formAction,
  branchId,
  staffId,
  branches,
  staffMembers,
  isLoading,
  onActionChange,
  onBranchChange,
  onStaffChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="action">Action</Label>
        <Select
          value={formAction}
          onValueChange={(value: 'request' | 'stock-update') => onActionChange(value)}
          disabled={isLoading}
        >
          <SelectTrigger id="action">
            <SelectValue placeholder="Select action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="request">Request Ingredient</SelectItem>
            <SelectItem value="stock-update">Stock Update</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="branch">Store</Label>
        <Select
          value={branchId}
          onValueChange={onBranchChange}
          disabled={isLoading}
        >
          <SelectTrigger id="branch">
            <SelectValue placeholder={isLoading ? "Loading stores..." : "Select store"} />
          </SelectTrigger>
          <SelectContent>
            {branches.length === 0 ? (
              <SelectItem value="loading" disabled>No stores available</SelectItem>
            ) : (
              branches.map(branch => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="staff">Staff Name</Label>
        <Select
          value={staffId}
          onValueChange={onStaffChange}
          disabled={isLoading || !branchId || staffMembers.length === 0}
        >
          <SelectTrigger id="staff">
            <SelectValue placeholder={
              !branchId 
                ? "Select store first" 
                : staffMembers.length === 0 
                  ? "No staff members found" 
                  : "Select staff member"
            } />
          </SelectTrigger>
          <SelectContent>
            {staffMembers.map(staff => (
              <SelectItem key={staff.id} value={staff.id}>
                {staff.staffName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default QuickRequestHeader;
