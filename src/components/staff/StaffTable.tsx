
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { StaffMember } from '@/types/branch';

interface StaffTableProps {
  staffMembers: StaffMember[];
  isLoading: boolean;
  onDelete: (staffId: string) => void;
  getBranchName: (branchId: string) => string;
}

const StaffTable: React.FC<StaffTableProps> = ({
  staffMembers,
  isLoading,
  onDelete,
  getBranchName
}) => {
  if (isLoading) {
    return (
      <div className="border rounded-md">
        <div className="p-8 text-center text-muted-foreground">
          Loading staff members...
        </div>
      </div>
    );
  }

  if (staffMembers.length === 0) {
    return (
      <div className="border rounded-md">
        <div className="p-8 text-center text-muted-foreground">
          No staff members found. Add your first staff member above.
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Store</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staffMembers.map(staff => (
            <TableRow key={staff.id}>
              <TableCell className="font-medium">{staff.staffName}</TableCell>
              <TableCell>{staff.branchName || getBranchName(staff.branchId)}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(staff.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StaffTable;
