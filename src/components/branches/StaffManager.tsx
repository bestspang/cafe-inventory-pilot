
import { useState } from 'react';
import { X, Plus, Trash, UserCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useBranchStaff } from '@/hooks/branches/useBranchStaff';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface StaffManagerProps {
  branchId: string;
}

export default function StaffManager({ branchId }: StaffManagerProps) {
  const [newStaffName, setNewStaffName] = useState('');
  const { staff, isLoading, isAdding, addStaffMember, deleteStaffMember } = useBranchStaff(branchId);
  
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;
    
    console.log('Adding staff member:', newStaffName, 'to branch:', branchId);
    const success = await addStaffMember(newStaffName);
    
    if (success) {
      console.log('Staff member added successfully, clearing input');
      setNewStaffName('');
    } else {
      console.warn('Failed to add staff member, keeping input value');
    }
  };
  
  const handleDeleteStaff = async (staffId: string) => {
    console.log('Deleting staff member:', staffId);
    await deleteStaffMember(staffId);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div 
            key={i} 
            className="h-10 bg-muted/60 animate-pulse rounded-md"
          />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <form onSubmit={handleAddStaff} className="flex items-center gap-2">
        <Input
          placeholder="Add staff member name"
          value={newStaffName}
          onChange={(e) => setNewStaffName(e.target.value)}
          className="flex-1"
          disabled={isAdding}
        />
        <Button type="submit" disabled={!newStaffName.trim() || isAdding} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          {isAdding ? 'Adding...' : 'Add'}
        </Button>
      </form>
      
      <div className="rounded-md border">
        {staff.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
            <UserCircle className="h-8 w-8" />
            <p>No staff members added yet</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[200px]">
            <ul className="divide-y">
              {staff.map((member) => (
                <li key={member.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <UserCircle className="h-5 w-5 text-muted-foreground mr-2" />
                    <span>{member.staff_name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteStaff(member.id)}
                    disabled={isDeleting}
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
