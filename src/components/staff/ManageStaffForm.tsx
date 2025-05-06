
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Trash2, Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { StaffMember } from '@/types/quick-request';
import { Branch } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ManageStaffForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
  
  const [newStaff, setNewStaff] = useState({
    branchId: '',
    staffName: ''
  });
  
  // Fetch branches on component mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const { data, error } = await supabase
          .from('branches')
          .select('id, name');
        
        if (error) throw error;
        
        if (data) {
          setBranches(data);
          if (data.length > 0) {
            setNewStaff(prev => ({ ...prev, branchId: data[0].id }));
          }
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch store locations',
          variant: 'destructive'
        });
      }
    };
    
    fetchBranches();
  }, []);
  
  // Fetch all staff members
  const fetchAllStaff = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('store_staff')
        .select('id, branch_id, staff_name, created_at, branches(name)')
        .order('staff_name', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        const formattedStaff = data.map(item => ({
          id: item.id,
          branchId: item.branch_id,
          staffName: item.staff_name,
          createdAt: item.created_at,
          branchName: item.branches?.name
        }));
        setStaffMembers(formattedStaff);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch staff members',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAllStaff();
  }, []);
  
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStaff.branchId || !newStaff.staffName.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both branch and staff name',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('store_staff')
        .insert({
          branch_id: newStaff.branchId,
          staff_name: newStaff.staffName.trim()
        });
      
      if (error) throw error;
      
      toast({
        title: 'Staff Added',
        description: `${newStaff.staffName} has been added successfully`
      });
      
      setNewStaff({
        branchId: newStaff.branchId,
        staffName: ''
      });
      
      // Refresh staff list
      fetchAllStaff();
      
    } catch (error: any) {
      console.error('Error adding staff:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add staff member',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const confirmDeleteStaff = (staffId: string) => {
    setStaffToDelete(staffId);
    setShowDeleteDialog(true);
  };
  
  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('store_staff')
        .delete()
        .eq('id', staffToDelete);
      
      if (error) throw error;
      
      toast({
        title: 'Staff Removed',
        description: 'Staff member has been removed successfully'
      });
      
      // Refresh staff list
      fetchAllStaff();
      
    } catch (error: any) {
      console.error('Error removing staff:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove staff member',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
      setStaffToDelete(null);
    }
  };
  
  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch?.name || 'Unknown Branch';
  };
  
  return (
    <div className="space-y-6">
      <form onSubmit={handleAddStaff} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <Label htmlFor="branch">Store</Label>
            <Select
              value={newStaff.branchId}
              onValueChange={(value) => setNewStaff(prev => ({ ...prev, branchId: value }))}
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
              value={newStaff.staffName}
              onChange={(e) => setNewStaff(prev => ({ ...prev, staffName: e.target.value }))}
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
            {staffMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6">
                  No staff members found. Add your first staff member above.
                </TableCell>
              </TableRow>
            ) : (
              staffMembers.map(staff => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">{staff.staffName}</TableCell>
                  <TableCell>{staff.branchName || getBranchName(staff.branchId)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => confirmDeleteStaff(staff.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the staff member from your system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStaff} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageStaffForm;
