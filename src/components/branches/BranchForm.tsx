
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Branch } from '@/types/branch';
import { branchFormSchema, BranchFormValues } from '@/lib/schemas/branch-schema';

interface BranchFormProps {
  branch: Branch | null;
  isLoading: boolean;
  onSubmit: (values: BranchFormValues) => Promise<void>;
  onCancel: () => void;
}

const BranchForm = ({ branch, isLoading, onSubmit, onCancel }: BranchFormProps) => {
  const isEditing = !!branch;
  
  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      name: branch?.name || '',
      address: branch?.address || '',
      timezone: branch?.timezone || 'Asia/Bangkok'
    }
  });

  const handleSubmit = async (values: BranchFormValues) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Error submitting branch form:', error);
      // Form submission errors are handled by the onSubmit callback
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" id="branch-form">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Branch Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter branch name" 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter branch address" 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Asia/Bangkok" 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={(e) => {
              e.preventDefault();
              onCancel();
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? `${isEditing ? 'Updating...' : 'Creating...'}` : `${isEditing ? 'Update' : 'Create'}`}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BranchForm;
