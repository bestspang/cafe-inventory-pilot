
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useBranchStaff } from '@/hooks/branches/useBranchStaff';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

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
  const [isDeleting, setIsDeleting] = useState(false);
  
  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault();
    if (!newStaffName.trim()) {
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
  }
  
  async function handleDeleteStaff() {
    if (!staffBeingDeleted) return;
    setIsDeleting(true);
    
    try {
      const success = await deleteStaffMember(staffBeingDeleted);
      if (success) {
        fetchStaff();
      }
    } finally {
      setStaffBeingDeleted(null);
      setIsDeleting(false);
    }
  }
  
  return (
    <div className="space-y-4">
      <form onSubmit={handleAddStaff} className="flex gap-2">
        <Input
          placeholder="Add staff member..."
          value={newStaffName}
          onChange={(e) => setNewStaffName(e.target.value)}
          className="flex-1"
        />
        <Button 
          type="submit" 
          disabled={isAdding || !newStaffName.trim()}
        >
          {isAdding ? 'Adding...' : 'Add Staff'}
        </Button>
      </form>
      
      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">
          Loading staff...
        </div>
      ) : staff.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          No staff members found for this branch.
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.staff_name}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setStaffBeingDeleted(member.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <AlertDialog 
        open={!!staffBeingDeleted} 
        onOpenChange={(open) => !open && setStaffBeingDeleted(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove this staff
              member from this branch.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteStaff}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
