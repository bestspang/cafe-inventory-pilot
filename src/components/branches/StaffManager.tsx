
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBranchStaff } from '@/hooks/branches/useBranchStaff';
import { StaffMember } from '@/types/branch';
import { toast } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody,
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

interface StaffManagerProps {
  branchId: string;
}

export default function StaffManager({ branchId }: StaffManagerProps) {
  const { 
    staff, 
    isLoading, 
    addStaffMember, 
    deleteStaffMember,
    fetchStaff 
  } = useBranchStaff(branchId);
  
  const [newStaffName, setNewStaffName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [staffBeingDeleted, setStaffBeingDeleted] = useState<string | null>(null);
  
  const handleAddStaff = async () => {
    if (!newStaffName.trim()) {
      toast.error("Staff member name cannot be empty");
      return;
    }
    
    setIsAdding(true);
    
    try {
      const success = await addStaffMember(newStaffName);
      
      if (success) {
        setNewStaffName('');
        fetchStaff();
      }
    } finally {
      setIsAdding(false);
    }
  };
  
  const handleDeleteStaff = async (staffId: string) => {
    setStaffBeingDeleted(staffId);
    
    try {
      const success = await deleteStaffMember(staffId);
      if (success) {
        fetchStaff();
      }
    } finally {
      setStaffBeingDeleted(null);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <h3 className="text-md font-semibold">Staff Members</h3>
        <Badge variant="outline" className="ml-2">
          {staff.length}
        </Badge>
      </div>
      
      <div className="flex gap-2">
        <Input
          placeholder="Add staff member"
          value={newStaffName}
          onChange={(e) => setNewStaffName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddStaff();
          }}
          disabled={isAdding}
        />
        <Button 
          onClick={handleAddStaff} 
          disabled={!newStaffName.trim() || isAdding}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
      
      {staff.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member: StaffMember) => (
              <TableRow key={member.id}>
                <TableCell>{member.staff_name}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteStaff(member.id)}
                    disabled={staffBeingDeleted === member.id}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {staffBeingDeleted === member.id ? (
                      <span className="h-4 w-4 animate-spin">...</span>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center p-4 border rounded-md text-muted-foreground bg-muted/50">
          No staff members added yet.
        </div>
      )}
    </div>
  );
}
