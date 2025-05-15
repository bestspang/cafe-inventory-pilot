
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStores } from '@/context/StoresContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';
import { useBranchCreate } from '@/hooks/branches/operations/useBranchCreate';

interface CreateStoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateStoreDialog({ open, onOpenChange }: CreateStoreDialogProps) {
  const { refreshStores } = useStores();
  const { user } = useAuth();
  const { createBranch, isLoading } = useBranchCreate();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission from refreshing the page
    
    if (!name.trim()) {
      toast.error('Branch name is required');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to create a branch');
      return;
    }
    
    try {
      console.log('Creating branch for user:', user.id);
      console.log('Branch data:', { name: name.trim(), address: address.trim() });
      
      // Use the dedicated createBranch hook
      const newBranch = await createBranch({
        name: name.trim(),
        address: address.trim(),
        timezone: 'Asia/Bangkok',
        owner_id: user.id
      });
      
      if (newBranch) {
        console.log('Branch successfully created:', newBranch);
        // Refresh stores list to show the new branch
        await refreshStores();
        
        // Reset form and close dialog on success
        setName('');
        setAddress('');
        onOpenChange(false);
        toast.success('Branch created successfully');
      } else {
        console.error('Branch creation returned null');
        toast.error('Failed to create branch - unknown error');
      }
    } catch (error) {
      console.error('Error creating branch:', error);
      toast.error('Failed to create branch');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Branch</DialogTitle>
            <DialogDescription>
              Add a new branch to your account. You can manage inventory, staff, and orders for each branch separately.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Café"
                className="col-span-3"
                required
                autoFocus
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St"
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? 'Creating...' : 'Create Branch'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
