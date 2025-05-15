
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Branch } from '@/types';

interface AddStaffFormProps {
  branches: Branch[];
  newStaff: {
    staff_name: string;
    branch_id: string;
  };
  setNewStaff: (staff: {
    staff_name: string;
    branch_id: string;
  }) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const AddStaffForm: React.FC<AddStaffFormProps> = ({
  branches,
  newStaff,
  setNewStaff,
  onSubmit,
  isLoading
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div>
          <Label htmlFor="branch">Store</Label>
          <Select
            value={newStaff.branch_id}
            onValueChange={(value) => setNewStaff({
              ...newStaff,
              branch_id: value
            })}
            disabled={isLoading}
          >
            <SelectTrigger id="branch">
              <SelectValue placeholder="Select store" />
            </SelectTrigger>
            <SelectContent>
              {branches.map(branch => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="staffName">Staff Name</Label>
          <Input
            id="staffName"
            placeholder="Enter staff name"
            value={newStaff.staff_name}
            onChange={(e) => setNewStaff({
              ...newStaff,
              staff_name: e.target.value
            })}
            disabled={isLoading}
          />
        </div>
        
        <div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            <Plus className="h-4 w-4 mr-2" />
            Add Staff
          </Button>
        </div>
      </div>
    </form>
  );
};

export default AddStaffForm;
