
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { QuickRequestFormState, StaffMember } from '@/types/quick-request';

export const useQuickRequestSubmit = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    formState: QuickRequestFormState,
    staffMembers: StaffMember[],
    validateForm: () => boolean
  ) => {
    // Run validation first
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Get items with quantity > 0
      const itemsWithQuantity = formState.ingredients
        .filter(ing => ing.quantity > 0)
        .map(ing => ({
          ingredient_id: ing.id,
          quantity: ing.quantity,
          unit: ing.unit,
          name: ing.name
        }));
      
      // Find staff details
      const selectedStaff = staffMembers.find(s => s.id === formState.staffId);
      
      if (!selectedStaff) {
        throw new Error('Selected staff not found');
      }
      
      const currentTime = new Date().toISOString();
      
      if (formState.action === 'request') {
        await submitRequest(formState, selectedStaff, itemsWithQuantity, currentTime);
      } else if (formState.action === 'stock-update') {
        await submitStockUpdate(formState, selectedStaff, itemsWithQuantity, currentTime);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'There was an error submitting your request',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitRequest = async (
    formState: QuickRequestFormState,
    selectedStaff: StaffMember,
    itemsWithQuantity: any[],
    currentTime: string
  ) => {
    // Create a new request
    const { data, error: requestError } = await supabase
      .from('requests')
      .insert({
        branch_id: formState.branchId,
        user_id: null, // null for public requests
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
      note: `Requested by: ${selectedStaff.staffName}${formState.comment ? ' - ' + formState.comment : ''}`
    }));
    
    const { error: itemsError } = await supabase
      .from('request_items')
      .insert(requestItems);
    
    if (itemsError) throw itemsError;
    
    toast({
      title: 'Request Submitted',
      description: 'Your ingredient request has been submitted successfully'
    });
    
    // Navigate to requests page after successful submission
    navigate('/requests');
  };

  const submitStockUpdate = async (
    formState: QuickRequestFormState,
    selectedStaff: StaffMember,
    itemsWithQuantity: any[],
    currentTime: string
  ) => {
    // Create a new stock check
    const { data, error: stockCheckError } = await supabase
      .from('stock_checks')
      .insert({
        branch_id: formState.branchId,
        user_id: null, // null for public stock checks
        checked_at: currentTime,
      })
      .select('id')
      .single();
    
    if (stockCheckError) throw stockCheckError;
    
    // Insert stock check items
    const stockItems = itemsWithQuantity.map(item => ({
      stock_check_id: data.id,
      ingredient_id: item.ingredient_id,
      on_hand_qty: item.quantity
    }));
    
    const { error: stockItemsError } = await supabase
      .from('stock_check_items')
      .insert(stockItems);
    
    if (stockItemsError) throw stockItemsError;
    
    // Update branch_inventory for immediate reflection
    const branchInventoryUpdates = itemsWithQuantity.map(item => ({
      branch_id: formState.branchId,
      ingredient_id: item.ingredient_id,
      on_hand_qty: item.quantity,
      last_checked: currentTime,
      reorder_pt: 10 // Add default reorder_pt as it's required by the table schema
    }));
    
    // Use string instead of array for onConflict
    const { error: inventoryUpdateError } = await supabase
      .from('branch_inventory')
      .upsert(branchInventoryUpdates, { 
        onConflict: 'branch_id,ingredient_id' 
      });
    
    if (inventoryUpdateError) throw inventoryUpdateError;
    
    toast({
      title: 'Stock Update Submitted',
      description: 'Your stock update has been submitted successfully'
    });
    
    // Navigate to stock check page after successful submission
    navigate('/stock-check?tab=activity');
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
