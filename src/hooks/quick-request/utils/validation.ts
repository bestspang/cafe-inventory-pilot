
import { toast } from '@/hooks/use-toast';
import { QuickRequestFormState, StaffMember } from '@/types/quick-request';
import { supabase } from '@/integrations/supabase/client';

/**
 * Validates the staff member exists in the database
 */
export const validateStaff = async (
  staffId: string, 
  selectedStaff: StaffMember | undefined
): Promise<boolean> => {
  if (!selectedStaff) {
    toast({
      title: 'Error',
      description: 'Selected staff not found',
      variant: 'destructive'
    });
    return false;
  }
  
  // Verify the selected staff ID exists in store_staff before proceeding
  const { data: staffExists, error: staffError } = await supabase
    .from('store_staff')
    .select('id')
    .eq('id', staffId)
    .single();

  if (staffError || !staffExists) {
    toast({
      title: 'Invalid Staff',
      description: 'Please choose a valid staff member',
      variant: 'destructive'
    });
    return false;
  }
  
  return true;
};

/**
 * Validates form data has required fields
 */
export const validateFormData = (
  formState: QuickRequestFormState,
  itemsWithQuantity: any[]
): boolean => {
  // Check if there are any items with quantity > 0
  if (itemsWithQuantity.length === 0) {
    toast({
      title: 'Missing Information',
      description: 'Please add at least one item with a quantity',
      variant: 'destructive'
    });
    return false;
  }
  
  return true;
};
