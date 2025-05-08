
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
import { Loader2 } from 'lucide-react';

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
          name="action"
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
        <Label htmlFor="branch">Branch <span className="text-destructive">*</span></Label>
        <Select
          name="branch"
          value={branchId}
          onValueChange={onBranchChange}
          disabled={isLoading}
          required
        >
          <SelectTrigger id="branch" className={isLoading ? "opacity-70" : ""}>
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <SelectValue placeholder="Select branch" />
            )}
          </SelectTrigger>
          <SelectContent>
            {branches.length === 0 ? (
              <SelectItem value="loading" disabled>
                {isLoading ? "Loading branches..." : "No branches available"}
              </SelectItem>
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
        <Label htmlFor="user_id">Staff Name <span className="text-destructive">*</span></Label>
        <Select
          name="user_id"
          value={staffId}
          onValueChange={onStaffChange}
          disabled={isLoading || !branchId}
          required
        >
          <SelectTrigger id="user_id" className={isLoading && branchId ? "opacity-70" : ""}>
            {isLoading && branchId ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span>Loading staff...</span>
              </div>
            ) : (
              <SelectValue placeholder={
                !branchId 
                  ? "Select branch first" 
                  : staffMembers.length === 0 
                    ? "No staff members found" 
                    : "Select staff member"
              } />
            )}
          </SelectTrigger>
          <SelectContent>
            {!branchId ? (
              <SelectItem value="select-branch" disabled>Select branch first</SelectItem>
            ) : staffMembers.length === 0 ? (
              <SelectItem value="no-staff" disabled>
                {isLoading ? "Loading staff members..." : "No staff members found"}
              </SelectItem>
            ) : (
              staffMembers.map(staff => (
                <SelectItem key={staff.id} value={staff.id}>
                  {staff.staffName}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default QuickRequestHeader;
