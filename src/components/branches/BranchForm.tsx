
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Branch } from '@/types/branch';
import { branchFormSchema, BranchFormValues, TIMEZONES } from '@/lib/schemas/branch-schema';

interface BranchFormProps {
  branch: Branch | null;
  isLoading: boolean;
  onSubmit: (data: BranchFormValues) => Promise<void>;
  onCancel: () => void;
}

export default function BranchForm({ 
  branch, 
  isLoading, 
  onSubmit, 
  onCancel 
}: BranchFormProps) {
  // Initialize form with default values
  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      name: '',
      address: '',
      timezone: 'Asia/Bangkok' // Changed default from UTC to Asia/Bangkok
    }
  });
  
  // Update form when editing branch changes
  useEffect(() => {
    if (branch) {
      form.reset({
        name: branch.name || '',
        address: branch.address || '',
        timezone: branch.timezone || 'Asia/Bangkok' // Changed fallback from UTC to Asia/Bangkok
      });
    } else {
      form.reset({
        name: '',
        address: '',
        timezone: 'Asia/Bangkok' // Changed default from UTC to Asia/Bangkok
      });
    }
  }, [branch, form]);

  const handleSubmit = async (data: BranchFormValues) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Branch Name*</FormLabel>
              <FormControl>
                <Input placeholder="Downtown Café" {...field} />
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
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St, City, State" {...field} />
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
              <FormLabel>Timezone*</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a timezone" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TIMEZONES.map((timezone) => (
                    <SelectItem key={timezone} value={timezone}>
                      {timezone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : (branch ? 'Update Branch' : 'Create Branch')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
