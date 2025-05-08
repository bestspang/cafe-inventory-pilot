
import { toast } from '@/hooks/use-toast';
import { QuickRequestFormState, StaffMember } from '@/types/quick-request';
import { supabase } from '@/integrations/supabase/client';

/**
 * Submits an ingredient request to the database
 */
export const submitRequest = async (
  formState: QuickRequestFormState,
  selectedStaff: StaffMember,
  itemsWithQuantity: any[],
  currentTime: string
): Promise<boolean> => {
  console.log('Submitting request with items:', itemsWithQuantity.length);
  
  try {
    // Create a new request with the staff ID as user_id
    const { data, error: requestError } = await supabase
      .from('requests')
      .insert({
        branch_id: formState.branchId,
        user_id: formState.staffId, // Using staffId directly as the user_id
        status: 'pending',
        requested_at: currentTime
      })
      .select('id')
      .single();
    
    if (requestError) throw requestError;
    
    // Insert request items
    const requestItems = itemsWithQuantity.map(item => ({
      request_id: data.id,
      ingredient_id: item.ingredient_id,
      quantity: item.quantity,
      note: formState.comment ? formState.comment : null
    }));
    
    console.log('Request items to insert:', requestItems);
    
    const { data: insertedItems, error: itemsError } = await supabase
      .from('request_items')
      .insert(requestItems)
      .select('*');
    
    if (itemsError) throw itemsError;
    
    console.log('Inserted items:', insertedItems?.length || 0);
    
    toast({
      title: 'Request Submitted',
      description: `Your ingredient request has been submitted successfully by ${selectedStaff.staffName}`,
    });
    
    return true;
  } catch (error) {
    console.error('Error submitting request:', error);
    throw error;
  }
};
